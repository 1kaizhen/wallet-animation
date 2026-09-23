export interface CardData {
  id: string;
  name: string;
  holder: string;
  number: string;
  expiry: string;
  cvv: string;
  balance: string;
  currency: string;
  type: 'visa' | 'mastercard' | 'amex' | 'black';
  theme: {
    bgGradient: string;
    accentColor: string;
    textColor: string;
    subtextColor: string;
    chipColor: string;
    hologramColor: string;
    badgeBg: string;
    border: string;
  };
  cashback: string;
  limit: string;
}

export const WALLET_CARDS: CardData[] = [
  {
    id: 'card-1',
    name: 'Obsidian Black Edition',
    holder: 'ALEXANDER MORGAN',
    number: '•••• •••• •••• 8842',
    expiry: '09/29',
    cvv: '921',
    balance: '$42,850.00',
    currency: 'USD',
    type: 'black',
    theme: {
      bgGradient: 'linear-gradient(135deg, #18181b 0%, #09090b 50%, #000000 100%)',
      accentColor: '#d4af37',
      textColor: '#fef3c7',
      subtextColor: 'rgba(253, 230, 138, 0.75)',
      chipColor: '#eab308',
      hologramColor: 'linear-gradient(120deg, rgba(234, 179, 8, 0.25), rgba(168, 85, 247, 0.25), rgba(6, 182, 212, 0.25))',
      badgeBg: 'rgba(234, 179, 8, 0.15)',
      border: 'rgba(234, 179, 8, 0.4)'
    },
    cashback: '3.5% Unlimited',
    limit: '$100,000'
  },
  {
    id: 'card-2',
    name: 'Sapphire Preferred',
    holder: 'ALEXANDER MORGAN',
    number: '•••• •••• •••• 4091',
    expiry: '11/28',
    cvv: '554',
    balance: '$18,420.50',
    currency: 'USD',
    type: 'visa',
    theme: {
      bgGradient: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 60%, #020617 100%)',
      accentColor: '#38bdf8',
      textColor: '#f0f9ff',
      subtextColor: 'rgba(186, 230, 253, 0.75)',
      chipColor: '#38bdf8',
      hologramColor: 'linear-gradient(120deg, rgba(56, 189, 248, 0.3), rgba(99, 102, 241, 0.3), rgba(16, 185, 129, 0.3))',
      badgeBg: 'rgba(56, 189, 248, 0.15)',
      border: 'rgba(56, 189, 248, 0.4)'
    },
    cashback: '2.0% Worldwide',
    limit: '$50,000'
  },
  {
    id: 'card-3',
    name: 'Emerald Titanium',
    holder: 'ALEXANDER MORGAN',
    number: '•••• •••• •••• 1739',
    expiry: '04/30',
    cvv: '318',
    balance: '$8,940.00',
    currency: 'USD',
    type: 'mastercard',
    theme: {
      bgGradient: 'linear-gradient(135deg, #064e3b 0%, #022c22 60%, #021a14 100%)',
      accentColor: '#34d399',
      textColor: '#ecfdf5',
      subtextColor: 'rgba(167, 243, 208, 0.75)',
      chipColor: '#34d399',
      hologramColor: 'linear-gradient(120deg, rgba(52, 211, 153, 0.3), rgba(20, 184, 166, 0.3), rgba(245, 158, 11, 0.3))',
      badgeBg: 'rgba(52, 211, 153, 0.15)',
      border: 'rgba(52, 211, 153, 0.4)'
    },
    cashback: '4.0% Travel',
    limit: '$30,000'
  },
  {
    id: 'card-4',
    name: 'Rose Gold Prestige',
    holder: 'ALEXANDER MORGAN',
    number: '•••• •••• •••• 9205',
    expiry: '01/29',
    cvv: '743',
    balance: '$12,180.75',
    currency: 'USD',
    type: 'amex',
    theme: {
      bgGradient: 'linear-gradient(135deg, #881337 0%, #4c0519 60%, #1c030b 100%)',
      accentColor: '#fb7185',
      textColor: '#fff1f2',
      subtextColor: 'rgba(254, 205, 211, 0.75)',
      chipColor: '#fb7185',
      hologramColor: 'linear-gradient(120deg, rgba(251, 113, 133, 0.3), rgba(217, 70, 239, 0.3), rgba(99, 102, 241, 0.3))',
      badgeBg: 'rgba(251, 113, 133, 0.15)',
      border: 'rgba(251, 113, 133, 0.4)'
    },
    cashback: '3.0% Dining',
    limit: '$45,000'
  }
];

export interface WalletSkin {
  id: string;
  name: string;
  outerBg: string;
  innerBg: string;
  pocketBg: string;
  pocketRim: string;
  stitchColor: string;
  claspColor: string;
  embossColor: string;
}

export const WALLET_SKINS: WalletSkin[] = [
  {
    id: 'midnight-black',
    name: 'Midnight Carbon Leather',
    outerBg: 'linear-gradient(145deg, #1e1e24 0%, #0d0d10 100%)',
    innerBg: 'linear-gradient(180deg, #18181e 0%, #0a0a0c 100%)',
    pocketBg: 'linear-gradient(180deg, #26262e 0%, #141418 100%)',
    pocketRim: '#3f3f46',
    stitchColor: '#52525b',
    claspColor: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
    embossColor: 'rgba(255,255,255,0.08)'
  },
  {
    id: 'cognac-tan',
    name: 'Vintage Cognac Brown',
    outerBg: 'linear-gradient(145deg, #451a03 0%, #291104 100%)',
    innerBg: 'linear-gradient(180deg, #361402 0%, #1c0901 100%)',
    pocketBg: 'linear-gradient(180deg, #572506 0%, #3b1803 100%)',
    pocketRim: '#78350f',
    stitchColor: '#d97706',
    claspColor: 'linear-gradient(135deg, #fcd34d 0%, #b45309 100%)',
    embossColor: 'rgba(245, 158, 11, 0.15)'
  },
  {
    id: 'imperial-navy',
    name: 'Royal Navy Saffiano',
    outerBg: 'linear-gradient(145deg, #0f172a 0%, #020617 100%)',
    innerBg: 'linear-gradient(180deg, #0b1120 0%, #020617 100%)',
    pocketBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    pocketRim: '#334155',
    stitchColor: '#38bdf8',
    claspColor: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
    embossColor: 'rgba(56, 189, 248, 0.15)'
  }
];
