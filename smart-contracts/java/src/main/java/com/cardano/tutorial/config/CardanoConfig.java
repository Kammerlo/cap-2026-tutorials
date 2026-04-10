package com.cardano.tutorial.config;

import com.bloxbean.cardano.client.api.TransactionEvaluator;
import com.bloxbean.cardano.client.api.UtxoSupplier;
import com.bloxbean.cardano.client.backend.api.BackendService;
import com.bloxbean.cardano.client.backend.api.DefaultUtxoSupplier;
import com.bloxbean.cardano.client.backend.blockfrost.service.BFBackendService;
import com.bloxbean.cardano.client.common.model.Network;
import com.bloxbean.cardano.client.common.model.Networks;
import com.bloxbean.cardano.client.quicktx.QuickTxBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Blockchain Backend Configuration
 *
 * Wires the application to Cardano via Blockfrost and exposes the
 * beans needed by the service layer.
 */
@Configuration
public class CardanoConfig {

    @Value("${cardano.blockfrost.base-url}")
    private String blockfrostBaseUrl;

    @Value("${cardano.blockfrost.api-key}")
    private String blockfrostApiKey;

    @Value("${cardano.network}")
    private String network;

    @Bean
    public BackendService backendService() {
        return new BFBackendService(blockfrostBaseUrl, blockfrostApiKey);
    }

    @Bean
    public QuickTxBuilder quickTxBuilder(BackendService backendService) {
        return new QuickTxBuilder(backendService);
    }

    @Bean
    public UtxoSupplier utxoSupplier(BackendService backendService) {
        return new DefaultUtxoSupplier(backendService.getUtxoService());
    }

    @Bean
    public TransactionEvaluator transactionEvaluator(BackendService backendService) {
        // Wrap the Blockfrost evaluator with a 20% ExUnit margin to prevent
        // marginal on-chain budget overruns from the off-chain estimator
        return new ExUnitMarginEvaluator(backendService.getTransactionService(), 20);
    }

    @Bean
    public Network cardanoNetwork() {
        return switch (network) {
            case "mainnet" -> Networks.mainnet();
            case "preview" -> Networks.preview();
            default -> Networks.preprod();
        };
    }
}
