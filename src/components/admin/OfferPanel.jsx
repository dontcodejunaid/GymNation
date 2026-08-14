import React, { useState, useEffect } from 'react';
import { Tag, Save, RotateCcw, Clock, Sparkles, ArrowRight, Eye, CheckCircle2, Loader2, Bookmark } from 'lucide-react';
import {
  getOfferData, saveOfferData, resetOfferData,
  getDefaultOfferData, setDefaultOfferData, DEFAULT_OFFER_DATA,
  computeOfferExpiryTimestamp
} from '../../utils/adminStore';
import {
  getOfferFromFirebase, saveOfferToFirebase, subscribeToOfferFromFirebase,
  getDefaultOfferFromFirebase, saveDefaultOfferToFirebase
} from '../../firebase';
import AdminConfirmModal from './AdminConfirmModal';

export default function OfferPanel() {
  const [data, setData] = useState(() => getOfferData());
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState('Special Offer banner updates have been published and synced live across your website.');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sync state with Firebase and Local Storage on mount and on updates
  useEffect(() => {
    let isMounted = true;

    const syncOfferState = async () => {
      try {
        const cloudData = await getOfferFromFirebase();
        if (isMounted && cloudData) {
          const merged = { ...DEFAULT_OFFER_DATA, ...getOfferData(), ...cloudData };
          saveOfferData(merged);
          setData(merged);
        }
      } catch (err) {
        console.warn('Could not sync offer data from Firebase in OfferPanel:', err);
      }
    };

    syncOfferState();

    const unsubscribeFirebase = subscribeToOfferFromFirebase((cloudOffer) => {
      if (!isMounted || !cloudOffer) return;
      const merged = { ...DEFAULT_OFFER_DATA, ...getOfferData(), ...cloudOffer };
      saveOfferData(merged);
      setData(merged);
    });

    const handleLocalUpdate = () => {
      if (!isMounted) return;
      setData(getOfferData());
    };

    window.addEventListener('storage', handleLocalUpdate);
    window.addEventListener('gymnation_offer_updated', handleLocalUpdate);

    return () => {
      isMounted = false;
      unsubscribeFirebase();
      window.removeEventListener('storage', handleLocalUpdate);
      window.removeEventListener('gymnation_offer_updated', handleLocalUpdate);
    };
  }, []);

  const updateField = (key, value) => {
    setData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const dataWithTs = {
      ...data,
      timerExpiryTimestamp: computeOfferExpiryTimestamp(data)
    };
    saveOfferData(dataWithTs);
    await saveOfferToFirebase(dataWithTs);
    setData(dataWithTs);
    setIsSaving(false);
    setSuccessModalMessage('Special Offer banner updates have been published and synced live across your website.');
    setShowSuccessModal(true);
  };

  const handleSetDefault = async () => {
    setIsSaving(true);
    const dataWithTs = {
      ...data,
      timerExpiryTimestamp: computeOfferExpiryTimestamp(data)
    };
    setDefaultOfferData(dataWithTs);
    await saveDefaultOfferToFirebase(dataWithTs);
    setIsSaving(false);
    setSuccessModalMessage('Custom Default Offer Saved! When you click Reset Defaults or start a fresh session, this offer will be restored.');
    setShowSuccessModal(true);
  };

  const handleReset = async () => {
    setIsSaving(true);
    let targetDefault = getDefaultOfferData();
    try {
      const cloudDefault = await getDefaultOfferFromFirebase();
      if (cloudDefault) {
        targetDefault = { ...DEFAULT_OFFER_DATA, ...cloudDefault };
        setDefaultOfferData(targetDefault);
      }
    } catch (err) {
      console.warn('Could not fetch default offer from Firebase:', err);
    }

    saveOfferData(targetDefault);
    await saveOfferToFirebase(targetDefault);
    setData(targetDefault);
    setIsSaving(false);
    setShowResetConfirm(false);
    setSuccessModalMessage('Special offer has been reset back to default settings!');
    setShowSuccessModal(true);
  };

  const isPreviewExpired =
    Number(data.timerDays || 0) <= 0 &&
    Number(data.timerHours || 0) <= 0 &&
    Number(data.timerMinutes || 0) <= 0 &&
    Number(data.timerSeconds || 0) <= 0;

  return (
    <div className="space-y-8">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-orange-400 font-extrabold text-xs uppercase tracking-wider">
            <Tag className="w-4 h-4" />
            <span>Promotion & Announcement Bar</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">Special Offer Settings</h2>
          <p className="text-sm text-slate-400 mt-1">
            Customize the top announcement bar offer, discount percentage, promo code, and countdown timer.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Reset active offer banner back to default offer settings"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          
          <button
            type="button"
            onClick={handleSetDefault}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Set current inputs as the custom default offer"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Set As Default</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'Saving...' : 'Save Offer Settings'}</span>
          </button>
        </div>
      </div>

      {/* Live Preview Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <Eye className="w-4 h-4 text-orange-400" />
            <span>Live Website Banner Preview</span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
            isPreviewExpired
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : data.enabled
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isPreviewExpired ? '⏱ Expired (Banner Auto-Hidden)' : data.enabled ? '● Active on Website' : '○ Banner Hidden'}
          </span>
        </div>

        {/* Render Banner Mockup */}
        <div className={`w-full rounded-xl overflow-hidden shadow-md transition-all ${
          data.enabled && !isPreviewExpired ? 'opacity-100' : 'opacity-40 grayscale-[50%]'
        }`}>
          <div className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white text-xs py-2.5 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap sm:flex-nowrap">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black uppercase text-[10px] tracking-wider shrink-0">
                  {data.badgeText || 'SPECIAL OFFER'}
                </span>
                <p className="font-extrabold text-white text-xs sm:text-sm tracking-tight">
                  {data.title}{' '}
                  <span className="underline decoration-white/70">{data.highlightText}</span>{' '}
                  {data.subText}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 shrink-0">
                <div className="hidden md:flex items-center gap-1 font-mono text-[11px] bg-slate-950/50 px-3 py-1 rounded-lg border border-white/20 text-slate-100">
                  <Clock className="w-3.5 h-3.5 text-amber-300 mr-1" />
                  <span>{String(data.timerDays || 0).padStart(2, '0')}d</span>:
                  <span>{String(data.timerHours || 0).padStart(2, '0')}h</span>:
                  <span>{String(data.timerMinutes || 0).padStart(2, '0')}m</span>:
                  <span className="text-amber-300 font-bold">{String(data.timerSeconds || 0).padStart(2, '0')}s</span>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-white text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md">
                  <span>{data.buttonText || 'Claim Offer'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Section 1: Offer Text & Branding */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Offer Copy & Branding</span>
            </h3>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-400">Show Banner</span>
              <input
                type="checkbox"
                checked={!!data.enabled}
                onChange={(e) => updateField('enabled', e.target.checked)}
                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
              />
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Badge Tag Text
              </label>
              <input
                type="text"
                value={data.badgeText || ''}
                onChange={(e) => updateField('badgeText', e.target.value)}
                placeholder="e.g. SPECIAL OFFER, LIMITED TIME, FESTIVE DEAL"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Headline / Title Prefix
              </label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. 🎉 NEW YEAR TRANSFORM:"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Highlighted Offer Text (Underlined)
              </label>
              <input
                type="text"
                value={data.highlightText || ''}
                onChange={(e) => updateField('highlightText', e.target.value)}
                placeholder="e.g. 20% OFF ALL ANNUAL PLANS"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Secondary Detail Text
              </label>
              <input
                type="text"
                value={data.subText || ''}
                onChange={(e) => updateField('subText', e.target.value)}
                placeholder="e.g. + FREE 1-ON-1 PT SESSION!"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Promo Claim Button & Timer */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Promo Code & Countdown Timer</span>
            </h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Button Label
                </label>
                <input
                  type="text"
                  value={data.buttonText || ''}
                  onChange={(e) => updateField('buttonText', e.target.value)}
                  placeholder="e.g. Claim 20% Off"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Promo Code
                </label>
                <input
                  type="text"
                  value={data.promoCode || ''}
                  onChange={(e) => updateField('promoCode', e.target.value.toUpperCase())}
                  placeholder="e.g. FIT2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Discount %
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={data.discountPercent ?? 20}
                  onChange={(e) => updateField('discountPercent', Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* Countdown Duration Fields */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Countdown Timer Duration
              </label>
              
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 mb-1">Days</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={data.timerDays ?? 2}
                    onChange={(e) => updateField('timerDays', Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 mb-1">Hours</span>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={data.timerHours ?? 14}
                    onChange={(e) => updateField('timerHours', Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 mb-1">Minutes</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={data.timerMinutes ?? 32}
                    onChange={(e) => updateField('timerMinutes', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-slate-400 mb-1">Seconds</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={data.timerSeconds ?? 45}
                    onChange={(e) => updateField('timerSeconds', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-center text-sm font-mono text-amber-300 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Expiry Date (Optional Deadline Override)
              </label>
              <input
                type="datetime-local"
                value={data.targetEndDate || ''}
                onChange={(e) => updateField('targetEndDate', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                If left empty, the timer uses the relative Days/Hours/Minutes/Seconds set above.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Success Notification Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">Action Completed!</h4>
              <p className="text-xs text-slate-400 mt-1">
                {successModalMessage}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs transition-colors"
            >
              OK, Got it!
            </button>
          </div>
        </div>
      )}

      {/* Confirm Reset Modal */}
      {showResetConfirm && (
        <AdminConfirmModal
          isOpen={showResetConfirm}
          title="Reset Active Special Offer?"
          message="Are you sure you want to reset the active banner back to the default offer settings?"
          confirmText="Yes, Reset Offer"
          confirmVariant="danger"
          onConfirm={handleReset}
          onClose={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}
