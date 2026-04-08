import { MeshProvider } from '@meshsdk/react';
import { ConnectWallet } from './components/ConnectWallet';
import { WalletConnect } from './components/WalletConnect';
import { SendAda } from './components/SendAda';
import { SendTokens } from './components/SendTokens';
import { MintTokens } from './components/MintTokens';

/**
 * Cardano Transaction Building Tutorial -- React + MeshJS
 *
 * This app demonstrates the same transaction building concepts
 * as the Java Spring Boot tutorial, but runs entirely in the browser.
 *
 * Architecture comparison:
 * - Java:  Server-side. Mnemonics sent via API, server signs & submits.
 * - React: Client-side. Wallet extension holds keys, user approves in browser.
 *
 * MeshProvider wraps the app and manages wallet connection state.
 * useWallet() hook (used in child components) provides the wallet instance.
 */
function App() {
  return (
    <MeshProvider>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <h1>Cardano Tx Building</h1>
            <span className="subtitle">React + MeshJS (Preprod Testnet)</span>
          </div>
          <ConnectWallet />
        </header>

        <main className="main">
          <WalletConnect />
          <SendAda />
          <SendTokens />
          <MintTokens />
        </main>

        <footer className="footer">
          <p>
            Cardano Ambassador Program 2026 --{' '}
            <a href="https://docs.cardano.org/cardano-testnets/tools/faucet/" target="_blank" rel="noopener noreferrer">
              Get test ADA from the faucet
            </a>
          </p>
        </footer>
      </div>
    </MeshProvider>
  );
}

export default App;
