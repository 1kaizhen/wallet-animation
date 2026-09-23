import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    const card = cardRef.current;
    if (!card) return;

    // Animate card click scale before navigating to /wallet
    gsap.to(card, {
      scale: 0.96,
      duration: 0.12,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.2,
          ease: 'power2.out',
          onComplete: () => {
            navigate('/wallet');
          },
        });
      },
    });
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
            Interactive Portfolio Showcase
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
          A premium 3D interactive leather wallet built with React, GSAP, and touch gestures. Click the card below to open the demo link.
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
                Drag cards out, flip to see the back, reorder with gestures. Click to open standalone page link.
              </p>

              {/* CTA arrow */}
              <div className="mt-4 flex items-center gap-2 text-sm text-amber-400 font-medium group-hover:gap-3 transition-all duration-300">
                Open Demo Link (/wallet)
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Direct link button option */}
        <div data-animate className="mt-6">
          <a
            href="#/wallet"
            className="text-xs text-neutral-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Direct Link: #/wallet
          </a>
        </div>

        {/* Footer hint */}
        <p data-animate className="mt-10 text-neutral-600 text-xs tracking-wide">
          Built by Denis Daniel
        </p>
      </div>
    </div>
  );
};

export default HomePage;
