package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request to send ADA from one address to another")
public record TransferRequest(

        @Schema(description = "The sender's 24-word mnemonic phrase",
                example = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String senderMnemonic,

        @Schema(description = "The recipient's Bech32 address (addr_test1... for preprod)",
                example = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjc7",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String receiverAddress,

        @Schema(description = "Amount of ADA to send (e.g., 10.0 = 10 ADA = 10,000,000 lovelace)",
                example = "10.0",
                requiredMode = Schema.RequiredMode.REQUIRED)
        double adaAmount
) {}
