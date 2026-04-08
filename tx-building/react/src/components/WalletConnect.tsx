import { useWallet } from '@meshsdk/react';
import { useEffect, useState } from 'react';

/**
 * Tutorial: Wallet Connection & Info
 *
 * In the browser-based approach, users connect their own wallet extension
 * (Nami, Eternl, Flint, Lace, etc.) instead of generating mnemonics server-side.
 *
 * MeshJS provides:
 * - CardanoWallet: a drop-in connect button (used in App.tsx header)
 * - useWallet(): a hook that exposes the connected wallet instance
 *
 * The BrowserWallet (from useWallet) can:
 * - Query UTXOs, balance, and used addresses
 * - Sign transactions (the wallet extension prompts the user)
 * - Submit signed transactions to the network
 *
 * Key difference from the Java tutorial:
 * - Java: mnemonic is sent to the server, server signs transactions
 * - React/MeshJS: wallet stays in the browser, user signs via extension
 *   (much safer -- private keys never leave the user's device)
 */
export function WalletConnect() {
  const { connected, wallet } = useWallet();
  const [address, setAddress] = useState<string>('');
  const [balance, setBalance] = useState<string>('');
  const [utxoCount, setUtxoCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected) {
      setAddress('');
      setBalance('');
      setUtxoCount(0);
      return;
    }
    fetchWalletInfo();
  }, [connected]);

  async function fetchWalletInfo() {
    if (!wallet) return;
    setLoading(true);
    try {
      // Get the wallet's used addresses (addresses that have received funds)
      const usedAddresses = await wallet.getUsedAddresses();
      const addr = usedAddresses[0] ?? (await wallet.getUnusedAddresses())[0] ?? '';
      setAddress(addr);

      // Get balance -- returns lovelace as an array of assets
      // The first item with unit "lovelace" is the ADA balance
      const balanceAssets = await wallet.getBalance();
      const lovelace = balanceAssets.find(a => a.unit === 'lovelace');
      if (lovelace) {
        const ada = (parseInt(lovelace.quantity) / 1_000_000).toFixed(6);
        setBalance(`${ada} ADA (${lovelace.quantity} lovelace)`);
      }

      // Get UTXOs to show the EUTXO set
      const utxos = await wallet.getUtxos();
      setUtxoCount(utxos.length);
    } catch (err) {
      console.error('Failed to fetch wallet info:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!connected) {
    return (
      <div className="card">
        <h2>Wallet Info</h2>
        <p className="hint">Connect your wallet using the button above to get started.</p>
        <p className="hint">
          You need a Cardano wallet extension installed (e.g. Nami, Eternl, Flint, Lace).
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Wallet Info</h2>
      {loading ? (
        <p>Loading wallet info...</p>
      ) : (
        <>
          <div className="info-row">
            <label>Address:</label>
            <span className="mono">{address}</span>
          </div>
          <div className="info-row">
            <label>Balance:</label>
            <span>{balance}</span>
          </div>
          <div className="info-row">
            <label>UTXOs:</label>
            <span>{utxoCount} unspent output(s)</span>
          </div>
          <button onClick={fetchWalletInfo} className="btn btn-secondary">
            Refresh
          </button>
        </>
      )}
    </div>
  );
}
