package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigInteger;

@Schema(description = "Wallet information including address and mnemonic")
public record WalletInfo(

        @Schema(description = "The derived Bech32 base address (addr_test1... on preprod)",
                example = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjc7")
        String address,

        @Schema(description = "The 24-word mnemonic phrase (WARNING: keep secret in production!)",
                example = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art")
        String mnemonic,

        @Schema(description = "ADA balance in lovelace (1 ADA = 1,000,000 lovelace). Zero for newly created wallets.",
                example = "0")
        BigInteger balanceLovelace
) {}
