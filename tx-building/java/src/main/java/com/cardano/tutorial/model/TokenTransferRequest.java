package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigInteger;

@Schema(description = "Request to send native tokens (+ ADA) to an address")
public record TokenTransferRequest(

        @Schema(description = "The sender's 24-word mnemonic phrase",
                example = "abandon abandon abandon ...",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String senderMnemonic,

        @Schema(description = "The recipient's Bech32 address",
                example = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjc7",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String receiverAddress,

        @Schema(description = "The token's policy ID (56 hex characters)",
                example = "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String policyId,

        @Schema(description = "The token's asset name (human-readable)",
                example = "TutorialToken",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String assetName,

        @Schema(description = "Number of tokens to send",
                example = "100",
                requiredMode = Schema.RequiredMode.REQUIRED)
        BigInteger quantity,

        @Schema(description = "ADA to include with the tokens (must meet min UTXO, typically >= 1.5 ADA)",
                example = "2.0",
                requiredMode = Schema.RequiredMode.REQUIRED)
        double adaAmount
) {}
