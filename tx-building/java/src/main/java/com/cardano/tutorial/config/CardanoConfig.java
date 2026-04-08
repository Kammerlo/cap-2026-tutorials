package com.cardano.tutorial.config;

import com.bloxbean.cardano.client.backend.api.BackendService;
import com.bloxbean.cardano.client.backend.blockfrost.service.BFBackendService;
import com.bloxbean.cardano.client.quicktx.QuickTxBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Tutorial Step 2: Backend Wiring
 *
 * This configuration connects our application to the Cardano blockchain
 * via Blockfrost. Blockfrost provides a REST API that lets us query
 * the blockchain and submit transactions without running our own node.
 *
 * Key concepts:
 * - BackendService: the main entry point for all blockchain queries
 * - QuickTxBuilder: a high-level builder that handles coin selection,
 *   fee calculation, and transaction balancing automatically
 */
@Configuration
public class CardanoConfig {

    @Value("${cardano.blockfrost.base-url}")
    private String blockfrostBaseUrl;

    @Value("${cardano.blockfrost.api-key}")
    private String blockfrostApiKey;

    /**
     * BackendService is the gateway to the Cardano blockchain.
     * It provides sub-services for querying UTXOs, submitting transactions,
     * fetching protocol parameters, and more.
     *
     * Alternative backends: KoiosBackendService, OgmiosBackendService
     */
    @Bean
    public BackendService backendService() {
        return new BFBackendService(blockfrostBaseUrl, blockfrostApiKey);
    }

    /**
     * QuickTxBuilder is the recommended way to build transactions.
     * It handles the "hard parts" automatically:
     * - Coin selection (picking which UTXOs to spend)
     * - Fee estimation (the chicken-and-egg problem)
     * - Change output creation
     * - Transaction balancing (inputs = outputs + fee)
     */
    @Bean
    public QuickTxBuilder quickTxBuilder(BackendService backendService) {
        return new QuickTxBuilder(backendService);
    }
}
