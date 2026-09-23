import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Wallet } from './Wallet';

export const HomePage: React.FC = () => {
  const [showWallet, setShowWallet] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const walletContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    if (showWallet) return;

    const card = cardRef.current;
    const overlay = overlayRef.current;
    const walletContainer = walletContainerRef.current;
    const hero = heroRef.current;
    if (!card || !overlay || !walletContainer || !hero) return;

    setShowWallet(true);

    const tl = gsap.timeline();

    // 1. Scale up the showcase card slightly
    tl.to(card, {
      scale: 1.05,
      duration: 0.25,
      ease: 'power2.out',
    })
    // 2. Fade in dark overlay
    .to(overlay, {
      opacity: 1,
      pointerEvents: 'auto',
      duration: 0.35,
      ease: 'power2.inOut',
    }, 0.1)
    // 3. Fade out homepage hero content
    .to(hero, {
      opacity: 0,
      pointerEvents: 'none',
      y: 30,
      duration: 0.35,
      ease: 'power2.in',
    }, 0.05)
    // 4. Bring in the wallet animation modal
    .fromTo(walletContainer, {
      opacity: 0,
      scale: 0.85,
      y: 40,
      pointerEvents: 'none',
    }, {
      opacity: 1,
      scale: 1,
      y: 0,
      pointerEvents: 'auto',
      duration: 0.55,
      ease: 'back.out(1.4)',
    }, 0.2);
  };

  const handleBack = () => {
    const card = cardRef.current;
    const overlay = overlayRef.current;
    const walletContainer = walletContainerRef.current;
    const hero = heroRef.current;
    if (!card || !overlay || !walletContainer || !hero) return;

    const tl = gsap.timeline({
      onComplete: () => setShowWallet(false),
    });

    // 1. Fade out wallet container
    tl.to(walletContainer, {
      opacity: 0,
      scale: 0.9,
      y: 30,
      pointerEvents: 'none',
      duration: 0.35,
      ease: 'power2.in',
    })
    // 2. Fade out overlay
    .to(overlay, {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.35,
      ease: 'power2.inOut',
    }, 0.15)
    // 3. Bring back hero content
    .to(hero, {
      opacity: 1,
      pointerEvents: 'auto',
      y: 0,
      duration: 0.45,
      ease: 'power3.out',
    }, 0.25)
    // 4. Reset card scale
    .to(card, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.out',
    }, 0.25);
  };

  // Animate hero elements on mount
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const children = hero.querySelectorAll('[data-animate]');
    gsap.fromTo(children, {
      opacity: 0,
      y: 24,
    }, {
      opacity: 1,
      y: 0,
      duration: 0.65,
      stagger: 0.12,
      ease: 'power3.out',
      delay: 0.15,
    });
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] relative overflow-hidden">

      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)',
      }} />

      {/* ─── HERO / HOMEPAGE CONTENT ─── */}
      <div ref={heroRef} className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">

        {/* Header badge */}
        <div data-animate className="mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs text-neutral-400 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Interactive Demo
          </span>
        </div>

        {/* Title */}
        <h1 data-animate className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-white tracking-tight leading-tight max-w-2xl">
          Aether Wallet
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400 mt-1">
            Animation
          </span>
        </h1>

        {/* Subtitle */}
        <p data-animate className="mt-5 text-neutral-400 text-center text-base sm:text-lg max-w-md leading-relaxed">
          A premium interactive card wallet built with React, GSAP, and touch gestures. Tap the card below to explore.
        </p>

        {/* ─── INTERACTIVE SHOWCASE CARD ─── */}
        <div
          data-animate
          ref={cardRef}
          onClick={handleCardClick}
          className="mt-12 group cursor-pointer relative"
        >
          {/* Glow behind the card */}
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500 pointer-events-none" />

          {/* The card itself */}
          <div className="relative w-[340px] sm:w-[400px] rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-sm overflow-hidden transition-all duration-300 group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-amber-500/10">

            {/* Card image area */}
            <div className="relative h-[200px] sm:h-[240px] bg-[#161616] flex items-center justify-center overflow-hidden">
              {/* Mini wallet preview */}
              <div className="relative w-[180px] sm:w-[200px] opacity-80 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105 transform transition-transform">
                <img
                  src="/Assets/wallet/Wallet.png"
                  alt="Wallet Preview"
                  className="w-full h-auto drop-shadow-xl"
                />
                {/* Mini card peek */}
                <div className="absolute top-[10%] left-[8%] w-[84%]">
                  <img
                    src="/Assets/ICICI/icici wallet card.svg"
                    alt="Card Preview"
                    className="w-full rounded-lg drop-shadow-md"
                    style={{ transform: 'translateY(-12px)' }}
                  />
                </div>
              </div>

              {/* Play icon overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card text area */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 text-[10px] font-semibold uppercase tracking-wider">
                  Interactive
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-neutral-500 text-[10px] font-semibold uppercase tracking-wider">
                  React + GSAP
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mt-2">
                3D Leather Wallet
              </h3>
              <p className="text-sm text-neutral-400 mt-1.5 leading-relaxed">
                Drag cards out, flip to see the back, reorder with gestures. Tap to try it live.
              </p>

              {/* CTA arrow */}
              <div className="mt-4 flex items-center gap-2 text-sm text-amber-400 font-medium group-hover:gap-3 transition-all duration-300">
                Open Demo
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p data-animate className="mt-10 text-neutral-600 text-xs tracking-wide">
          Built by Denis Daniel
        </p>
      </div>

      {/* ─── DARK OVERLAY ─── */}
      <div
        ref={overlayRef}
        onClick={handleBack}
        className="fixed inset-0 bg-[#0a0a0a]/95 z-40 opacity-0 pointer-events-none"
      />

      {/* ─── WALLET ANIMATION FULLSCREEN VIEW ─── */}
      <div
        ref={walletContainerRef}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center opacity-0 pointer-events-none"
      >
        {/* The actual wallet component */}
        <Wallet />
      </div>
    </div>
  );
};

export default HomePage;
