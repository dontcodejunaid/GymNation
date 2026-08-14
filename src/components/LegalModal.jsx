import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, FileText, CheckCircle2, Lock, ChevronRight } from 'lucide-react';
import logoImg from '../assets/logo.png';

export default function LegalModal({ isOpen, onClose, defaultTab = 'terms' }) {
  const [activeTab, setActiveTab] = useState(defaultTab); // 'terms' | 'privacy'

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab || 'terms');
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-md px-4 py-6 animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-black text-white border border-slate-800/80 rounded-3xl shadow-2xl shadow-orange-500/10 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="relative border-b border-slate-800/80 p-6 pb-4 bg-slate-950/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="GymNation" className="h-10 w-auto object-contain" />
            <div>
              <h2 className="font-teko text-2xl tracking-wider text-white leading-none">
                GYM<span className="text-orange-500">NATION</span> LEGAL & GOVERNANCE
              </h2>
              <p className="text-xs text-slate-400">GymNation Fitness Centre, Electronic City, Bengaluru</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 sm:static text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/40 px-6 pt-3 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'terms'
                ? 'bg-black text-orange-400 border-orange-500 shadow-sm'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            Terms of Service
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'privacy'
                ? 'bg-black text-orange-400 border-orange-500 shadow-sm'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-900/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-slate-300 leading-relaxed custom-scrollbar">
          {activeTab === 'terms' ? (
            /* TERMS OF SERVICE DOCUMENT */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white tracking-wide">Terms of Service & Rules of Conduct</h3>
                <p className="text-xs text-slate-500 mt-1">Effective Date: January 1, 2026 | Last Revised: August 2026</p>
              </div>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-orange-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs">1</span>
                  Membership & Facility Access
                </h4>
                <p className="pl-8 text-slate-400 text-xs sm:text-sm">
                  By registering or renewing a membership at GymNation Fitness Centre (Electronic City, Bengaluru), you agree to abide by all facility rules and regulations. Members must present their digital QR pass or registered phone number upon entering the premises.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-orange-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs">2</span>
                  Safety, Hygiene & Etiquette
                </h4>
                <div className="pl-8 text-slate-400 text-xs sm:text-sm space-y-2">
                  <p>• <strong>Attire:</strong> Athletic footwear and appropriate gym apparel are mandatory at all times. Open-toed shoes or street wear are strictly prohibited on the workout floor.</p>
                  <p>• <strong>Equipment Usage:</strong> Re-rack all dumbbells, weight plates, and barbells after completing your set. Wipe down machines using provided sanitizer wipes after use.</p>
                  <p>• <strong>Locker Rooms & Amenities:</strong> Locker facilities are available for daily use only. GymNation is not liable for lost or stolen personal belongings.</p>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-orange-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs">3</span>
                  Billing, Subscriptions & Renewals
                </h4>
                <p className="pl-8 text-slate-400 text-xs sm:text-sm">
                  Membership fees are charged on a monthly, quarterly, semi-annual, or annual cycle depending on your chosen plan. All payments are processed securely. Membership fees are non-refundable except where explicitly required by law or approved by management.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-orange-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs">4</span>
                  Personal Training & Class Cancellations
                </h4>
                <p className="pl-8 text-slate-400 text-xs sm:text-sm">
                  Group fitness classes and 1-on-1 personal training slots must be scheduled in advance. Cancellations require at least 4 hours notice to allow rebooking for other gym members.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-orange-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 flex items-center justify-center text-xs">5</span>
                  Health & Medical Disclaimer
                </h4>
                <p className="pl-8 text-slate-400 text-xs sm:text-sm">
                  Members acknowledge that physical exercise involves inherent risk of injury. Members confirm they are in adequate physical condition to engage in strenuous workouts. Consult your physician before commencing any intensive physical regime.
                </p>
              </section>
            </div>
          ) : (
            /* PRIVACY POLICY DOCUMENT */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white tracking-wide">Privacy Policy & Data Security</h3>
                <p className="text-xs text-slate-500 mt-1">Effective Date: January 1, 2026 | Last Revised: August 2026</p>
              </div>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">1</span>
                  Information We Collect
                </h4>
                <p className="pl-8 text-slate-400 text-xs sm:text-sm">
                  We collect personal details necessary to provide you with seamless fitness services, including your name, phone number, email address, emergency contact, membership pass tier, and check-in history.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">2</span>
                  How Your Data Is Used
                </h4>
                <div className="pl-8 text-slate-400 text-xs sm:text-sm space-y-2">
                  <p>• Generate and verify digital QR membership access cards.</p>
                  <p>• Dispatch booking confirmations, class updates, and expiry reminders via SMS/WhatsApp.</p>
                  <p>• Maintain member safety and attendance records in accordance with local regulations.</p>
                </div>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">3</span>
                  Zero Third-Party Sharing Policy
                </h4>
                <p className="pl-8 text-slate-400 text-xs sm:text-sm">
                  GymNation maintains a strict confidentiality policy. Your personal data is never sold, rented, or shared with third-party advertisers or telemarketers under any circumstances.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">4</span>
                  Data Security & Encryption
                </h4>
                <p className="pl-8 text-slate-400 text-xs sm:text-sm">
                  All digital records are protected using industry-standard SSL/TLS encryption and stored on secure cloud database servers with multi-factor authentication controls.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs">5</span>
                  Your Privacy Rights & Contact
                </h4>
                <p className="pl-8 text-slate-400 text-xs sm:text-sm">
                  You have the right to request a copy of your stored member data or request updates to your profile at any time by speaking with our front desk team or contacting support at <span className="text-orange-400 font-mono">support@gymnation.com</span>.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="border-t border-slate-800/80 p-4 sm:p-5 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Official GymNation Document</span>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            I UNDERSTAND & ACCEPT
          </button>
        </div>
      </div>
    </div>
  );
}
