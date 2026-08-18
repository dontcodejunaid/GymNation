import React, { useState, useEffect } from 'react';
import RandomLetterSwapNav from './components/ui/m-random-letter-swap-1';
import OffersBanner from './components/OffersBanner';
import Hero from './components/Hero';
import About from './components/About';
import BMICalculator from './components/BMICalculator';
import Trainers from './components/Trainers';
import ClassSchedule from './components/ClassSchedule';
import Facilities from './components/Facilities';
import ReferralProgram from './components/ReferralProgram';
import MembershipPlans from './components/MembershipPlans';
import SocialProofFeed from './components/SocialProofFeed';
import Gallery from './components/Gallery';
import Testimonials from './components/TestimonialsSection';
import ProgressTracker from './components/ProgressTracker';
import BookingForm from './components/BookingForm';
import Footer from './components/Footer';
import ContactPage from './components/ContactPage';
import AdminPortal from './components/admin/AdminPortal';
import FloatingActions from './components/ui/floating-actions';
import SplashIntroScreen from './components/SplashIntroScreen';

// Modals
import PaymentModal from './components/PaymentModal';
import DigitalMemberCardModal from './components/DigitalMemberCardModal';
import AnalyticsDashboardModal from './components/AnalyticsDashboardModal';
import PassRecoveryModal from './components/PassRecoveryModal';
import GymNationAuthModal from './components/GymNationAuthModal';
import LegalModal from './components/LegalModal';

import { trackEvent } from './utils/analytics';
import { saveBooking } from './utils/localStorage';
import { saveBookingToFirebase, getMemberPassFromFirebase } from './firebase';
import { recordMembershipSignup } from './utils/membershipSignups';
import { withPassPrefix } from './utils/passId';

function App() {
  const [_selectedTrainer, setSelectedTrainer] = useState(null);
  const [_selectedClass, setSelectedClass] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const [activeMemberPass, setActiveMemberPass] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState('terms');

  const [currentUser, setCurrentUser] = useState(null);

  const getInitialPage = () => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/contact' || hash === '#contact' || hash === '#/contact' || hash === '#contact-page') {
      return 'contact';
    }
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);

  const handleOpenLegal = (tab = 'terms') => {
    setLegalModalTab(tab);
    setIsLegalModalOpen(true);
  };

  // Trigger Auth Modal right after Splash animation ends only if NOT already logged in
  const handleSplashFinish = () => {
    try {
      const savedUser = localStorage.getItem('gymnation_user');
      if (!savedUser && !currentUser) {
        setIsAuthModalOpen(true);
      }
    } catch (e) {
      if (!currentUser) {
        setIsAuthModalOpen(true);
      }
    }
  };

  useEffect(() => {
    trackEvent('PAGE_VIEW');

    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/contact' || hash === '#contact' || hash === '#/contact' || hash === '#contact-page') {
        setCurrentPage('contact');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    try {
      const savedPass = localStorage.getItem('gymnation_member_pass');
      if (savedPass) {
        setActiveMemberPass(JSON.parse(savedPass));
      }
    } catch (e) {
      console.error('Failed to parse stored pass:', e);
    }

    try {
      const savedUser = localStorage.getItem('gymnation_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        // Automatically sync latest pass from Firebase for logged in user
        getMemberPassFromFirebase(parsed).then((cloudPass) => {
          if (cloudPass) {
            setActiveMemberPass(cloudPass);
            try {
              localStorage.setItem('gymnation_member_pass', JSON.stringify(cloudPass));
            } catch (err) {}
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.error('Failed to parse stored user:', e);
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const handleNavigate = (pathOrId) => {
    const target = pathOrId ? pathOrId.trim() : '/home';
    if (target === '/contact' || target === '#contact' || target === 'contact') {
      setCurrentPage('contact');
      if (window.history.pushState) {
        window.history.pushState({ page: 'contact' }, '', '/contact');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const sectionId = target.startsWith('#') ? target : '#' + target.replace('/', '');
    const cleanPath = target.startsWith('/') ? target : '/' + target.replace('#', '');

    if (currentPage !== 'home') {
      setCurrentPage('home');
      if (window.history.pushState) {
        window.history.pushState({ page: 'home' }, '', cleanPath);
      }
      setTimeout(() => {
        const element = document.querySelector(sectionId);
        if (element) {
          const block = sectionId === '#bmi-calculator' ? 'center' : 'start';
          element.scrollIntoView({ behavior: 'smooth', block });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 80);
    } else {
      if (window.history.pushState) {
        window.history.pushState(null, '', cleanPath);
      }
      const element = document.querySelector(sectionId);
      if (element) {
        const block = sectionId === '#bmi-calculator' ? 'center' : 'start';
        element.scrollIntoView({ behavior: 'smooth', block });
      }
    }
  };

  const handleSelectTrainer = (trainer) => {
    setSelectedTrainer(trainer);
  };

  const handleSelectClass = (classItem) => {
    setSelectedClass(classItem);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleClaimOffer = (code, discountPercent) => {
    setAppliedDiscount(discountPercent);
    handleNavigate('#membership');
  };

  const handlePaymentSuccess = async (memberData) => {
    setActiveMemberPass(memberData);
    setIsPaymentModalOpen(false);
    setIsPassModalOpen(true);

    const rawPaymentId = memberData.paymentResult?.paymentId || '';
    const cleanPaymentId = withPassPrefix(rawPaymentId);
    const bookingRecord = {
      id: rawPaymentId ? cleanPaymentId.toUpperCase() : `GN-${Math.floor(10000 + Math.random() * 90000)}`,
      name: memberData.customer?.name || 'Gymnation Member',
      phone: memberData.customer?.phone || '',
      email: memberData.customer?.email || '',
      service: memberData.plan?.name || 'Gymnation Membership Pass',
      date: memberData.date || new Date().toISOString().split('T')[0],
      time: memberData.time || 'All Day Access',
      trainer: memberData.trainer || 'Unassigned',
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    saveBooking(bookingRecord);

    try {
      await saveBookingToFirebase(bookingRecord);
    } catch (err) {
      console.warn('Failed to save payment booking to Firebase:', err);
    }

    // Register the buyer in the owner's Memberships tab / Firestore register.
    try {
      await recordMembershipSignup({
        customer: memberData.customer,
        plan: memberData.plan,
        pricing: memberData.pricing,
        paymentResult: memberData.paymentResult,
        source: 'Online Payment',
      });
    } catch (err) {
      console.warn('Failed to record membership signup:', err);
    }

    try {
      localStorage.setItem('gymnation_member_pass', JSON.stringify(memberData));
    } catch (e) {
      console.error('Failed to save member pass:', e);
    }
  };

  const handlePassRecovered = (recoveredPass) => {
    setActiveMemberPass(recoveredPass);
    setIsPassModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white">
      {/* Splash Opening Landing Screen on Reload */}
      <SplashIntroScreen onFinish={handleSplashFinish} />

      {/* Offers & Seasonal Discount Banner */}
      <OffersBanner onClaimOffer={handleClaimOffer} />

      <RandomLetterSwapNav
        currentUser={currentUser}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenPass={() => setIsPassModalOpen(true)}
        onOpenRecovery={() => setIsRecoveryModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {currentPage === 'contact' ? (
        <ContactPage
          onNavigate={handleNavigate}
          onOpenLegal={handleOpenLegal}
          onSelectPlan={handleSelectPlan}
        />
      ) : (
        <>
          <Hero />
          <About />
          <BMICalculator />
          <Trainers onSelectTrainer={handleSelectTrainer} />
          <ClassSchedule onSelectClass={handleSelectClass} />
          <Facilities />
          <ReferralProgram />
          <MembershipPlans onSelectPlan={handleSelectPlan} />
          
          {/* Google Reviews & Instagram Live Feed */}
          <SocialProofFeed />

          <Gallery />
          <Testimonials />
          <ProgressTracker />
          <BookingForm selectedPlan={selectedPlan} selectedClass={_selectedClass} onClearPlan={() => setSelectedPlan(null)} onClearClass={() => setSelectedClass(null)} />
          <Footer onOpenLegal={handleOpenLegal} onNavigate={handleNavigate} />
        </>
      )}

      {/* Integrated Floating Action Stack */}
      <FloatingActions
        currentUser={currentUser}
        activeMemberPass={activeMemberPass}
        onOpenPass={() => setIsPassModalOpen(true)}
        onOpenRecovery={() => setIsRecoveryModalOpen(true)}
      />

      <AdminPortal />

      {/* Modals */}
      <GymNationAuthModal
        isOpen={isAuthModalOpen}
        currentUser={currentUser}
        onClose={() => {
          setIsAuthModalOpen(false);
          try {
            sessionStorage.setItem('gymnation_auth_dismissed', 'true');
          } catch (e) {}
        }}
        onLoginSuccess={async (user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          // Automatically load user's digital pass from Firebase immediately on login
          try {
            const cloudPass = await getMemberPassFromFirebase(user);
            if (cloudPass) {
              setActiveMemberPass(cloudPass);
              localStorage.setItem('gymnation_member_pass', JSON.stringify(cloudPass));
            }
          } catch (e) {
            console.warn('Error loading user pass on login:', e);
          }
        }}
        onLogoutSuccess={() => {
          setCurrentUser(null);
          setActiveMemberPass(null);
          try {
            localStorage.removeItem('gymnation_member_pass');
          } catch (e) {}
        }}
        onOpenLegal={handleOpenLegal}
      />

      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        defaultTab={legalModalTab}
      />

      <PaymentModal
        plan={selectedPlan}
        discountPercent={appliedDiscount}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <DigitalMemberCardModal
        memberData={activeMemberPass}
        currentUser={currentUser}
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onOpenRecovery={!currentUser ? () => {
          setIsPassModalOpen(false);
          setIsRecoveryModalOpen(true);
        } : undefined}
      />

      <PassRecoveryModal
        isOpen={isRecoveryModalOpen}
        onClose={() => setIsRecoveryModalOpen(false)}
        onPassRecovered={handlePassRecovered}
      />

      <AnalyticsDashboardModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />
    </div>
  );
}

import ErrorBoundary from './components/ui/ErrorBoundary';

function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWrapper;