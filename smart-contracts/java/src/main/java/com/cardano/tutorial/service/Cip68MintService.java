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
import com.bloxbean.cardano.client.transaction.spec.Asset;
import com.bloxbean.cardano.client.util.HexUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Service for minting CIP-68 compliant tokens (Plutus V3 multi-handler validator).
 *
 * The on-chain validator is parameterized by the owner's verification key hash:
 *   validator cip68(owner: VerificationKeyHash) { mint(...) { ... } spend(...) { ... } }
 *
 * CIP-68 defines on-chain token metadata using a dual-token architecture:
 *   Label 100 (prefix 000643b0) — Reference NFT, holds metadata as inline datum
 *   Label 222 (prefix 000de140) — User NFT, the token users actually hold
 *
 * Both tokens share the same base name and are minted in a single transaction.
 */
@Service
public class Cip68MintService {

    private static final Logger log = LoggerFactory.getLogger(Cip68MintService.class);

    // CIP-67 label prefixes (4 bytes each, hex-encoded = 8 chars)
    public static final String LABEL_100_PREFIX = "000643b0"; // Reference NFT
    public static final String LABEL_222_PREFIX = "000de140"; // User NFT

    private final QuickTxBuilder quickTxBuilder;
    private final UtxoSupplier utxoSupplier;
    private final ScriptLoader scriptLoader;
    private final Network network;
    private final TransactionEvaluator txEvaluator;

    public Cip68MintService(QuickTxBuilder quickTxBuilder,
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
     * Returns the policy ID of the CIP-68 minting script for a given owner.
     * Since the script is parameterized, the policy ID depends on the owner's key hash.
     */
    public String getPolicyId(byte[] ownerPkh) throws Exception {
        PlutusScript script = scriptLoader.loadCip68Script(ownerPkh);
        return script.getPolicyId();
    }

    /**
     * Mint a CIP-68 token pair (reference NFT + user NFT) with metadata.
     *
     * The minter becomes the owner of the parameterized validator — only they
     * can mint, burn, or update metadata.
     *
     * @param mnemonic  24-word wallet mnemonic (also used as the owner parameter)
     * @param tokenName base token name (without label prefix)
     * @param metadata  key-value metadata to store as inline datum on the reference NFT
     * @return transaction hash
     */
    public String mint(String mnemonic, String tokenName, Map<String, String> metadata) throws Exception {
        Account account = new Account(network, mnemonic);
        String minterAddress = account.baseAddress();
        byte[] ownerPkh = account.hdKeyPair().getPublicKey().getKeyHash();

        // Load the parameterized script with the owner's key hash applied
        PlutusScript cip68Script = scriptLoader.loadCip68Script(ownerPkh);
        String policyId = cip68Script.getPolicyId();
        String scriptAddress = AddressProvider.getEntAddress(cip68Script, network).toBech32();

        // Build CIP-68 asset names = label prefix + UTF-8 token name
        String tokenNameHex = HexUtil.encodeHexString(tokenName.getBytes(StandardCharsets.UTF_8));
        String refAssetNameHex = LABEL_100_PREFIX + tokenNameHex;   // label-100
        String usrAssetNameHex = LABEL_222_PREFIX + tokenNameHex;   // label-222

        Asset refAsset = new Asset("0x" + refAssetNameHex, BigInteger.ONE);
        Asset usrAsset = new Asset("0x" + usrAssetNameHex, BigInteger.ONE);

        // Redeemer: Constr(0, [])  ↔  Aiken MintTokens (first variant, index 0)
        PlutusData mintRedeemer = ConstrPlutusData.of(0);

        // Build CIP-68 metadata datum: Constr(0, [ metadata_map, version, extra ])
        PlutusData metadataDatum = buildCip68MetadataDatum(metadata);

        // ScriptTx — mint ref NFT directly to script address with datum, user NFT to minter
        ScriptTx scriptTx = new ScriptTx()
                .mintAsset(cip68Script, List.of(refAsset), mintRedeemer, scriptAddress, metadataDatum)
                .mintAsset(cip68Script, usrAsset, mintRedeemer, minterAddress)
                .withChangeAddress(minterAddress);

        Result<String> result = quickTxBuilder.compose(scriptTx)
                .feePayer(minterAddress)
                .withSigner(SignerProviders.signerFrom(account))
                .withRequiredSigners(ownerPkh)
                .withTxEvaluator(txEvaluator)
                .completeAndWait(System.out::println);

        if (!result.isSuccessful()) {
            throw new RuntimeException("CIP-68 minting failed: " + result.getResponse());
        }

        log.info("CIP-68 token minted. Policy: {}, Name: {}, TxHash: {}",
                policyId, tokenName, result.getValue());
        return result.getValue();
    }

    /**
     * Burn a CIP-68 token pair (reference NFT + user NFT).
     *
     * Burning requires two validator interactions:
     *   1. Spend handler: unlock the reference NFT from the script address (RemoveMeta redeemer)
     *   2. Mint handler: burn both tokens with negative quantities (BurnTokens redeemer)
     *
     * @param mnemonic  24-word wallet mnemonic (must be the owner)
     * @param tokenName base token name (without label prefix)
     * @return transaction hash
     */
    public String burn(String mnemonic, String tokenName) throws Exception {
        Account account = new Account(network, mnemonic);
        String signerAddress = account.baseAddress();
        byte[] ownerPkh = account.hdKeyPair().getPublicKey().getKeyHash();

        PlutusScript cip68Script = scriptLoader.loadCip68Script(ownerPkh);
        String policyId = cip68Script.getPolicyId();
        String scriptAddress = AddressProvider.getEntAddress(cip68Script, network).toBech32();

        String tokenNameHex = HexUtil.encodeHexString(tokenName.getBytes(StandardCharsets.UTF_8));
        String refAssetNameHex = LABEL_100_PREFIX + tokenNameHex;
        String usrAssetNameHex = LABEL_222_PREFIX + tokenNameHex;
        String refAssetUnit = policyId + refAssetNameHex;

        Asset refAsset = new Asset("0x" + refAssetNameHex, BigInteger.ONE.negate());
        Asset usrAsset = new Asset("0x" + usrAssetNameHex, BigInteger.ONE.negate());

        // Find the reference NFT UTXO locked at the script address
        List<Utxo> utxos = utxoSupplier.getAll(scriptAddress);
        Utxo refNftUtxo = utxos.stream()
                .filter(u -> u.getAmount().stream().anyMatch(a ->
                        a.getUnit().equals(refAssetUnit)))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Reference NFT not found at script address for token: " + tokenName));

        // Spend redeemer: RemoveMeta = Constr(1, []) — unlocks the ref NFT from script address
        PlutusData removeMetaRedeemer = ConstrPlutusData.of(1);
        // Mint redeemer: BurnTokens = Constr(1, []) — authorises burning via mint policy
        PlutusData burnMintRedeemer = ConstrPlutusData.of(1);

        ScriptTx scriptTx = new ScriptTx()
                .collectFrom(refNftUtxo, removeMetaRedeemer)
                .mintAsset(cip68Script, List.of(refAsset, usrAsset), burnMintRedeemer)
                .attachSpendingValidator(cip68Script)
                .withChangeAddress(signerAddress);

        Result<String> result = quickTxBuilder.compose(scriptTx)
                .feePayer(signerAddress)
                .withSigner(SignerProviders.signerFrom(account))
                .withRequiredSigners(ownerPkh)
                .withTxEvaluator(txEvaluator)
                .completeAndWait(System.out::println);

        if (!result.isSuccessful()) {
            throw new RuntimeException("CIP-68 burn failed: " + result.getResponse());
        }

        log.info("CIP-68 token burned. Policy: {}, Name: {}, TxHash: {}",
                policyId, tokenName, result.getValue());
        return result.getValue();
    }

    /**
     * Build the CIP-68 metadata datum.
     *
     * Per CIP-68, the datum at the reference NFT UTXO is:
     *   Constr(0, [ metadata_map, version, extra ])
     *
     * This matches the Aiken type: CIP68 { metadata: Pairs<Data, Data>, version: Int, extra: Data }
     * We set version = 1 and extra = unit (Constr(0, [])).
     */
    public static PlutusData buildCip68MetadataDatum(Map<String, String> metadata) {
        MapPlutusData metadataMap = new MapPlutusData();
        for (Map.Entry<String, String> entry : metadata.entrySet()) {
            metadataMap.put(
                    BytesPlutusData.of(entry.getKey().getBytes(StandardCharsets.UTF_8)),
                    BytesPlutusData.of(entry.getValue().getBytes(StandardCharsets.UTF_8))
            );
        }

        PlutusData version = BigIntPlutusData.of(1);
        PlutusData extra = ConstrPlutusData.of(0); // unit

        return ConstrPlutusData.of(0, metadataMap, version, extra);
    }
}
