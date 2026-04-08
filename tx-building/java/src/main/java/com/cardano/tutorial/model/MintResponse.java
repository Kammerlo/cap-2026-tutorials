package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigInteger;

@Schema(description = "Response after successfully minting native tokens")
public record MintResponse(

        @Schema(description = "The transaction hash (64 hex characters)",
                example = "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd")
        String txHash,

        @Schema(description = "The minting policy ID (56 hex characters). Use this to identify the token family.",
                example = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4")
        String policyId,

        @Schema(description = "The human-readable token name",
                example = "TutorialToken")
        String tokenName,

        @Schema(description = "Number of tokens minted",
                example = "1000")
        BigInteger quantity,

        @Schema(description = "Link to view the transaction on CardanoScan (preprod)",
                example = "https://preprod.cardanoscan.io/transaction/a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd")
        String explorer
) {}
