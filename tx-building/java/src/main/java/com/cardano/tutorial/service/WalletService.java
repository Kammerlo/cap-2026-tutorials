package com.cardano.tutorial.service;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.api.model.Utxo;
import com.bloxbean.cardano.client.backend.api.BackendService;
import com.bloxbean.cardano.client.common.model.Networks;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;

/**
 * Tutorial Step 3: Wallet / Account Management
 *
 * This service demonstrates how Cardano addresses and accounts work.
 *
 * Key concepts:
 * - A mnemonic phrase (24 words) is the root of all keys
 * - From the mnemonic, we derive keys using BIP-44 / CIP-1852 paths
 * - An Account wraps the mnemonic and provides address derivation
 * - Addresses are Bech32-encoded: "addr_test1..." (testnet) or "addr1..." (mainnet)
 * - Each address can hold multiple UTXOs (unspent transaction outputs)
 */
@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);

    private final BackendService backendService;
    private final String network;

    public WalletService(BackendService backendService,
                         @Value("${cardano.network}") String network) {
        this.backendService = backendService;
        this.network = network;
    }

    /**
     * Generate a new account with a fresh mnemonic.
     *
     * The mnemonic is the "master key" - anyone who has it controls all
     * funds at all derived addresses. In production, NEVER log or expose it.
     *
     * HD Wallet Derivation (CIP-1852):
     *   m / 1852' / 1815' / account' / role / index
     *   - 1852 = Cardano Shelley purpose
     *   - 1815 = Cardano coin type (year Ada Lovelace was born)
     *   - account = account index (0, 1, 2, ...)
     *   - role = 0 (external/payment), 1 (internal/change), 2 (staking)
     *   - index = address index within role
     */
    public Account createAccount() {
        Account account = new Account(getNetwork());
        log.info("New account created. Address: {}", account.baseAddress());
        // WARNING: In production, the mnemonic must be stored securely!
        log.info("Mnemonic (KEEP SECRET): {}", account.mnemonic());
        return account;
    }

    /**
     * Restore an account from an existing mnemonic.
     * This is how users "recover" their wallet - the mnemonic IS the wallet.
     */
    public Account restoreAccount(String mnemonic) {
        Account account = Account.createFromMnemonic(getNetwork(), mnemonic);
        log.info("Account restored. Address: {}", account.baseAddress());
        return account;
    }

    /**
     * Get the base address for an account.
     *
     * A base address contains both a payment credential and a staking credential.
     * - Payment credential: controls spending (who can use the funds)
     * - Staking credential: controls delegation (which pool earns rewards)
     *
     * Testnet addresses start with "addr_test1..."
     * Mainnet addresses start with "addr1..."
     */
    public String getBaseAddress(Account account) {
        return account.baseAddress();
    }

    /**
     * Query all UTXOs at a given address.
     *
     * A UTXO (Unspent Transaction Output) is like a "coin" sitting at an address.
     * Each UTXO has:
     * - A transaction hash + output index (its unique identifier)
     * - A value (ADA amount + optional native tokens)
     * - Optionally: a datum hash, inline datum, or reference script
     *
     * Unlike account-based blockchains (Ethereum), there's no single "balance" -
     * your balance is the sum of all UTXOs at your address.
     */
    public List<Utxo> getUtxos(String address) throws Exception {
        var result = backendService.getUtxoService().getUtxos(address, 100, 1);
        if (!result.isSuccessful()) {
            throw new RuntimeException("Failed to query UTXOs: " + result.getResponse());
        }
        return result.getValue();
    }

    /**
     * Calculate the total ADA balance at an address.
     * This sums the lovelace value of all UTXOs.
     *
     * 1 ADA = 1,000,000 lovelace
     * All on-chain values are in lovelace (the smallest unit).
     */
    public BigInteger getBalance(String address) throws Exception {
        List<Utxo> utxos = getUtxos(address);
        return utxos.stream()
                .map(utxo -> utxo.getAmount().stream()
                        .filter(a -> "lovelace".equals(a.getUnit()))
                        .map(a -> a.getQuantity())
                        .findFirst()
                        .orElse(BigInteger.ZERO))
                .reduce(BigInteger.ZERO, BigInteger::add);
    }

    private com.bloxbean.cardano.client.common.model.Network getNetwork() {
        return switch (network) {
            case "mainnet" -> Networks.mainnet();
            case "preview" -> Networks.preview();
            default -> Networks.preprod();
        };
    }
}
