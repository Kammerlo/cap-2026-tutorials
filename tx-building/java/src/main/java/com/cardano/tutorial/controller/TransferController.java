package com.cardano.tutorial.controller;

import com.cardano.tutorial.model.TokenTransferRequest;
import com.cardano.tutorial.model.TransactionResponse;
import com.cardano.tutorial.model.TransferRequest;
import com.cardano.tutorial.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/transfer")
@Tag(name = "Transfer", description = "Send ADA and native tokens between addresses")
public class TransferController {

    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/ada")
    @Operation(
            summary = "Send ADA to an address",
            description = "Builds, signs, and submits a simple ADA transfer transaction. "
                    + "The QuickTxBuilder handles coin selection, fee calculation, and change output automatically. "
                    + "The sender's mnemonic is used to derive the payment key and sign the transaction.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Transaction submitted successfully",
                            content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
                    @ApiResponse(responseCode = "500", description = "Transaction failed (insufficient funds, invalid address, etc.)",
                            content = @Content)
            })
    public TransactionResponse sendAda(@RequestBody TransferRequest request) {
        String txHash = transferService.sendAda(
                request.senderMnemonic(),
                request.receiverAddress(),
                request.adaAmount()
        );
        return new TransactionResponse(txHash,
                "https://preprod.cardanoscan.io/transaction/" + txHash);
    }

    @PostMapping("/tokens")
    @Operation(
            summary = "Send native tokens",
            description = "Sends native tokens along with ADA to an address. "
                    + "Every UTXO carrying tokens must also carry a minimum amount of ADA "
                    + "(governed by the coinsPerUTXOByte protocol parameter, typically ~1.5 ADA). "
                    + "The sender must hold both the ADA and the tokens being sent.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Token transfer submitted successfully",
                            content = @Content(schema = @Schema(implementation = TransactionResponse.class))),
                    @ApiResponse(responseCode = "500", description = "Transfer failed (insufficient funds/tokens, min UTXO not met, etc.)",
                            content = @Content)
            })
    public TransactionResponse sendTokens(@RequestBody TokenTransferRequest request) {
        String txHash = transferService.sendNativeTokens(
                request.senderMnemonic(),
                request.receiverAddress(),
                request.policyId(),
                request.assetName(),
                request.quantity(),
                request.adaAmount()
        );
        return new TransactionResponse(txHash,
                "https://preprod.cardanoscan.io/transaction/" + txHash);
    }
}
