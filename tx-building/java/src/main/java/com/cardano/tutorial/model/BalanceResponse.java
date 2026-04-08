package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigInteger;

@Schema(description = "ADA balance at a given address")
public record BalanceResponse(

        @Schema(description = "The queried Bech32 address",
                example = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjc7")
        String address,

        @Schema(description = "Total balance in lovelace (1 ADA = 1,000,000 lovelace)",
                example = "15000000")
        BigInteger balanceLovelace,

        @Schema(description = "Total balance in ADA",
                example = "15.0")
        double balanceAda
) {}
