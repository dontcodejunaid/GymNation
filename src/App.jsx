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
import AdminPortal from './components/admin/AdminPortal';
import FloatingActions from './components/ui/floating-actions';
import SplashIntroScreen from './components/SplashIntroScreen';

// Modals
import PaymentModal from './components/PaymentModal';
import DigitalMemberCardModal from './components/DigitalMemberCardModal';
import AnalyticsDashboardModal from './components/AnalyticsDashboardModal';
import PassRecoveryModal from './components/PassRecoveryModal';

import { trackEvent } from './utils/analytics';
import { saveBooking } from './utils/localStorage';
import { saveBookingToFirebase } from './firebase';
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

  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  useEffect(() => {
    trackEvent('PAGE_VIEW');

    try {
      const savedPass = localStorage.getItem('gymnation_member_pass');
      if (savedPass) {
        setActiveMemberPass(JSON.parse(savedPass));
      }
    } catch (e) {
      console.error('Failed to parse stored pass:', e);
    }
  }, []);

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
    const el = document.getElementById('membership');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
      <SplashIntroScreen />

      {/* Offers & Seasonal Discount Banner */}
      <OffersBanner onClaimOffer={handleClaimOffer} />

      <RandomLetterSwapNav onOpenRecovery={() => setIsRecoveryModalOpen(true)} />
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
      <Footer />

      {/* Integrated Floating Action Stack */}
      <FloatingActions
        activeMemberPass={activeMemberPass}
        onOpenPass={() => setIsPassModalOpen(true)}
        onOpenRecovery={() => setIsRecoveryModalOpen(true)}
      />

      <AdminPortal />

      {/* Modals */}
      <PaymentModal
        plan={selectedPlan}
        discountPercent={appliedDiscount}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <DigitalMemberCardModal
        memberData={activeMemberPass}
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        onOpenRecovery={() => {
          setIsPassModalOpen(false);
          setIsRecoveryModalOpen(true);
        }}
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