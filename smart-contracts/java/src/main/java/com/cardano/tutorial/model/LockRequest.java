package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Request to lock ADA to the hello world smart contract
 */
public record LockRequest(
    @Schema(description = "24-word mnemonic phrase", example = "all all all all all all all all all all all about")
    String mnemonic,

    @Schema(description = "Amount of ADA to lock (in lovelace)", example = "2000000")
    Long lovelace,

    @Schema(description = "Secret message to lock in the datum", example = "Hello, World!")
    String message
) {}
