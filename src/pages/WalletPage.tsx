import React from 'react';
import { Wallet } from '../components/Wallet';

export const WalletPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Background radial ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 60%)',
      }} />

      {/* Wallet Component in initial closed/tucked state */}
      <div className="relative z-10 w-full flex items-center justify-center">
        <Wallet />
      </div>
    </div>
  );
};

export default WalletPage;
