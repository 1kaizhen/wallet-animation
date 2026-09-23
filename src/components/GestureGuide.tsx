import React from 'react';
import { Smartphone, MoveUp, MoveDown, MoveHorizontal, MousePointerClick } from 'lucide-react';

interface GestureGuideProps {
  walletState: 'closed' | 'open' | 'card-selected';
  onToggleOpen: () => void;
  onCycleCards: (dir: 'next' | 'prev') => void;
  onPutBack: () => void;
  onOpenCard: () => void;
}

export const GestureGuide: React.FC<GestureGuideProps> = ({
  walletState,
  onToggleOpen,
  onCycleCards,
  onPutBack,
  onOpenCard
}) => {
  return (
    <div className="w-full max-w-md mx-auto my-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 backdrop-blur-md text-xs text-neutral-300 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
        <div className="flex items-center space-x-2 font-medium text-white">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span>Mobile Touch & Gesture Controls (HammerJS)</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
          {walletState.toUpperCase()}
        </span>
      </div>

      {/* Dynamic Gesture Tips based on current state */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] mb-3">
        {walletState === 'closed' && (
          <>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/40">
              <MoveUp className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Swipe UP to open wallet</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/40">
              <MousePointerClick className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Tap clasp to open</span>
            </div>
          </>
        )}

        {walletState === 'open' && (
          <>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/40">
              <MoveHorizontal className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Pan Left / Right to cycle</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/40">
              <MoveUp className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Tap card to pull out</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/40">
              <MoveDown className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Swipe DOWN to close</span>
            </div>
          </>
        )}

        {walletState === 'card-selected' && (
          <>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/40">
              <MoveDown className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Swipe DOWN to return</span>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-xl bg-neutral-800/50 border border-neutral-700/40">
              <MousePointerClick className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Tap buttons to pay / manage</span>
            </div>
          </>
        )}
      </div>

      {/* Manual Quick Action fallback buttons for desktop testing */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-neutral-800/80">
        {walletState === 'closed' && (
          <button
            onClick={onToggleOpen}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition cursor-pointer"
          >
            Open Wallet
          </button>
        )}
        {walletState === 'open' && (
          <>
            <button
              onClick={() => onCycleCards('prev')}
              className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition cursor-pointer"
            >
              ← Prev Card
            </button>
            <button
              onClick={onOpenCard}
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition cursor-pointer"
            >
              Select Top Card
            </button>
            <button
              onClick={() => onCycleCards('next')}
              className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition cursor-pointer"
            >
              Next Card →
            </button>
            <button
              onClick={onToggleOpen}
              className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition cursor-pointer"
            >
              Close
            </button>
          </>
        )}
        {walletState === 'card-selected' && (
          <button
            onClick={onPutBack}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition cursor-pointer"
          >
            Put Card Back in Wallet
          </button>
        )}
      </div>
    </div>
  );
};
