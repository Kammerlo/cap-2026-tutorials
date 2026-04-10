package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response from minting a CIP-68 token
 */
public record Cip68MintResponse(
    @Schema(description = "Transaction hash of the minting transaction")
    String txHash,

    @Schema(description = "Policy ID of the minting policy")
    String policyId,

    @Schema(description = "Token name")
    String tokenName,

    @Schema(description = "Full asset name with CIP-68 label prefix")
    String assetName
) {}
