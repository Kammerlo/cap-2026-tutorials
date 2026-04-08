package com.cardano.tutorial.controller;

import com.cardano.tutorial.model.MintRequest;
import com.cardano.tutorial.model.MintResponse;
import com.cardano.tutorial.service.MintingService;
import com.cardano.tutorial.service.MintingService.MintResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mint")
@Tag(name = "Minting", description = "Mint and burn Cardano native tokens")
public class MintingController {

    private final MintingService mintingService;

    public MintingController(MintingService mintingService) {
        this.mintingService = mintingService;
    }

    @PostMapping
    @Operation(
            summary = "Mint native tokens",
            description = "Creates a new single-key minting policy (ScriptAll) and mints tokens in a single transaction. "
                    + "The minter's key pays the transaction fee, and a freshly generated policy key authorizes minting. "
                    + "The response includes the policyId which uniquely identifies this token family. "
                    + "Save the policyId to send or query these tokens later.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Tokens minted successfully",
                            content = @Content(schema = @Schema(implementation = MintResponse.class))),
                    @ApiResponse(responseCode = "500", description = "Minting failed (insufficient ADA for fee, etc.)",
                            content = @Content)
            })
    public MintResponse mintTokens(@RequestBody MintRequest request) throws Exception {
        MintResult result = mintingService.mintToken(
                request.minterMnemonic(),
                request.tokenName(),
                request.quantity(),
                request.receiverAddress()
        );
        return new MintResponse(
                result.txHash(),
                result.policyId(),
                result.tokenName(),
                result.quantity(),
                "https://preprod.cardanoscan.io/transaction/" + result.txHash()
        );
    }
}
