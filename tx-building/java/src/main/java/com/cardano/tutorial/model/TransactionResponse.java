package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response after a successful transaction submission")
public record TransactionResponse(

        @Schema(description = "The transaction hash (64 hex characters)",
                example = "a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd")
        String txHash,

        @Schema(description = "Link to view the transaction on CardanoScan (preprod)",
                example = "https://preprod.cardanoscan.io/transaction/a1b2c3d4e5f6789012345678901234567890123456789012345678901234abcd")
        String explorer
) {}
