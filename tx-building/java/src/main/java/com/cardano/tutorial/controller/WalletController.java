package com.cardano.tutorial.controller;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.api.model.Utxo;
import com.cardano.tutorial.model.AddressResponse;
import com.cardano.tutorial.model.BalanceResponse;
import com.cardano.tutorial.model.RestoreRequest;
import com.cardano.tutorial.model.WalletInfo;
import com.cardano.tutorial.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.math.BigInteger;
import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@Tag(name = "Wallet", description = "Account creation, address derivation, UTXO queries, and balance lookups")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping("/create")
    @Operation(
            summary = "Create a new wallet",
            description = "Generates a fresh 24-word mnemonic and derives the base address for preprod testnet. "
                    + "WARNING: The mnemonic is returned in the response for tutorial purposes only. "
                    + "In production, never expose mnemonics via APIs.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Wallet created successfully",
                            content = @Content(schema = @Schema(implementation = WalletInfo.class)))
            })
    public WalletInfo createWallet() {
        Account account = walletService.createAccount();
        return new WalletInfo(account.baseAddress(), account.mnemonic(), BigInteger.ZERO);
    }

    @PostMapping("/restore")
    @Operation(
            summary = "Restore a wallet from mnemonic",
            description = "Restores an account from an existing 24-word mnemonic phrase and returns the derived base address. "
                    + "Use this to recover a previously created wallet.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Wallet restored successfully",
                            content = @Content(schema = @Schema(implementation = AddressResponse.class)))
            })
    public AddressResponse restoreWallet(@RequestBody RestoreRequest request) {
        Account account = walletService.restoreAccount(request.mnemonic());
        return new AddressResponse(account.baseAddress());
    }

    @GetMapping("/{address}/utxos")
    @Operation(
            summary = "Query UTXOs at an address",
            description = "Returns all unspent transaction outputs (UTXOs) at the given address. "
                    + "Each UTXO is a discrete 'coin' that can be spent in a transaction. "
                    + "Your balance is the sum of all UTXO values.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "UTXOs retrieved successfully")
            })
    public List<Utxo> getUtxos(
            @Parameter(description = "Bech32 address to query (addr_test1... for preprod)",
                    example = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjc7",
                    required = true)
            @PathVariable String address) throws Exception {
        return walletService.getUtxos(address);
    }

    @GetMapping("/{address}/balance")
    @Operation(
            summary = "Get ADA balance",
            description = "Returns the total ADA balance at an address by summing all UTXOs. "
                    + "The balance is returned in both lovelace (smallest unit) and ADA. "
                    + "1 ADA = 1,000,000 lovelace.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Balance retrieved successfully",
                            content = @Content(schema = @Schema(implementation = BalanceResponse.class)))
            })
    public BalanceResponse getBalance(
            @Parameter(description = "Bech32 address to query (addr_test1... for preprod)",
                    example = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjc7",
                    required = true)
            @PathVariable String address) throws Exception {
        BigInteger lovelace = walletService.getBalance(address);
        double ada = lovelace.doubleValue() / 1_000_000.0;
        return new BalanceResponse(address, lovelace, ada);
    }
}
