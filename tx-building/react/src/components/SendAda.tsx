import { useWallet } from '@meshsdk/react';
import { Transaction } from '@meshsdk/core';
import { useState } from 'react';

/**
 * Tutorial Step 4: Send ADA
 *
 * This component builds, signs, and submits a simple ADA transfer.
 * It mirrors the Java TransferService.sendAda() but runs entirely
 * in the browser using the connected wallet extension.
 *
 * Transaction Lifecycle (same as Java, different execution):
 * 1. DEFINE: specify recipient and amount
 * 2. BUILD: MeshJS Transaction handles coin selection, fee calc, balancing
 * 3. SIGN: the wallet extension prompts the user to approve
 * 4. SUBMIT: the signed transaction is sent to the network
 *
 * The Balancing Equation (always holds):
 *   sum(input values) = sum(output values) + fee
 *
 * MeshJS handles this automatically via the Transaction class,
 * just like QuickTxBuilder does in the Java version.
 */
export function SendAda() {
  const { connected, wallet } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!wallet || !recipient || !amount) return;
    setLoading(true);
    setError('');
    setTxHash('');

    try {
      // Convert ADA to lovelace (1 ADA = 1,000,000 lovelace)
      const lovelace = (parseFloat(amount) * 1_000_000).toFixed(0);

      // Step 1: Build the transaction
      // Transaction({ initiator: wallet }) uses the connected wallet
      // for coin selection (picking UTXOs) and change address
      const tx = new Transaction({ initiator: wallet });
      tx.sendLovelace(recipient, lovelace);

      // Step 2: Build returns unsigned transaction CBOR
      const unsignedTx = await tx.build();

      // Step 3: Sign -- the wallet extension shows a confirmation popup
      const signedTx = await wallet.signTx(unsignedTx);

      // Step 4: Submit to the network
      const hash = await wallet.submitTx(signedTx);
      setTxHash(hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (!connected) {
    return (
      <div className="card">
        <h2>Send ADA</h2>
        <p className="hint">Connect your wallet first.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Send ADA</h2>
      <p className="hint">
        Send ADA to any preprod address. The wallet extension will prompt you to approve.
      </p>

      <div className="form-group">
        <label>Recipient Address</label>
        <input
          type="text"
          placeholder="addr_test1..."
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Amount (ADA)</label>
        <input
          type="number"
          placeholder="e.g. 5"
          step="0.1"
          min="1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
        />
      </div>

      <button onClick={handleSend} disabled={loading || !recipient || !amount} className="btn">
        {loading ? 'Sending...' : 'Send ADA'}
      </button>

      {txHash && (
        <div className="result success">
          <strong>Transaction submitted!</strong>
          <br />
          TxHash: <span className="mono">{txHash}</span>
          <br />
          <a
            href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on CardanoScan
          </a>
        </div>
      )}

      {error && (
        <div className="result error">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
