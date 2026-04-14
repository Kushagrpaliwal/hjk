'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Wait 3 seconds for the loading effect
    const timer = setTimeout(() => {
      setIsLoaded(true);
      
      // Navigate after the "Scale Up" animation completes
      setTimeout(() => {
        router.push('/login');
      }, 700); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black flex flex-col items-center justify-center">
      
      {/* BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        {/* Mobile Background: Hidden on medium screens and up */}
        <img
          src="/casino-mobile-bg.png" 
          alt="mobile background"
          className="w-full h-full object-cover block md:hidden opacity-50"
        />

        {/* Desktop Background: Hidden on small screens */}
        <img
          src="/casino-desktop-bg.png" 
          alt="desktop background"
          className="w-full h-full object-cover hidden md:block opacity-40"
        />

        {/* DARK OVERLAY: Creates the high-end Casino depth */}
        <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40"></div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-1000 ease-in-out ${
        isLoaded ? 'opacity-0 scale-110 blur-sm' : 'opacity-100 scale-100'
      }`}>
        
        {/* CENTERED LOGO AREA */}
        <div className="relative mb-10">
          {/* Outer Golden Glow */}
          <div className="absolute inset-0 bg-yellow-600/20 blur-[60px] rounded-full animate-pulse"></div>
          
          <img
            src="/dice_rush_logo.png"
            alt="Dice Rush Logo"
            className={`w-40 h-40 md:w-56 md:h-56 object-contain transition-all duration-1000 ${
              isLoaded ? 'scale-125' : 'animate-bounce'
            }`}
          />
        </div>

        {/* BRANDING & LOADER */}
        <div className="text-center">
          <h1 className="text-gold-gradient text-3xl md:text-5xl font-serif tracking-[0.2em] uppercase mb-3">
            Dice Rush
          </h1>
          
          <div className="flex flex-col items-center gap-4">
            <p className="text-yellow-500/70 text-[10px] md:text-xs tracking-[0.4em] uppercase font-light">
              {isLoaded ? 'Entering Lobby' : 'Preparing Your Table'}
            </p>

            {/* MINIMALIST GOLD SHIMMER LINE */}
            {!isLoaded && (
              <div className="w-32 md:w-48 h-[1px] bg-white/10 overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-full animate-shimmer absolute top-0 left-0" />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-gold-gradient {
          background: linear-gradient(to bottom, #fff3c2 0%, #e2b04a 45%, #8a5d14 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}