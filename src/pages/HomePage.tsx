import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

interface ProjectCard {
  id: string;
  title: string;
  tags: string[];
  description: string;
  status: 'Live' | 'In Lab' | 'Coming Soon';
  isLive?: boolean;
  link?: string;
  image?: string;
  cardPeekImage?: string;
}

const PROJECTS: ProjectCard[] = [
  {
    id: 'wallet',
    title: '3D Leather Wallet Animation',
    tags: ['React 19', 'GSAP 3D', 'Gestures'],
    description: 'Interactive 3D leather wallet with physical card drag, single-swipe flips, weighted friction, and slot reordering.',
    status: 'Live',
    isLive: true,
    link: '/wallet',
    image: '/Assets/wallet/Wallet.png',
    cardPeekImage: '/Assets/ICICI/icici wallet card.svg',
  },
  {
    id: 'weather',
    title: 'Weather React & Canvas FX',
    tags: ['React', 'Canvas FX', 'Interactive Globe'],
    description: 'Real-time weather visualization with dynamic particle canvas effects, 3D interactive globe navigation, and atmospheric lighting.',
    status: 'Live',
    isLive: true,
    link: '/weather',
    image: '/weather-react/src/assets/photos/dubai.jpg',
  },
  {
    id: 'kinetic-dock',
    title: 'Kinetic Gesture Dock',
    tags: ['Spring Physics', 'Gestures'],
    description: 'Fluid bottom dock with magnetic attraction, spring physics, and momentum velocity decay.',
    status: 'In Lab',
  },
  {
    id: 'glass-spatial',
    title: 'Glassmorphic Spatial Deck',
    tags: ['Backdrop Blur', '3D Light'],
    description: 'Multi-layered glass cards with real-time 3D cursor tilt calculations and specular reflections.',
    status: 'In Lab',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleLaunchProject = (project: ProjectCard) => {
    if (project.link) {
      const cardEl = cardRefs.current[project.id];
      if (cardEl) {
        gsap.to(cardEl, {
          scale: 0.97,
          duration: 0.12,
          ease: 'power2.out',
          onComplete: () => {
            gsap.to(cardEl, {
              scale: 1.02,
              duration: 0.18,
              ease: 'power2.out',
              onComplete: () => {
                navigate(project.link!);
              },
            });
          },
        });
      } else {
        navigate(project.link);
      }
    }
  };

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const children = hero.querySelectorAll('[data-animate]');
    gsap.fromTo(
      children,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
      }
    );
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-neutral-100 px-6 py-16 sm:py-24 font-sans selection:bg-neutral-800">
      
      <div ref={heroRef} className="max-w-5xl mx-auto">
        
        {/* ─── 1. MINIMAL HEADER / TITLE ─── */}
        <div data-animate className="mb-14">
          <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest block mb-2">
            Denis Daniel — Playground
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Selected Experiments
          </h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-md leading-relaxed">
            A collection of interactive UI components, 3D physics, and gesture controls.
          </p>
        </div>

        {/* ─── 2. MINIMAL PROJECT CARDS GRID ─── */}
        <div data-animate className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {PROJECTS.map((project) => {
            return (
              <div
                key={project.id}
                ref={(el) => {
                  cardRefs.current[project.id] = el;
                }}
                onClick={() => project.isLive && handleLaunchProject(project)}
                className={`group relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  project.isLive
                    ? 'cursor-pointer border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05] hover:shadow-2xl'
                    : 'border-white/[0.05] bg-white/[0.015] opacity-60'
                }`}
              >
                {/* Preview Image Area */}
                <div className="relative h-56 bg-[#121216] flex items-center justify-center overflow-hidden border-b border-white/[0.06] p-6">
                  {project.image ? (
                    <div className="relative w-48 opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-105 transform">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-auto drop-shadow-xl"
                      />
                      {project.cardPeekImage && (
                        <div className="absolute top-[10%] left-[8%] w-[84%]">
                          <img
                            src={project.cardPeekImage}
                            alt="Card Peek"
                            className="w-full rounded-lg drop-shadow-md transition-transform duration-300 group-hover:-translate-y-3"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-2xl opacity-40">✦</span>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                      project.isLive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                        : 'bg-white/5 text-neutral-500 border border-white/5'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>

                {/* Info Content */}
                <div className="p-6">
                  <h2 className="text-lg font-medium text-white tracking-tight group-hover:text-amber-300 transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tags & Action */}
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono text-neutral-500">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {project.isLive && (
                      <span className="text-xs font-medium text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Open Demo →
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── 3. MINIMAL FOOTER ─── */}
        <div data-animate className="mt-20 pt-8 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Denis Daniel</span>
          <span>React 19 + GSAP</span>
        </div>

      </div>

    </div>
  );
};

export default HomePage;
