import React, { useState, useEffect } from 'react';
import {
  Clock, Dumbbell, ShieldCheck, Users, Award, ChevronRight, Zap, Lightbulb, Gift
} from 'lucide-react';
import dumbbellBg from '../assets/dumbbell-bg.png';
import Component from './ui/gradient-bars-background';
import { LayeredText } from './ui/layered-text';
import { ShinyButton } from './ui/shiny-button';
import { scrollToSection } from '../lib/scrollToSection';
import NutritionHubModal from './NutritionHubModal';

export default function Hero() {
  const [isOpen, setIsOpen] = useState(false);
  const [nextStatusText, setNextStatusText] = useState('');
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);

  useEffect(() => {
    const updateGymClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const isMorningShift = hours >= 6 && hours < 13;
      const isEveningShift = hours >= 17 && hours < 22;

      if (isMorningShift || isEveningShift) {
        setIsOpen(true);
        setNextStatusText('OPEN NOW (Closes ' + (isMorningShift ? '1:00 PM' : '10:00 PM') + ')');
      } else {
        setIsOpen(false);
        if (hours < 6) {
          setNextStatusText('OPENS TODAY AT 6:00 AM');
        } else if (hours >= 13 && hours < 17) {
          setNextStatusText('OPENS TODAY AT 5:00 PM');
        } else {
          setNextStatusText('OPENS TOMORROW AT 6:00 AM');
        }
      }
    };

    updateGymClock();
    const interval = setInterval(updateGymClock, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const stats = [
    { label: 'Years Active', value: '5', icon: Award },
    { label: 'Members Trained', value: '1,200+', icon: Users },
    { label: 'Certified Trainers', value: '8', icon: ShieldCheck },
    { label: 'Pieces of Equipment', value: '50+', icon: Dumbbell },
  ];

  return (
    <>
      <div id="home" className="relative min-h-screen w-full bg-slate-950 overflow-hidden">

        {/* Background Dumbbell Image positioned in top dark area */}
        <div className="absolute top-0 left-0 right-0 h-[65vh] z-0 overflow-hidden pointer-events-none">
          <img
            src={dumbbellBg}
            alt="Gym Dumbbells Background"
            className="w-full h-full object-cover object-center opacity-85 brightness-110 contrast-125 scale-105"
          />
          {/* Soft Vignette Overlay to merge with dark theme */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/40 to-slate-950" />
        </div>

        {/* Absolute Top Left Corner TIPS Button */}
        <div className="absolute top-3 left-4 sm:top-5 sm:left-8 z-30">
          <ShinyButton
            onClick={() => setIsNutritionModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-orange-600/40 backdrop-blur-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-orange-400/50"
          >
            <Lightbulb className="w-4 h-4 text-white fill-white" />
            <span className="font-black tracking-widest text-[11px] text-white">TIPS</span>
          </ShinyButton>
        </div>

        {/* Absolute Top Right Corner REFER Button */}
        <div className="absolute top-3 right-4 sm:top-5 sm:right-8 z-30">
          <a
            href="#referral-program"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('referral-program', 80);
            }}
          >
            <ShinyButton
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-orange-600/40 backdrop-blur-xl transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer border border-orange-400/50"
            >
              <Gift className="w-4 h-4 text-white fill-white" />
              <span className="font-black tracking-widest text-[11px] text-white">REFER</span>
            </ShinyButton>
          </a>
        </div>

        {/* Gradient Bars Theme Background Container */}
        <Component
          numBars={18}
          gradientFrom="rgba(255, 60, 0, 0.6)"
          gradientTo="transparent"
          animationDuration={2}
          backgroundColor="transparent"
        >
          <div className="relative z-10 w-full min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-88px)] flex flex-col justify-between pt-14 sm:pt-20 pb-6 overflow-hidden">

          {/* Live Real-time Status Badge - True Bottom Left Corner of Hero */}
          <div className="absolute bottom-3 left-4 sm:left-6 z-20 hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/90 border border-slate-800/90 backdrop-blur-2xl shadow-xl">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOpen ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className={`text-[10px] font-bold tracking-wider uppercase ${isOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
              {nextStatusText}
            </span>
          </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-auto text-center space-y-4 sm:space-y-5">

              {/* Bold Layered Interactive Animated Headline */}
              <div className="space-y-1 sm:space-y-2 max-w-4xl mx-auto pt-4 sm:pt-0">
                <LayeredText
                  lines={[
                    { top: "\u00A0", bottom: "GYMNATION" },
                    { top: "GYMNATION", bottom: "FITNESS" },
                    { top: "FITNESS", bottom: "CENTRE" },
                    { top: "CENTRE", bottom: "\u00A0" },
                  ]}
                  fontSize="48px"
                  fontSizeMd="28px"
                  lineHeight={56}
                  lineHeightMd={38}
                />
                <p className="text-slate-200 text-sm sm:text-lg max-w-xl mx-auto leading-normal font-black uppercase tracking-widest drop-shadow pt-1">
                  "YOUR AVERAGE ENDS HERE"
                </p>
              </div>

            {/* Two Main CTA Buttons with ShinyButton */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3 sm:py-4">
              <a
                href="#book-appointment"
                className="w-full sm:w-[270px] shrink-0"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('book-appointment', 80);
                }}
              >
                <ShinyButton className="w-full sm:w-[270px] h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 text-xs sm:text-sm px-4 justify-center text-center whitespace-nowrap">
                  <span>Book a Free Trial</span>
                </ShinyButton>
              </a>

                <a
                  href="#membership"
                  className="w-full sm:w-[270px] shrink-0"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('membership', 80);
                  }}
                >
                  <ShinyButton className="w-full sm:w-[270px] h-12 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-xl shadow-orange-600/30 text-xs sm:text-sm px-4 justify-center text-center whitespace-nowrap">
                    <span>View Membership Plans</span>
                  </ShinyButton>
                </a>
              </div>

            </div>

            {/* Stats Row - Restored 4 Stat Cards */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
                {stats.map((stat) => {
                  const IconComponent = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl shadow-xl hover:border-orange-500/40 transition-all duration-300 group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 group-hover:scale-110 transition-transform">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-lg sm:text-xl font-black text-white leading-none">
                          {stat.value}
                        </div>
                        <div className="text-[11px] font-bold text-slate-400 tracking-wide uppercase mt-1">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </Component>
      </div>

      {/* Nutrition & Diet Guides Hub Modal */}
      <NutritionHubModal
        isOpen={isNutritionModalOpen}
        onClose={() => setIsNutritionModalOpen(false)}
      />
    </>
  );
}
