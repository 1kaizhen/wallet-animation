import React, { forwardRef } from 'react';
import { Wifi, Sparkles, ShieldCheck, CreditCard as CardIcon } from 'lucide-react';
import type { CardData } from '../data/walletData';

interface CreditCardProps {
  card: CardData;
  isSelected?: boolean;
  isFanned?: boolean;
  index: number;
  totalCards: number;
  onClick?: () => void;
  showBack?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CreditCard = forwardRef<HTMLDivElement, CreditCardProps>(({
  card,
  isSelected = false,
  index,
  onClick,
  className = '',
  style = {}
}, ref) => {
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={style}
      data-card-id={card.id}
      data-card-index={index}
      className={`relative w-72 sm:w-80 h-44 sm:h-48 rounded-2xl p-5 select-none cursor-pointer transition-shadow duration-300 transform-gpu ${className}`}
    >
      {/* Front Face */}
      <div
        className={`absolute inset-0 rounded-2xl p-5 overflow-hidden flex flex-col justify-between shadow-2xl backdrop-blur-md border ${
          isSelected ? 'shadow-[0_20px_50px_rgba(0,0,0,0.6)]' : 'shadow-lg'
        }`}
        style={{
          background: card.theme.bgGradient,
          borderColor: card.theme.border,
        }}
      >
        {/* Ambient Holographic / Specular Sheen */}
        <div
          className="absolute -inset-full opacity-35 pointer-events-none transform -rotate-45"
          style={{
            background: card.theme.hologramColor,
            filter: 'blur(30px)',
          }}
        />

        {/* Top bar: Card name, contactless icon & chip */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className="w-10 h-7 rounded-md border flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: card.theme.chipColor,
                borderColor: 'rgba(255,255,255,0.4)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 1px rgba(255,255,255,0.2)'
              }}
            >
              {/* Chip grid lines */}
              <div className="w-full h-full grid grid-cols-3 grid-rows-2 border-slate-700/40">
                <div className="border-r border-b border-black/20" />
                <div className="border-r border-b border-black/20" />
                <div className="border-b border-black/20" />
                <div className="border-r border-black/20" />
                <div className="border-r border-black/20" />
                <div />
              </div>
            </div>

            <Wifi
              className="w-5 h-5 rotate-90 opacity-80"
              style={{ color: card.theme.accentColor }}
            />
          </div>

          {/* Card brand logo / badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full border backdrop-blur-sm"
               style={{
                 borderColor: card.theme.border,
                 backgroundColor: card.theme.badgeBg
               }}>
            {card.type === 'black' && <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            {card.type === 'visa' && <ShieldCheck className="w-3.5 h-3.5 text-sky-300" />}
            {card.type === 'mastercard' && <div className="flex -space-x-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500/90" /><div className="w-2.5 h-2.5 rounded-full bg-amber-400/90" /></div>}
            {card.type === 'amex' && <CardIcon className="w-3.5 h-3.5 text-rose-300" />}
            <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: card.theme.accentColor }}>
              {card.type.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Center: Card Number */}
        <div className="relative z-10 my-auto pt-2">
          <div
            className="text-base sm:text-lg font-mono tracking-[0.22em] font-medium drop-shadow-md"
            style={{ color: card.theme.textColor }}
          >
            {card.number}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] uppercase tracking-wider opacity-75" style={{ color: card.theme.subtextColor }}>
              Card Balance
            </span>
            <span className="text-xs font-semibold font-mono tracking-tight" style={{ color: card.theme.accentColor }}>
              {card.balance}
            </span>
          </div>
        </div>

        {/* Bottom bar: Cardholder name & Expiry */}
        <div className="relative z-10 flex items-end justify-between pt-1 border-t border-white/10">
          <div>
            <div className="text-[9px] uppercase tracking-widest opacity-60" style={{ color: card.theme.subtextColor }}>
              Cardholder
            </div>
            <div className="text-xs font-semibold tracking-wide uppercase truncate max-w-[170px]" style={{ color: card.theme.textColor }}>
              {card.holder}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[9px] uppercase tracking-widest opacity-60" style={{ color: card.theme.subtextColor }}>
              Expires
            </div>
            <div className="text-xs font-mono font-medium tracking-wider" style={{ color: card.theme.textColor }}>
              {card.expiry}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

CreditCard.displayName = 'CreditCard';
