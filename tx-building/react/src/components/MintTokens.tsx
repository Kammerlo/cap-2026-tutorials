import { useWallet } from '@meshsdk/react';
import { ForgeScript, Transaction, type Mint } from '@meshsdk/core';
import { useState } from 'react';

/**
 * Tutorial Step 6: Mint Native Tokens
 *
 * Cardano has a native multi-asset ledger -- tokens are first-class citizens,
 * not smart contract state. This means minting doesn't require a smart contract
 * (unlike ERC-20 on Ethereum).
 *
 * Minting Policy:
 * A minting policy defines WHO can mint/burn tokens and WHEN.
 * The policy is hashed to produce the PolicyId -- the token's "family name".
 *
 * In this browser-based approach, we use ForgeScript.withOneSignature()
 * which creates a policy requiring only the connected wallet's key.
 * This is equivalent to the Java PolicyUtil.createMultiSigScriptAllPolicy()
 * but uses the wallet's existing key instead of generating a new one.
 *
 * Key difference from Java:
 * - Java: generates a fresh policy key pair, needs both payment + policy signatures
 * - MeshJS: uses the wallet's payment key as the policy key (one signature for both)
 *   The wallet extension handles signing automatically.
 */
export function MintTokens() {
  const { connected, wallet } = useWallet();
  const [tokenName, setTokenName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [recipient, setRecipient] = useState('');
  const [txHash, setTxHash] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleMint() {
    if (!wallet || !tokenName || !quantity) return;
    setLoading(true);
    setError('');
    setTxHash('');
    setPolicyId('');

    try {
      // Get the wallet's address to create the minting policy
      const usedAddresses = await wallet.getUsedAddresses();
      const walletAddress = usedAddresses[0] ?? (await wallet.getUnusedAddresses())[0];

      // Step 1: Create a minting policy
      // ForgeScript.withOneSignature creates a native script that requires
      // the payment key of the given address to sign.
      // The policyId is the hash of this script.
      const forgingScript = ForgeScript.withOneSignature(walletAddress);

      // Step 2: Define what to mint
      // If no recipient specified, tokens go to the minter's address
      const mintConfig: Mint = {
        assetName: tokenName,
        assetQuantity: quantity,
        recipient: recipient || walletAddress,
      };

      // Step 3: Build the minting transaction
      const tx = new Transaction({ initiator: wallet });
      tx.mintAsset(forgingScript, mintConfig);

      // Step 4: Build, sign, and submit
      // The wallet extension prompts the user to approve.
      // Since the policy uses the wallet's key, only one signature is needed.
      const unsignedTx = await tx.build();
      const signedTx = await wallet.signTx(unsignedTx);
      const hash = await wallet.submitTx(signedTx);

      setTxHash(hash);

      // Extract policyId from the forging script for display
      // The policyId is derived from the script hash
      setPolicyId(forgingScript);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  if (!connected) {
    return (
      <div className="card">
        <h2>Mint Tokens</h2>
        <p className="hint">Connect your wallet first.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Mint Native Tokens</h2>
      <p className="hint">
        Mint new native tokens using a single-signature policy derived from your wallet's key.
        Your wallet must have enough ADA to cover the transaction fee and min UTXO.
      </p>

      <div className="form-group">
        <label>Token Name</label>
        <input
          type="text"
          placeholder="e.g. TutorialToken"
          value={tokenName}
          onChange={e => setTokenName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Quantity</label>
        <input
          type="number"
          placeholder="e.g. 1000"
          min="1"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Recipient Address (optional, defaults to your wallet)</label>
        <input
          type="text"
          placeholder="addr_test1... (leave empty for self)"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
        />
      </div>

      <button
        onClick={handleMint}
        disabled={loading || !tokenName || !quantity}
        className="btn"
      >
        {loading ? 'Minting...' : 'Mint Tokens'}
      </button>

      {txHash && (
        <div className="result success">
          <strong>Tokens minted!</strong>
          <br />
          TxHash: <span className="mono">{txHash}</span>
          <br />
          {policyId && (
            <>
              Policy Script: <span className="mono">{policyId}</span>
              <br />
            </>
          )}
          Token: {tokenName} (qty: {quantity})
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
