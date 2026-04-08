import { useWallet } from '@meshsdk/react';
import { BrowserWallet } from '@meshsdk/core';
import { useEffect, useState } from 'react';

/**
 * Custom "Connect Wallet" button.
 *
 * Uses BrowserWallet.getAvailableWallets() to discover installed
 * Cardano wallet extensions, then lets the user pick one to connect.
 *
 * This replaces MeshJS's built-in <CardanoWallet /> component
 * so we have full control over styling and behavior.
 */
export function ConnectWallet() {
  const { connected, connect, disconnect, name } = useWallet();
  const [wallets, setWallets] = useState<Awaited<ReturnType<typeof BrowserWallet.getAvailableWallets>>>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    BrowserWallet.getAvailableWallets().then(setWallets);
  }, []);

  if (connected) {
    return (
      <div className="connect-wallet">
        <button className="btn btn-connected" onClick={disconnect}>
          <span className="dot connected" />
          {name ?? 'Wallet'}
          <span className="disconnect-label">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <div className="connect-wallet">
      <button className="btn" onClick={() => setOpen(!open)}>
        Connect Wallet
      </button>

      {open && (
        <div className="wallet-dropdown">
          {wallets.length === 0 && (
            <div className="wallet-option hint">
              No wallets found. Install a Cardano wallet extension (Nami, Eternl, Lace, etc.)
            </div>
          )}
          {wallets.map((w) => (
            <button
              key={w.id}
              className="wallet-option"
              onClick={() => {
                connect(w.id);
                setOpen(false);
              }}
            >
              <img src={w.icon} alt={w.name} className="wallet-icon" />
              {w.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
