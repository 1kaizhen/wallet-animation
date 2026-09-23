// ICICI Assets
import iciciWalletCard from '../../Assets/ICICI/icici wallet card.svg';
import iciciFront from '../../Assets/ICICI/icici front.svg';
import iciciBack from '../../Assets/ICICI/icici back.svg';

// Axis Assets
import axisWalletCard from '../../Assets/Axis/axis wallet card.svg';
import axisFront from '../../Assets/Axis/axis front.svg';
import axisBack from '../../Assets/Axis/axis back.svg';

// HDFC Assets
import hdfcWalletCard from '../../Assets/HDFC/hdfc wallet card.svg';
import hdfcFront from '../../Assets/HDFC/hdfc front.svg';
import hdfcBack from '../../Assets/HDFC/hdfc back.svg';

export type BankType = 'icici' | 'axis' | 'hdfc';
export type CardLayerType = 'wallet' | 'front' | 'back';

export interface BankCardData {
  id: BankType;
  name: string;
  walletCard: string;
  front: string;
  back: string;
}

export const BANK_CARDS: Record<BankType, BankCardData> = {
  icici: {
    id: 'icici',
    name: 'ICICI Bank',
    walletCard: iciciWalletCard,
    front: iciciFront,
    back: iciciBack,
  },
  axis: {
    id: 'axis',
    name: 'Axis Bank',
    walletCard: axisWalletCard,
    front: axisFront,
    back: axisBack,
  },
  hdfc: {
    id: 'hdfc',
    name: 'HDFC Bank',
    walletCard: hdfcWalletCard,
    front: hdfcFront,
    back: hdfcBack,
  },
};
