package com.cardano.tutorial.controller;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.common.model.Network;
import com.cardano.tutorial.model.Cip68MetadataUpdateRequest;
import com.cardano.tutorial.model.Cip68MintRequest;
import com.cardano.tutorial.model.Cip68MintResponse;
import com.cardano.tutorial.service.Cip68MetadataService;
import com.cardano.tutorial.service.Cip68MintService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API for CIP-68 token minting and metadata management.
 *
 * The CIP-68 validator is parameterized by the owner's verification key hash,
 * so the policy ID is unique per owner (derived from mnemonic).
 *
 * POST /api/cip68/mint       — mint a CIP-68 token pair with metadata
 * PUT  /api/cip68/metadata   — update reference-token metadata
 * POST /api/cip68/policy-id  — compute policy ID for a given mnemonic
 */
@RestController
@RequestMapping("/api/cip68")
@Tag(name = "CIP-68 Tokens", description = "Mint and manage CIP-68 compliant tokens")
public class Cip68Controller {

    private final Cip68MintService mintService;
    private final Cip68MetadataService metadataService;
    private final Network network;

    public Cip68Controller(Cip68MintService mintService,
                           Cip68MetadataService metadataService,
                           Network network) {
        this.mintService = mintService;
        this.metadataService = metadataService;
        this.network = network;
    }

    @PostMapping("/policy-id")
    @Operation(
        summary = "Get the CIP-68 minting policy ID for a given owner",
        description = "The policy ID depends on the owner's key hash since the validator is parameterized"
    )
    public ResponseEntity<?> policyId(@RequestBody Map<String, String> body) {
        try {
            String mnemonic = body.get("mnemonic");
            Account account = new Account(network, mnemonic);
            byte[] ownerPkh = account.hdKeyPair().getPublicKey().getKeyHash();
            String policyId = mintService.getPolicyId(ownerPkh);
            return ResponseEntity.ok(Map.of("policyId", policyId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/mint")
    @Operation(
        summary = "Mint a CIP-68 token pair",
        description = "Mints reference NFT (label 100) and user NFT (label 222) with on-chain metadata"
    )
    @ApiResponse(responseCode = "200", description = "Token minted successfully")
    @ApiResponse(responseCode = "500", description = "Minting failed")
    public ResponseEntity<?> mint(@RequestBody Cip68MintRequest request) {
        try {
            String txHash = mintService.mint(
                    request.mnemonic(), request.tokenName(), request.metadata());

            Account account = new Account(network, request.mnemonic());
            byte[] ownerPkh = account.hdKeyPair().getPublicKey().getKeyHash();
            String policyId = mintService.getPolicyId(ownerPkh);

            return ResponseEntity.ok(new Cip68MintResponse(
                    txHash,
                    policyId,
                    request.tokenName(),
                    Cip68MintService.LABEL_222_PREFIX + request.tokenName()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/metadata")
    @Operation(
        summary = "Update CIP-68 token metadata",
        description = "Spends the old reference NFT and re-creates it with updated metadata"
    )
    @ApiResponse(responseCode = "200", description = "Metadata updated successfully")
    @ApiResponse(responseCode = "500", description = "Update failed")
    public ResponseEntity<?> updateMetadata(@RequestBody Cip68MetadataUpdateRequest request) {
        try {
            String txHash = metadataService.updateMetadata(
                    request.mnemonic(),
                    request.tokenName(),
                    request.newMetadata()
            );

            return ResponseEntity.ok(Map.of("txHash", txHash));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
