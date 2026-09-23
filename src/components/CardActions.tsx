import { useState } from 'react';
import { Radio, Lock, Unlock, Copy, Check, ArrowDownToLine, RefreshCw, Zap } from 'lucide-react';
import type { CardData } from '../data/walletData';

interface CardActionsProps {
  card: CardData;
  onPutBack: () => void;
  onPaySuccess?: () => void;
}

export const CardActions: React.FC<CardActionsProps> = ({ card, onPutBack, onPaySuccess }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(card.number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    if (isPaying || isLocked) return;
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setPaySuccess(true);
      onPaySuccess?.();
      setTimeout(() => setPaySuccess(false), 2500);
    }, 1200);
  };

  return (
    <div className="w-full max-w-sm mx-auto mt-6 px-4 py-4 rounded-3xl bg-neutral-900/80 border border-neutral-800 backdrop-blur-xl shadow-2xl animate-fade-in transition-all">
      {/* Top Card Info Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
        <div>
          <h3 className="text-sm font-semibold text-white tracking-wide">{card.name}</h3>
          <p className="text-xs text-neutral-400">Cashback {card.cashback} • Limit {card.limit}</p>
        </div>
        <button
          onClick={onPutBack}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 mr-1" />
          Put Back
        </button>
      </div>

      {/* Main Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2.5 my-3.5">
        {/* Contactless Pay Button */}
        <button
          onClick={handleSimulatePayment}
          disabled={isLocked || isPaying}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
            paySuccess
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
              : isLocked
              ? 'bg-neutral-800/40 border-neutral-800 text-neutral-500 opacity-50 cursor-not-allowed'
              : 'bg-amber-400/10 hover:bg-amber-400/20 border-amber-400/30 text-amber-300'
          }`}
        >
          {isPaying ? (
            <RefreshCw className="w-5 h-5 animate-spin my-1" />
          ) : paySuccess ? (
            <Check className="w-5 h-5 my-1 text-emerald-400" />
          ) : (
            <Radio className="w-5 h-5 my-1" />
          )}
          <span className="text-[11px] font-semibold mt-1">
            {paySuccess ? 'Paid!' : isPaying ? 'Authorizing' : 'Tap & Pay'}
          </span>
        </button>

        {/* Lock/Unlock Button */}
        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
            isLocked
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
              : 'bg-neutral-800/70 hover:bg-neutral-800 border-neutral-700/60 text-neutral-300'
          }`}
        >
          {isLocked ? <Lock className="w-5 h-5 my-1 text-rose-400" /> : <Unlock className="w-5 h-5 my-1" />}
          <span className="text-[11px] font-semibold mt-1">
            {isLocked ? 'Frozen' : 'Active'}
          </span>
        </button>

        {/* Copy Details */}
        <button
          onClick={handleCopy}
          className="flex flex-col items-center justify-center p-3 rounded-2xl border border-neutral-700/60 bg-neutral-800/70 hover:bg-neutral-800 text-neutral-300 transition-all cursor-pointer active:scale-95"
        >
          {copied ? <Check className="w-5 h-5 my-1 text-emerald-400" /> : <Copy className="w-5 h-5 my-1" />}
          <span className="text-[11px] font-semibold mt-1">
            {copied ? 'Copied' : 'Card Details'}
          </span>
        </button>
      </div>

      {/* Live status / hint */}
      <div className="flex items-center justify-center space-x-2 text-[11px] text-neutral-400 bg-neutral-950/60 py-2 px-3 rounded-xl">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <span>Swipe down or tap &ldquo;Put Back&rdquo; to return card to wallet</span>
      </div>
    </div>
  );
};
