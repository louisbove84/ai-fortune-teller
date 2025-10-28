'use client';

import { useAccount } from "wagmi";
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

interface WalletButtonProps {
  showConnectionStatus?: boolean;
}

export function WalletButton({ showConnectionStatus = false }: WalletButtonProps) {
  const { address, isConnected } = useAccount();

  console.log('WalletButton rendered:', { isConnected, address });

  const handleConnectClick = () => {
    console.log('Connect wallet clicked');
  };

  return (
    <>
      <div className="absolute top-8 right-8 z-50">
        <Wallet>
          <ConnectWallet 
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
            onConnect={handleConnectClick}
            render={({ label, onClick, context, status, isLoading }) => (
              <button
                onClick={onClick}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          />
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

      {showConnectionStatus && isConnected && (
        <p className="mt-6 text-yellow-400 text-sm">
          Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      )}
    </>
  );
}

