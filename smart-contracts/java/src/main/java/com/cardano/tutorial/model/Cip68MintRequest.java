package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Map;

/**
 * Request to mint a CIP-68 token pair (reference NFT + user NFT)
 */
public record Cip68MintRequest(
    @Schema(description = "24-word mnemonic phrase")
    String mnemonic,

    @Schema(description = "Token name (will be prefixed with CIP-68 labels)")
    String tokenName,

    @Schema(description = "Token metadata as key-value pairs", example = "{\"name\": \"My Token\", \"image\": \"ipfs://...\"}")
    Map<String, String> metadata
) {}
