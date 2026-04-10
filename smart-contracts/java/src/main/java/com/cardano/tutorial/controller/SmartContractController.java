package com.cardano.tutorial.controller;

import com.cardano.tutorial.model.LockRequest;
import com.cardano.tutorial.model.LockResponse;
import com.cardano.tutorial.model.UnlockRequest;
import com.cardano.tutorial.service.HelloWorldService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST API for the Hello World smart contract.
 *
 * POST /api/smart-contract/lock    — lock ADA to the script
 * POST /api/smart-contract/unlock  — unlock ADA with the "Hello, World!" redeemer
 * GET  /api/smart-contract/address — return the script address
 */
@RestController
@RequestMapping("/api/smart-contract")
@Tag(name = "Hello World", description = "Interact with the Hello World spend validator")
public class SmartContractController {

    private final HelloWorldService helloWorldService;

    public SmartContractController(HelloWorldService helloWorldService) {
        this.helloWorldService = helloWorldService;
    }

    @GetMapping("/address")
    @Operation(summary = "Get the hello-world script address")
    public ResponseEntity<?> address() {
        try {
            String addr = helloWorldService.getScriptAddress();
            return ResponseEntity.ok(Map.of("scriptAddress", addr));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/lock")
    @Operation(
        summary = "Lock ADA to the hello world smart contract",
        description = "Sends ADA to the script address with an inline datum containing the owner's key hash"
    )
    @ApiResponse(responseCode = "200", description = "ADA locked successfully")
    @ApiResponse(responseCode = "500", description = "Transaction submission failed")
    public ResponseEntity<?> lock(@RequestBody LockRequest request) {
        try {
            String txHash = helloWorldService.lock(request.mnemonic(), request.lovelace(), request.message());
            String scriptAddress = helloWorldService.getScriptAddress();

            return ResponseEntity.ok(new LockResponse(txHash, scriptAddress, request.lovelace()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/unlock")
    @Operation(
        summary = "Unlock ADA from the hello world smart contract",
        description = "Spends a UTXO at the script address. Redeemer 'Hello, World!' is applied automatically."
    )
    @ApiResponse(responseCode = "200", description = "ADA unlocked successfully")
    @ApiResponse(responseCode = "500", description = "Transaction submission failed")
    public ResponseEntity<?> unlock(@RequestBody UnlockRequest request) {
        try {
            String txHash = helloWorldService.unlock(
                    request.mnemonic(),
                    request.lockTxHash(),
                    request.message()
            );

            return ResponseEntity.ok(Map.of("txHash", txHash));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
