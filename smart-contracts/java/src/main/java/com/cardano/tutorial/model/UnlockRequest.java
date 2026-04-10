package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request to unlock ADA from the hello world smart contract
 */
public record UnlockRequest(
    @Schema(description = "24-word mnemonic phrase")
    String mnemonic,

    @Schema(description = "Transaction hash containing the locked UTXO")
    String lockTxHash,

    @Schema(description = "Message to unlock the UTXO (must match the locked message)")
    String message
) {}
