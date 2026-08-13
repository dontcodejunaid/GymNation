import React, { useEffect, useState } from 'react';
import faviconImg from '/favicon.png';
import logoImg from '../assets/logo.png';

export default function SplashIntroScreen({ onFinish }) {
  const [isFading, setIsFading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Show opening animated logo for 2 seconds then fade out
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsDone(true);
        if (onFinish) onFinish();
      }, 700); // 700ms exit fade
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black text-white selection:bg-orange-500 transition-all duration-700 ${
        isFading ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background ambient lighting glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-orange-600/25 rounded-full blur-[160px] pointer-events-none animate-pulse" />

      {/* Dead-Centered Larger Animated Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center my-auto">
        <div className="relative transform transition-all duration-1000 animate-pulse flex items-center justify-center">
          <img
            src={faviconImg}
            alt="GYMNATION Logo"
            className="h-52 sm:h-72 md:h-80 w-auto max-w-[85vw] object-contain drop-shadow-[0_0_50px_rgba(249,115,22,0.9)]"
            onError={(e) => {
              e.target.src = logoImg;
            }}
          />
        </div>
      </div>
    </div>
  );
}
