import { useWallet } from '@meshsdk/react';
import { Transaction } from '@meshsdk/core';
import { useState } from 'react';

/**
 * Tutorial Step 5: Send Native Tokens
 *
 * Cardano's native multi-asset ledger allows tokens to live alongside ADA
 * without smart contracts. Each token is identified by:
 * - PolicyId: hash of the minting policy script (56 hex chars)
 * - AssetName: human-readable name (hex-encoded on-chain, max 32 bytes)
 *
 * The "unit" is policyId + assetNameHex concatenated.
 *
 * IMPORTANT: Min UTXO Value
 * Every UTXO carrying tokens must also carry a minimum amount of ADA
 * (governed by coinsPerUTXOByte). MeshJS handles this automatically.
 *
 * This mirrors the Java TransferService.sendNativeTokens() method.
 */
export function SendTokens() {
  const { connected, wallet } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!wallet || !recipient || !policyId || !assetName || !quantity) return;
    setLoading(true);
    setError('');
    setTxHash('');

    try {
      // Convert asset name to hex (on-chain, asset names are hex-encoded)
      const assetNameHex = Buffer.from(assetName, 'utf8').toString('hex');

      // The "unit" is policyId + assetNameHex
      // This uniquely identifies the token on the Cardano ledger
      const unit = policyId + assetNameHex;

      // Build transaction with token transfer
      // sendAssets automatically includes the minimum required ADA
      const tx = new Transaction({ initiator: wallet });
      tx.sendAssets(recipient, [{ unit, quantity }]);

      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
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
        <h2>Send Tokens</h2>
        <p className="hint">Connect your wallet first.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Send Native Tokens</h2>
      <p className="hint">
        Send native tokens to an address. You must hold the tokens in your wallet.
        The minimum ADA (for min UTXO) is included automatically.
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
        <label>Policy ID (56 hex chars)</label>
        <input
          type="text"
          placeholder="e.g. a1b2c3d4..."
          value={policyId}
          onChange={e => setPolicyId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Asset Name</label>
        <input
          type="text"
          placeholder="e.g. TutorialToken"
          value={assetName}
          onChange={e => setAssetName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Quantity</label>
        <input
          type="number"
          placeholder="e.g. 100"
          min="1"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
        />
      </div>

      <button
        onClick={handleSend}
        disabled={loading || !recipient || !policyId || !assetName || !quantity}
        className="btn"
      >
        {loading ? 'Sending...' : 'Send Tokens'}
      </button>

      {txHash && (
        <div className="result success">
          <strong>Token transfer submitted!</strong>
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
