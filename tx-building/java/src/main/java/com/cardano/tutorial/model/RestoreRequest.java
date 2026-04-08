package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request to restore a wallet from an existing mnemonic phrase")
public record RestoreRequest(

        @Schema(description = "The 24-word mnemonic phrase to restore the wallet from",
                example = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art",
                requiredMode = Schema.RequiredMode.REQUIRED)
        String mnemonic
) {}
