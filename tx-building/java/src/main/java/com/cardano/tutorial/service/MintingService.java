package com.cardano.tutorial.service;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.api.model.Result;
import com.bloxbean.cardano.client.common.model.Networks;
import com.bloxbean.cardano.client.function.helper.SignerProviders;
import com.bloxbean.cardano.client.quicktx.QuickTxBuilder;
import com.bloxbean.cardano.client.quicktx.Tx;
import com.bloxbean.cardano.client.transaction.spec.Asset;
import com.bloxbean.cardano.client.transaction.spec.Policy;
import com.bloxbean.cardano.client.api.util.PolicyUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigInteger;

/**
 * Tutorial Step 6: Minting Native Tokens
 *
 * Cardano has a native multi-asset ledger - tokens are first-class citizens,
 * not smart contract state. This means:
 * - Minting doesn't require a smart contract (unlike ERC-20 on Ethereum)
 * - Tokens are carried in transaction outputs alongside ADA
 * - The ledger enforces minting rules via "policy scripts"
 *
 * Minting Policy:
 * A minting policy defines WHO can mint/burn tokens and WHEN.
 * The policy is hashed to produce the PolicyId - this is the token's
 * "family name" and cannot be changed after creation.
 *
 * Types of policies:
 * - ScriptAll:    ALL listed keys must sign (multi-sig)
 * - ScriptAny:    ANY one key must sign
 * - ScriptAtLeast: at least N-of-M keys must sign
 * - RequireTimeBefore/After: time-locked (slot-based)
 * - Plutus scripts: arbitrary on-chain logic (out of scope for this tutorial)
 *
 * PolicyId + AssetName = unique token identifier
 * - PolicyId: 28-byte hash of the policy script (56 hex chars)
 * - AssetName: up to 32 bytes, human-readable name (hex-encoded on-chain)
 */
@Service
public class MintingService {

    private static final Logger log = LoggerFactory.getLogger(MintingService.class);

    private final QuickTxBuilder quickTxBuilder;
    private final String network;

    public MintingService(QuickTxBuilder quickTxBuilder,
                          @Value("${cardano.network}") String network) {
        this.quickTxBuilder = quickTxBuilder;
        this.network = network;
    }

    /**
     * Mint a new native token with a simple single-signer policy.
     *
     * This creates a policy that requires only the minter's key to sign.
     * Anyone with this key can mint or burn tokens under this policy at any time.
     *
     * Flow:
     * 1. Create a minting policy (defines the rules)
     * 2. Define the asset (name + quantity)
     * 3. Build a minting transaction
     * 4. Sign with both the payment key AND the policy key
     * 5. Submit to the network
     *
     * @param minterMnemonic  the minter's mnemonic (also pays the fee)
     * @param tokenName       human-readable token name (e.g., "TutorialToken")
     * @param quantity        how many tokens to mint
     * @param receiverAddress where to send the minted tokens (null = send to minter)
     * @return a MintResult with the transaction hash and policy ID
     */
    public MintResult mintToken(String minterMnemonic, String tokenName,
                                BigInteger quantity, String receiverAddress) throws Exception {
        Account minter = Account.createFromMnemonic(getNetwork(), minterMnemonic);
        String minterAddress = minter.baseAddress();

        // If no receiver specified, mint to the minter's own address
        String targetAddress = receiverAddress != null ? receiverAddress : minterAddress;

        // Step 1: Create a minting policy
        // PolicyUtil generates a policy with fresh key pair(s).
        // The number (1) is how many key pairs to generate for the ScriptAll policy.
        Policy policy = PolicyUtil.createMultiSigScriptAllPolicy("TutorialPolicy", 1);

        String policyId = policy.getPolicyId();
        log.info("Created minting policy. PolicyId: {}", policyId);

        // Step 2: Define the asset to mint
        Asset asset = new Asset(tokenName, quantity);

        // Step 3: Build the minting transaction
        Tx mintTx = new Tx()
                .mintAssets(policy.getPolicyScript(), asset, targetAddress)
                .from(minterAddress);

        // Step 4: Sign and submit
        // IMPORTANT: Minting requires TWO signatures:
        // 1. The payment key (to spend UTXOs for the fee)
        // 2. The policy key (to authorize minting)
        Result<String> result = quickTxBuilder
                .compose(mintTx)
                .withSigner(SignerProviders.signerFrom(minter))
                .withSigner(SignerProviders.signerFrom(policy))
                .complete();

        if (!result.isSuccessful()) {
            throw new RuntimeException("Minting failed: " + result.getResponse());
        }

        String txHash = result.getValue();
        log.info("Tokens minted! TxHash: {}", txHash);
        log.info("Token: {}.{} (qty: {})", policyId, tokenName, quantity);
        log.info("View on explorer: https://preprod.cardanoscan.io/transaction/{}", txHash);

        return new MintResult(txHash, policyId, tokenName, quantity);
    }

    /**
     * Burn (destroy) native tokens.
     *
     * Burning is simply minting with a NEGATIVE quantity.
     * The same policy rules apply - you need the policy key to burn.
     *
     * Why burn tokens?
     * - Reduce supply of a token
     * - Destroy tokens that are no longer needed
     * - Token lifecycle management
     *
     * @param minterMnemonic the minter's mnemonic (must hold the tokens)
     * @param policy         the policy (must match the token's policy, including keys)
     * @param tokenName      the token name to burn
     * @param quantity       how many tokens to burn (will be negated internally)
     */
    public String burnTokens(String minterMnemonic, Policy policy,
                             String tokenName, BigInteger quantity) {
        Account minter = Account.createFromMnemonic(getNetwork(), minterMnemonic);

        // Burning = minting with negative quantity
        Asset asset = new Asset(tokenName, quantity.negate());

        Tx burnTx = new Tx()
                .mintAssets(policy.getPolicyScript(), asset, minter.baseAddress())
                .from(minter.baseAddress());

        Result<String> result = quickTxBuilder
                .compose(burnTx)
                .withSigner(SignerProviders.signerFrom(minter))
                .withSigner(SignerProviders.signerFrom(policy))
                .complete();

        if (!result.isSuccessful()) {
            throw new RuntimeException("Burn failed: " + result.getResponse());
        }

        return result.getValue();
    }

    private com.bloxbean.cardano.client.common.model.Network getNetwork() {
        return switch (network) {
            case "mainnet" -> Networks.mainnet();
            case "preview" -> Networks.preview();
            default -> Networks.preprod();
        };
    }

    /**
     * Result of a minting operation.
     */
    public record MintResult(String txHash, String policyId, String tokenName, BigInteger quantity) {}
}
