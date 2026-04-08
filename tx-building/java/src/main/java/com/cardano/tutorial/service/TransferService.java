package com.cardano.tutorial.service;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.api.model.Amount;
import com.bloxbean.cardano.client.api.model.Result;
import com.bloxbean.cardano.client.common.model.Networks;
import com.bloxbean.cardano.client.function.helper.SignerProviders;
import com.bloxbean.cardano.client.quicktx.QuickTxBuilder;
import com.bloxbean.cardano.client.quicktx.Tx;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;

import static com.bloxbean.cardano.client.common.ADAConversionUtil.adaToLovelace;

/**
 * Tutorial Step 4 & 5: ADA Transfers & Multi-Asset Transfers
 *
 * This service demonstrates how to build and submit transactions
 * using the QuickTx API - the recommended high-level approach.
 *
 * The Transaction Lifecycle:
 * 1. DEFINE what you want to do (pay someone, mint tokens, etc.)
 * 2. COMPOSE the transaction (QuickTxBuilder handles coin selection, fees, balancing)
 * 3. SIGN with your private key(s)
 * 4. SUBMIT to the network
 * 5. VERIFY on a block explorer or by querying UTXOs
 *
 * The Balancing Equation (must ALWAYS hold):
 *   sum(input values) = sum(output values) + fee
 *
 * QuickTxBuilder handles this automatically, but understanding it
 * is crucial for debugging failed transactions.
 */
@Service
public class TransferService {

    private static final Logger log = LoggerFactory.getLogger(TransferService.class);

    private final QuickTxBuilder quickTxBuilder;
    private final String network;

    public TransferService(QuickTxBuilder quickTxBuilder,
                           @Value("${cardano.network}") String network) {
        this.quickTxBuilder = quickTxBuilder;
        this.network = network;
    }

    /**
     * Send ADA from one address to another.
     *
     * This is the simplest possible transaction:
     * - One sender, one receiver, one amount
     * - QuickTxBuilder automatically:
     *   (a) Selects UTXOs from the sender's address (coin selection)
     *   (b) Calculates the fee (linear: minFeeA * txSize + minFeeB)
     *   (c) Creates a change output back to the sender
     *   (d) Balances the transaction
     *
     * @param senderMnemonic  the sender's 24-word mnemonic phrase
     * @param receiverAddress the recipient's Bech32 address (addr_test1...)
     * @param adaAmount       the amount of ADA to send (e.g., 10.0 for 10 ADA)
     * @return the transaction hash if successful
     */
    public String sendAda(String senderMnemonic, String receiverAddress, double adaAmount) {
        // Step 1: Restore the sender's account from mnemonic
        Account sender = Account.createFromMnemonic(getNetwork(), senderMnemonic);
        String senderAddress = sender.baseAddress();
        log.info("Sending {} ADA from {} to {}", adaAmount, senderAddress, receiverAddress);

        // Step 2: Define the transaction
        // Tx is a declarative description of what we want to do.
        // .payToAddress() adds an output; .from() specifies which address to select inputs from.
        BigInteger lovelaceAmount = adaToLovelace(adaAmount);
        Tx tx = new Tx()
                .payToAddress(receiverAddress, Amount.lovelace(lovelaceAmount))
                .from(senderAddress);

        // Step 3: Build, sign, and submit
        // .compose()  - assembles the transaction, runs coin selection & fee calculation
        // .withSigner() - attaches the signing key
        // .complete() - signs and submits to the blockchain
        Result<String> result = quickTxBuilder
                .compose(tx)
                .withSigner(SignerProviders.signerFrom(sender))
                .complete();

        if (!result.isSuccessful()) {
            throw new RuntimeException("Transaction failed: " + result.getResponse());
        }

        String txHash = result.getValue();
        log.info("Transaction submitted! TxHash: {}", txHash);
        log.info("View on explorer: https://preprod.cardanoscan.io/transaction/{}", txHash);
        return txHash;
    }

    /**
     * Send ADA in lovelace (for precise amounts).
     *
     * Why lovelace?
     * On-chain, all ADA values are stored as integers in lovelace.
     * 1 ADA = 1,000,000 lovelace
     * Using lovelace avoids floating-point precision issues.
     */
    public String sendLovelace(String senderMnemonic, String receiverAddress, BigInteger lovelaceAmount) {
        Account sender = Account.createFromMnemonic(getNetwork(), senderMnemonic);

        Tx tx = new Tx()
                .payToAddress(receiverAddress, Amount.lovelace(lovelaceAmount))
                .from(sender.baseAddress());

        Result<String> result = quickTxBuilder
                .compose(tx)
                .withSigner(SignerProviders.signerFrom(sender))
                .complete();

        if (!result.isSuccessful()) {
            throw new RuntimeException("Transaction failed: " + result.getResponse());
        }

        return result.getValue();
    }

    /**
     * Send native tokens (multi-asset transfer).
     *
     * Cardano's native multi-asset ledger allows tokens to exist without smart contracts.
     * Every token is identified by:
     * - PolicyId: a hash of the minting policy script (28 bytes / 56 hex chars)
     * - AssetName: a human-readable name (hex-encoded on-chain, max 32 bytes)
     *
     * The "unit" is policyId + assetName concatenated (e.g., "abc123...def456MyToken").
     *
     * IMPORTANT: Min UTXO Value
     * Every UTXO must carry a minimum amount of ADA. This minimum increases
     * with the UTXO's size (more tokens = more ADA required). This is governed
     * by the protocol parameter `coinsPerUTXOByte`.
     *
     * QuickTxBuilder handles min UTXO automatically - if your output doesn't
     * carry enough ADA, it will add the required minimum.
     *
     * @param senderMnemonic  the sender's mnemonic
     * @param receiverAddress the recipient's address
     * @param policyId        the token's policy ID (56 hex chars)
     * @param assetName       the token's asset name
     * @param quantity        how many tokens to send
     * @param adaAmount       ADA to include with the tokens (must meet min UTXO)
     * @return the transaction hash
     */
    public String sendNativeTokens(String senderMnemonic, String receiverAddress,
                                   String policyId, String assetName,
                                   BigInteger quantity, double adaAmount) {
        Account sender = Account.createFromMnemonic(getNetwork(), senderMnemonic);
        String senderAddress = sender.baseAddress();
        log.info("Sending {} tokens ({}.{}) from {} to {}",
                quantity, policyId.substring(0, 8) + "...", assetName,
                senderAddress, receiverAddress);

        // Build a multi-asset output: ADA + native tokens
        BigInteger lovelaceAmount = adaToLovelace(adaAmount);
        Tx tx = new Tx()
                .payToAddress(receiverAddress, List.of(
                        Amount.lovelace(lovelaceAmount),
                        Amount.asset(policyId, assetName, quantity)
                ))
                .from(senderAddress);

        Result<String> result = quickTxBuilder
                .compose(tx)
                .withSigner(SignerProviders.signerFrom(sender))
                .complete();

        if (!result.isSuccessful()) {
            throw new RuntimeException("Token transfer failed: " + result.getResponse());
        }

        String txHash = result.getValue();
        log.info("Token transfer submitted! TxHash: {}", txHash);
        return txHash;
    }

    private com.bloxbean.cardano.client.common.model.Network getNetwork() {
        return switch (network) {
            case "mainnet" -> Networks.mainnet();
            case "preview" -> Networks.preview();
            default -> Networks.preprod();
        };
    }
}
