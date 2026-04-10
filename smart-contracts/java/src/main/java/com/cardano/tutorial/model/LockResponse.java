package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * Response from locking ADA to the smart contract
 */
public record LockResponse(
    @Schema(description = "Transaction hash of the locking transaction")
    String txHash,

    @Schema(description = "Bech32-encoded address of the locked UTXO")
    String scriptAddress,

    @Schema(description = "Amount locked in lovelace")
    Long lovelace
) {}
