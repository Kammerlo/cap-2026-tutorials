package com.cardano.tutorial.service;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.address.AddressProvider;
import com.bloxbean.cardano.client.api.TransactionEvaluator;
import com.bloxbean.cardano.client.api.UtxoSupplier;
import com.bloxbean.cardano.client.api.model.Amount;
import com.bloxbean.cardano.client.api.model.Result;
import com.bloxbean.cardano.client.api.model.Utxo;
import com.bloxbean.cardano.client.common.model.Network;
import com.bloxbean.cardano.client.function.helper.SignerProviders;
import com.bloxbean.cardano.client.plutus.spec.*;
import com.bloxbean.cardano.client.quicktx.QuickTxBuilder;
import com.bloxbean.cardano.client.quicktx.ScriptTx;
import com.bloxbean.cardano.client.util.HexUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Service for updating CIP-68 token metadata (Plutus V3 multi-handler validator).
 *
 * The on-chain validator uses a combined mint + spend pattern:
 *   - The reference NFT is locked at the validator's own script address
 *   - To update metadata: spend the old ref-NFT UTXO with UpdateMeta redeemer,
 *     then create a new output at the same address with updated datum
 *
 * Spend redeemers (StoreAction):
 *   UpdateMeta = Constr(0, [])  — update the metadata datum
 *   RemoveMeta = Constr(1, [])  — remove the ref NFT (for burning)
 *
 * The validator requires the owner's signature for all operations.
 */
@Service
public class Cip68MetadataService {

    private static final Logger log = LoggerFactory.getLogger(Cip68MetadataService.class);

    private final QuickTxBuilder quickTxBuilder;
    private final UtxoSupplier utxoSupplier;
    private final ScriptLoader scriptLoader;
    private final Network network;
    private final TransactionEvaluator txEvaluator;

    public Cip68MetadataService(QuickTxBuilder quickTxBuilder,
                                UtxoSupplier utxoSupplier,
                                ScriptLoader scriptLoader,
                                Network network,
                                TransactionEvaluator txEvaluator) {
        this.quickTxBuilder = quickTxBuilder;
        this.utxoSupplier = utxoSupplier;
        this.scriptLoader = scriptLoader;
        this.network = network;
        this.txEvaluator = txEvaluator;
    }

    /**
     * Update the metadata of an existing CIP-68 token.
     *
     * This spends the reference NFT UTXO at the script address with the
     * UpdateMeta redeemer and re-creates it with new metadata.
     *
     * @param mnemonic    24-word wallet mnemonic (must be the owner)
     * @param tokenName   base token name (without label prefix)
     * @param newMetadata updated key-value metadata
     * @return transaction hash
     */
    public String updateMetadata(String mnemonic,
                                 String tokenName,
                                 Map<String, String> newMetadata) throws Exception {
        Account account = new Account(network, mnemonic);
        String signerAddress = account.baseAddress();
        byte[] ownerPkh = account.hdKeyPair().getPublicKey().getKeyHash();

        // Load parameterized script with owner's key hash
        PlutusScript cip68Script = scriptLoader.loadCip68Script(ownerPkh);
        String policyId = cip68Script.getPolicyId();
        String scriptAddress = AddressProvider.getEntAddress(cip68Script, network).toBech32();

        // Build the label-100 (reference NFT) asset name
        String tokenNameHex = HexUtil.encodeHexString(tokenName.getBytes(StandardCharsets.UTF_8));
        String refAssetNameHex = Cip68MintService.LABEL_100_PREFIX + tokenNameHex;
        String refAssetUnit = policyId + refAssetNameHex;

        // Find the reference NFT UTXO at the script address
        List<Utxo> utxos = utxoSupplier.getAll(scriptAddress);
        Utxo refNftUtxo = utxos.stream()
                .filter(u -> u.getAmount().stream().anyMatch(a ->
                        a.getUnit().equals(refAssetUnit)))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Reference NFT not found at script address for token: " + tokenName));

        // Spend redeemer: UpdateMeta = Constr(0, []) (first variant of StoreAction)
        PlutusData updateMetaRedeemer = ConstrPlutusData.of(0);

        // New CIP-68 metadata datum
        PlutusData newDatum = Cip68MintService.buildCip68MetadataDatum(newMetadata);

        // Build a ScriptTx that:
        //   1. Spends the old reference NFT from the script address (UpdateMeta redeemer)
        //   2. Pays a new output to the same script address with updated datum + ref NFT
        ScriptTx scriptTx = new ScriptTx()
                .collectFrom(refNftUtxo, updateMetaRedeemer)
                .payToContract(scriptAddress,
                        List.of(
                                Amount.lovelace(BigInteger.valueOf(2_000_000)),
                                Amount.asset(refAssetUnit, BigInteger.ONE)
                        ),
                        newDatum)
                .attachSpendingValidator(cip68Script)
                .withChangeAddress(signerAddress);

        Result<String> result = quickTxBuilder.compose(scriptTx)
                .feePayer(signerAddress)
                .withSigner(SignerProviders.signerFrom(account))
                .withRequiredSigners(ownerPkh)
                .withTxEvaluator(txEvaluator)
                .completeAndWait(System.out::println);

        if (!result.isSuccessful()) {
            throw new RuntimeException("Metadata update failed: " + result.getResponse());
        }

        log.info("Metadata updated for {}.{}. TxHash: {}", policyId, tokenName, result.getValue());
        return result.getValue();
    }
}
