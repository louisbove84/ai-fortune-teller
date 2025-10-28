'use client';

import { 
  Wallet, 
  ConnectWallet, 
  WalletDropdown, 
  WalletDropdownDisconnect 
} from "@coinbase/onchainkit/wallet";
import { 
  Avatar, 
  Name, 
  Identity, 
  Address 
} from "@coinbase/onchainkit/identity";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";

interface PremiumWalletSectionProps {
  onPayment: () => void;
}

export function PremiumWalletSection({ onPayment }: PremiumWalletSectionProps) {
  const { address, isConnected } = useAccount();

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Wallet>
          <ConnectWallet className="w-full px-8 py-4 bg-fortune-purple hover:bg-fortune-darkPurple text-white text-xl font-bold rounded-lg mystic-shadow transition-all duration-300 hover:scale-105">
            <span>Connect Wallet</span>
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </div>
      
      {isConnected && (
        <div className="space-y-4">
          <div className="bg-mystic-800/50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-400 mb-1">Connected:</div>
            <div className="text-fortune-gold font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>

          <motion.button
            onClick={onPayment}
            className="w-full px-8 py-4 bg-fortune-gold hover:bg-yellow-500 text-mystic-950 text-xl font-bold rounded-lg shadow-lg transition-all duration-300 hover:scale-105"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Unlock Full Destiny - Pay $3
          </motion.button>
        </div>
      )}
    </div>
  );
}

