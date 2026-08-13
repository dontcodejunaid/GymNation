import React, { useEffect, useState } from 'react';
import { CheckCircle2, Tag, Zap } from 'lucide-react';
import { GradientCard } from './ui/gradient-card';
import { scrollToSection } from '../lib/scrollToSection';
import { getMemberships, saveMemberships, STORE_KEYS } from '../utils/adminStore';
import { resolvePlanPricing } from '../data/membershipPlans';
import { getMembershipsFromFirebase } from '../firebase';

export default function MembershipPlans({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
  const [plans, setPlans] = useState([]);

  // Load plans from Firebase Cloud Firestore with fallback to LocalStorage/defaults
  useEffect(() => {
    let isMounted = true;
    async function loadPlans() {
      try {
        const fbPlans = await getMembershipsFromFirebase();
        if (fbPlans && fbPlans.length > 0) {
          if (isMounted) setPlans(fbPlans);
          return;
        }
      } catch (err) {
        console.warn('Firebase memberships fetch issue:', err);
      }

      if (isMounted) {
        setPlans(getMemberships());
      }
    }

    loadPlans();

    const handleRefresh = () => loadPlans();
    window.addEventListener('storage', handleRefresh);
    window.addEventListener('gymnation_memberships_updated', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleRefresh);
      window.removeEventListener('gymnation_memberships_updated', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, []);

  const handleChoosePlan = (plan) => {
    // Flatten the resolved price onto the plan — BookingForm reads `.price`.
    const fullPlanData = {
      ...plan,
      ...resolvePlanPricing(plan, billingCycle),
      selectedCycle: billingCycle
    };
    if (onSelectPlan) {
      onSelectPlan(fullPlanData);
    }
    // Scroll smoothly to book-appointment section
    scrollToSection('book-appointment');
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-950 text-slate-100 relative overflow-hidden w-full min-h-[85vh] flex flex-col justify-center" id="membership">
      {/* Background Lighting Glows */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 my-auto">
        {/* Section Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <Zap className="w-3.5 h-3.5 text-orange-500" />
            Membership Plans
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Pick the Plan That Fits <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">Your Goal</span>
          </h2>

          {/* Premium Segmented Toggle Button */}
          <div className="pt-2 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-full bg-slate-900/90 border border-slate-800 shadow-2xl relative">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all duration-300 relative z-10 flex items-center gap-1.5 ${
                  billingCycle === 'monthly'
                    ? 'text-white bg-gradient-to-r from-orange-600 to-amber-600 shadow-md shadow-orange-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-full text-xs font-extrabold transition-all duration-300 relative z-10 flex items-center gap-2 ${
                  billingCycle === 'yearly'
                    ? 'text-white bg-gradient-to-r from-orange-600 to-amber-600 shadow-md shadow-orange-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Yearly Billing</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid using GradientCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch max-w-5xl mx-auto">
          {plans.map((plan) => {
            const pricing = resolvePlanPricing(plan, billingCycle);
            return (
            <div key={plan.id} className="relative group flex flex-col h-full">
              {/* Highlight Glow Border for Most Popular Card */}
              {plan.isFeatured && (
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 rounded-2xl blur-sm opacity-40 group-hover:opacity-75 transition duration-500 pointer-events-none" />
              )}
              
              <GradientCard
                badgeText={plan.badgeText}
                badgeColor={plan.badgeColor}
                title={plan.name}
                description={plan.description}
                gradient={plan.gradient}
                imageUrl={plan.imageUrl}
                ctaText={`Choose ${plan.tier} Plan`}
                onCtaClick={() => handleChoosePlan(plan)}
                className={`h-full flex flex-col justify-between ${plan.isFeatured ? 'border-orange-500/80 shadow-xl shadow-orange-500/20' : ''}`}
              >
                {/* Price Display */}
                <div className="my-3 pb-3 border-b border-slate-800/80 space-y-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-white tracking-tight">{pricing.price}</span>
                    <span className="text-slate-400 text-xs font-semibold">{pricing.period}</span>
                  </div>
                  <p className="text-[11px] text-orange-400/90 font-medium">{pricing.billingNote}</p>
                </div>

                {/* Features Checklist */}
                <div className="space-y-2 my-2 flex-grow">
                  <ul className="space-y-1.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Discount Tag */}
                <div className="mt-3 pt-2 border-t border-slate-800/60">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-amber-300">
                    <Tag className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{plan.discountTag}</span>
                  </div>
                </div>
              </GradientCard>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
