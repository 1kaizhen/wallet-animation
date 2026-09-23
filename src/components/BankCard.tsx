import React, { forwardRef } from 'react';
import { BANK_CARDS } from '../data/bankCardsData';
import type { BankType, CardLayerType } from '../data/bankCardsData';

interface BankCardProps {
  bank: BankType;
  activeLayer?: CardLayerType;
  isFlipped?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export const BankCard = forwardRef<HTMLDivElement, BankCardProps>(({
  bank,
  activeLayer = 'wallet',
  isFlipped = false,
  className = '',
  style = {},
  onClick,
}, ref) => {
  const card = BANK_CARDS[bank];

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        ...style,
        transformStyle: 'preserve-3d',
        WebkitTransformStyle: 'preserve-3d',
      }}
      data-bank={bank}
      className={`relative w-full aspect-[400/250] rounded-2xl select-none ${className}`}
    >
      {/* FRONT FACE — visible when NOT flipped */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: isFlipped ? 0 : 1,
          transition: 'opacity 0.05s linear',
        }}
      >
        {/* Wallet compact version */}
        <img
          src={card.walletCard}
          alt={`${card.name} Wallet`}
          className={`absolute inset-0 w-full h-full object-contain rounded-2xl pointer-events-none transition-opacity duration-300 drop-shadow-md ${
            activeLayer === 'wallet' ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Full Front card details version */}
        <img
          src={card.front}
          alt={`${card.name} Front`}
          className={`absolute inset-0 w-full h-full object-contain rounded-2xl pointer-events-none transition-opacity duration-300 drop-shadow-2xl ${
            activeLayer !== 'wallet' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* BACK FACE — visible when flipped, scaleX(-1) counters parent's rotateY(180) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          opacity: isFlipped ? 1 : 0,
          transform: 'scaleX(-1)',
          transition: 'opacity 0.05s linear',
        }}
      >
        <img
          src={card.back}
          alt={`${card.name} Back`}
          className="absolute inset-0 w-full h-full object-contain rounded-2xl pointer-events-none drop-shadow-2xl"
        />
      </div>
    </div>
  );
});

BankCard.displayName = 'BankCard';
