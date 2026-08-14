import React, { useState, useEffect } from 'react';
import { Clock, X, ArrowRight } from 'lucide-react';
import { getOfferData, saveOfferData, DEFAULT_OFFER_DATA, computeOfferExpiryTimestamp } from '../utils/adminStore';
import { getOfferFromFirebase, subscribeToOfferFromFirebase } from '../firebase';

export default function OffersBanner({ onClaimOffer }) {
  const [isVisible, setIsVisible] = useState(true);
  const [offerData, setOfferData] = useState(() => getOfferData());

  const calculateRemaining = (data) => {
    if (!data) return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    
    let targetTime = null;
    if (data.targetEndDate) {
      const ts = new Date(data.targetEndDate).getTime();
      if (!isNaN(ts)) targetTime = ts;
    }
    
    if (!targetTime && data.timerExpiryTimestamp) {
      targetTime = data.timerExpiryTimestamp;
    }

    if (targetTime) {
      const now = Date.now();
      const diff = targetTime - now;
      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return { days: d, hours: h, minutes: m, seconds: s, isExpired: false };
    }

    // Fallback if no target timestamp set yet
    const d = Number(data.timerDays || 0);
    const h = Number(data.timerHours || 0);
    const m = Number(data.timerMinutes || 0);
    const s = Number(data.timerSeconds || 0);
    const isExpired = d <= 0 && h <= 0 && m <= 0 && s <= 0;
    return { days: d, hours: h, minutes: m, seconds: s, isExpired };
  };

  const [timeLeft, setTimeLeft] = useState(() => calculateRemaining(offerData));

  // Sync state from admin store & Firebase
  useEffect(() => {
    let isMounted = true;

    const syncOfferState = async () => {
      try {
        const cloudData = await getOfferFromFirebase();
        if (isMounted && cloudData) {
          const merged = { ...DEFAULT_OFFER_DATA, ...getOfferData(), ...cloudData };
          saveOfferData(merged);
          setOfferData(merged);
        }
      } catch (err) {
        console.warn('Could not fetch offer data from Firebase:', err);
      }
    };

    syncOfferState();

    const handleLocalUpdate = () => {
      if (!isMounted) return;
      const latest = getOfferData();
      setOfferData(latest);
    };

    const unsubscribeFirebase = subscribeToOfferFromFirebase((cloudOffer) => {
      if (!isMounted || !cloudOffer) return;
      const merged = { ...DEFAULT_OFFER_DATA, ...getOfferData(), ...cloudOffer };
      saveOfferData(merged);
      setOfferData(merged);
    });

    window.addEventListener('storage', handleLocalUpdate);
    window.addEventListener('gymnation_offer_updated', handleLocalUpdate);

    return () => {
      isMounted = false;
      unsubscribeFirebase();
      window.removeEventListener('storage', handleLocalUpdate);
      window.removeEventListener('gymnation_offer_updated', handleLocalUpdate);
    };
  }, []);

  // Countdown timer tick effect based on absolute target timestamp
  useEffect(() => {
    const updateTimer = () => {
      const rem = calculateRemaining(offerData);
      setTimeLeft(rem);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [offerData]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible || offerData.enabled === false || timeLeft.isExpired) return null;

  return (
    <div id="special-offers-banner" className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white text-xs py-2.5 px-4 sm:px-6 shadow-md z-40 border-b border-orange-400/30">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        
        {/* Left Offer Text & Badge */}
        <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap sm:flex-nowrap">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black uppercase text-[10px] tracking-wider shrink-0 shadow-sm">
            {offerData.badgeText || 'SPECIAL OFFER'}
          </span>
          <p className="font-extrabold text-white text-xs sm:text-sm tracking-tight">
            {offerData.title}{' '}
            <span className="underline decoration-white/70">{offerData.highlightText}</span>{' '}
            {offerData.subText}
          </p>
        </div>

        {/* Right Section: Timer, Claim Button & Close */}
        <div className="flex items-center justify-center gap-3 shrink-0">
          <div className="hidden md:flex items-center gap-1 font-mono text-[11px] bg-slate-950/50 px-3 py-1 rounded-lg border border-white/20 text-slate-100 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-300 mr-1" />
            <span>{String(timeLeft.days || 0).padStart(2, '0')}d</span>:
            <span>{String(timeLeft.hours || 0).padStart(2, '0')}h</span>:
            <span>{String(timeLeft.minutes || 0).padStart(2, '0')}m</span>:
            <span className="text-amber-300 font-bold">{String(timeLeft.seconds || 0).padStart(2, '0')}s</span>
          </div>

          <button
            onClick={() => onClaimOffer && onClaimOffer(offerData.promoCode || 'FIT2026', offerData.discountPercent ?? 20)}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs transition-all duration-200 flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 shrink-0"
          >
            <span>{offerData.buttonText || 'Claim Offer'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors shrink-0"
            title="Dismiss offer banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
