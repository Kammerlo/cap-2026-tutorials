package com.cardano.tutorial.service;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.address.AddressProvider;
import com.bloxbean.cardano.client.api.UtxoSupplier;
import com.bloxbean.cardano.client.api.model.Amount;
import com.bloxbean.cardano.client.api.model.Result;
import com.bloxbean.cardano.client.api.model.Utxo;
import com.bloxbean.cardano.client.common.model.Network;
import com.bloxbean.cardano.client.function.helper.SignerProviders;
import com.bloxbean.cardano.client.plutus.spec.ConstrPlutusData;
import com.bloxbean.cardano.client.plutus.spec.BytesPlutusData;
import com.bloxbean.cardano.client.plutus.spec.PlutusData;
import com.bloxbean.cardano.client.plutus.spec.PlutusScript;
import com.bloxbean.cardano.client.quicktx.QuickTxBuilder;
import com.bloxbean.cardano.client.quicktx.ScriptTx;
import com.bloxbean.cardano.client.quicktx.Tx;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.util.List;

/**
 * Service for interacting with the Hello World smart contract (Plutus V3).
 *
 * The contract validates two conditions:
 *   1. The redeemer message must match the message stored in the datum
 *   2. The transaction must be signed by the datum owner's key
 *
 * Lock flow  — sends ADA to the script address with an inline datum
 *              containing the owner's key hash and a secret message.
 * Unlock flow — spends the script UTXO by providing the matching message
 *               and signing with the owner's key.
 */
@Service
public class HelloWorldService {

    private static final Logger log = LoggerFactory.getLogger(HelloWorldService.class);

    private final QuickTxBuilder quickTxBuilder;
    private final UtxoSupplier utxoSupplier;
    private final ScriptLoader scriptLoader;
    private final Network network;

    public HelloWorldService(QuickTxBuilder quickTxBuilder,
                             UtxoSupplier utxoSupplier,
                             ScriptLoader scriptLoader,
                             Network network) {
        this.quickTxBuilder = quickTxBuilder;
        this.utxoSupplier = utxoSupplier;
        this.scriptLoader = scriptLoader;
        this.network = network;
    }

    /**
     * Returns the on-chain script address for the hello-world validator.
     */
    public String getScriptAddress() throws Exception {
        PlutusScript script = scriptLoader.loadHelloWorldScript();
        return AddressProvider.getEntAddress(script, network).toBech32();
    }

    /**
     * Lock ADA to the hello world script.
     *
     * The inline datum is Constr(0, [owner_pkh, msg]) matching:
     *   Datum { owner: VerificationKeyHash, msg: ByteArray }
     *
     * @param mnemonic 24-word wallet mnemonic
     * @param lovelace amount of lovelace to lock
     * @param message  the secret message stored in the datum
     * @return transaction hash
     */
    public String lock(String mnemonic, long lovelace, String message) throws Exception {
        Account account = new Account(network, mnemonic);
        String senderAddress = account.baseAddress();

        PlutusScript script = scriptLoader.loadHelloWorldScript();
        String scriptAddress = AddressProvider.getEntAddress(script, network).toBech32();

        // Build datum: Constr(0, [owner_pkh, msg])
        byte[] pkhBytes = account.hdKeyPair().getPublicKey().getKeyHash();
        PlutusData datum = ConstrPlutusData.of(0,
                BytesPlutusData.of(pkhBytes),
                BytesPlutusData.of(message));

        // Regular Tx that pays to the script address with an inline datum
        Tx tx = new Tx()
                .payToContract(scriptAddress, Amount.lovelace(BigInteger.valueOf(lovelace)), datum)
                .from(senderAddress);

        Result<String> result = quickTxBuilder.compose(tx)
                .withSigner(SignerProviders.signerFrom(account))
                .complete();

        if (!result.isSuccessful()) {
            throw new RuntimeException("Lock failed: " + result.getResponse());
        }

        log.info("Locked {} lovelace at {}. TxHash: {}", lovelace, scriptAddress, result.getValue());
        return result.getValue();
    }

    /**
     * Unlock ADA from the hello world script.
     *
     * Finds the UTXO by the locking transaction hash and spends it with
     * the user-provided message as redeemer.
     *
     * @param mnemonic   24-word wallet mnemonic (must be the datum owner)
     * @param lockTxHash tx hash of the locking transaction
     * @param message    the message to unlock (must match the datum message)
     * @return transaction hash
     */
    public String unlock(String mnemonic, String lockTxHash, String message) throws Exception {
        Account account = new Account(network, mnemonic);
        String receiverAddress = account.baseAddress();

        PlutusScript script = scriptLoader.loadHelloWorldScript();
        String scriptAddress = AddressProvider.getEntAddress(script, network).toBech32();

        // Find the UTXO at the script address from the locking tx
        List<Utxo> utxos = utxoSupplier.getAll(scriptAddress);
        Utxo utxo = utxos.stream()
                .filter(u -> u.getTxHash().equals(lockTxHash))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No UTXO found at script address for tx: " + lockTxHash));

        // Build the redeemer: Constr(0, [msg]) matching Redeemer { msg: ByteArray }
        PlutusData redeemer = ConstrPlutusData.of(0,
                BytesPlutusData.of(message));

        // ScriptTx to spend the UTXO from the script
        ScriptTx scriptTx = new ScriptTx()
                .collectFrom(utxo, redeemer)
                .payToAddress(receiverAddress, Amount.lovelace(utxo.getAmount().get(0).getQuantity()))
                .attachSpendingValidator(script)
                .withChangeAddress(receiverAddress);

        Result<String> result = quickTxBuilder.compose(scriptTx)
                .feePayer(receiverAddress)
                .withSigner(SignerProviders.signerFrom(account))
                .withRequiredSigners(account.hdKeyPair().getPublicKey().getKeyHash())
                .completeAndWait(System.out::println);

        if (!result.isSuccessful()) {
            throw new RuntimeException("Unlock failed: " + result.getResponse());
        }

        log.info("Unlocked from {}. TxHash: {}", scriptAddress, result.getValue());
        return result.getValue();
    }
}
