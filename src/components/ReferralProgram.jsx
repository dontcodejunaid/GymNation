import React, { useState, useEffect } from 'react';
import { 
  Gift, Users, Copy, Check, Share2, Sparkles, Trophy, 
  ArrowRight, HeartHandshake, ShieldCheck, Zap
} from 'lucide-react';
import { ShinyButton } from './ui/shiny-button';
import { WhatsAppConfig } from '../utils/whatsapp';

export default function ReferralProgram() {
  const [userCode, setUserCode] = useState('');
  const [userName, setUserName] = useState('');
  const [copied, setCopied] = useState(false);
  const [referralCount, setReferralCount] = useState(0);

  // Generate or load unique referral code
  useEffect(() => {
    try {
      let code = localStorage.getItem('gymnation_referral_code');
      let count = localStorage.getItem('gymnation_referral_count') || '0';
      
      if (!code) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        code = `FITFREE-${randomNum}`;
        localStorage.setItem('gymnation_referral_code', code);
      }
      setUserCode(code);
      setReferralCount(parseInt(count, 10));
    } catch (e) {
      setUserCode('FITFREE-9901');
    }
  }, []);

  const handleNameChange = (e) => {
    const val = e.target.value;
    setUserName(val);
    if (val.trim()) {
      const cleanName = val.trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6);
      const newCode = `FIT-${cleanName || 'HERO'}-${Math.floor(100 + Math.random() * 900)}`;
      setUserCode(newCode);
      try {
        localStorage.setItem('gymnation_referral_code', newCode);
      } catch (err) {}
    }
  };

  const shareText = `Hey! Join Gymnation Gym with my referral code ${userCode} & get 1 Month FREE on your annual membership. Sign up here: https://gymnation.gym/book?ref=${userCode}`;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=&text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="referral-program" className="scroll-mt-20 py-16 sm:py-20 bg-slate-950 text-slate-100 relative overflow-hidden w-full border-t border-slate-800/80">
      
      {/* Background Lighting Orbs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-extrabold uppercase tracking-wider">
            <Gift className="w-4 h-4 text-orange-500 animate-bounce" />
            Exclusive Member Perk
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Refer A Friend, Get <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">1 Month Free</span>
          </h2>
          
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Give your friends a <strong>1 Month Free Pass</strong> when they join Gymnation Gym. Every friend who registers unlocks 1 Month FREE extended to your membership!
          </p>
        </div>

        {/* Core Referral Generator Box */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Code Card */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500" />
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Personalize Your Referral Link & Code
              </label>
              <input
                type="text"
                placeholder="Enter your name (e.g., Alex)"
                value={userName}
                onChange={handleNameChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-semibold text-sm focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Generated Code Display */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-orange-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
              <div className="text-center sm:text-left">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 block">Your Shareable Code</span>
                <span className="text-2xl font-black text-orange-400 tracking-wider font-mono">{userCode}</span>
              </div>

              <div className="flex items-stretch gap-3 w-full sm:w-auto shrink-0 justify-center">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-extrabold flex items-center justify-center gap-2 border border-orange-500/40 hover:border-orange-500/70 transition-all active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <Copy className="w-4 h-4 text-orange-400 shrink-0" />}
                  <span className="whitespace-nowrap">{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
                >
                  <Share2 className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Share WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-orange-400" />
                Successful Referrals: <strong className="text-white">{referralCount}</strong>
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {referralCount} Month(s) Earned
              </span>
            </div>
          </div>

          {/* How It Works Steps */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-400" />
              How You Get 1 Month Free:
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-black shrink-0">1</div>
                <div>
                  <strong className="text-white block font-bold text-sm">Share Your Code</strong>
                  <span className="text-slate-400">Send your code or WhatsApp link to friends, family & workout buddies.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black shrink-0">2</div>
                <div>
                  <strong className="text-white block font-bold text-sm">Friend Registers</strong>
                  <span className="text-slate-400">Your friend presents your code when booking a free trial or membership.</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black shrink-0">3</div>
                <div>
                  <strong className="text-white block font-bold text-sm">Both Get Rewarded</strong>
                  <span className="text-slate-400">Your friend gets 1 Month Free on annual plans & 1 Month is added to your pass!</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
