package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigInteger;

@Schema(description = "Request to mint new native tokens. A fresh minting policy is created automatically.")
public record MintRequest(

        @Schema(description = "The minter's 24-word mnemonic phrase (also pays the transaction fee)",
                example = "abandon abandon abandon ...",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String minterMnemonic,

        @Schema(description = "Human-readable name for the token (max 32 bytes)",
                example = "TutorialToken",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String tokenName,

        @Schema(description = "Number of tokens to mint",
                example = "1000",
                requiredMode = Schema.RequiredMode.REQUIRED)
        BigInteger quantity,

        @Schema(description = "Address to receive the minted tokens. If null, tokens go to the minter's address.",
                example = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjc7",
                nullable = true)
        String receiverAddress
) {}
