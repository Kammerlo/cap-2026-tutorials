package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Map;

/**
 * Request to update metadata of a CIP-68 reference token.
 * The policy ID is derived from the mnemonic (owner's key hash parameterizes the script).
 */
public record Cip68MetadataUpdateRequest(
    @Schema(description = "24-word mnemonic phrase (must be the token owner)")
    String mnemonic,

    @Schema(description = "Base token name (without CIP-67 label prefix)")
    String tokenName,

    @Schema(description = "Updated metadata key-value pairs")
    Map<String, String> newMetadata
) {}
