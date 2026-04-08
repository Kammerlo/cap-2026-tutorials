package com.cardano.indexing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Cardano Indexing Tutorial - Application Entry Point
 *
 * This Spring Boot application embeds Yaci Store to index all blockchain
 * data from a local Yaci DevKit node (or any Cardano node).
 *
 * Yaci Store is a modular Cardano indexer. Each "store" module indexes
 * a specific data domain:
 * - blocks:       block headers, slot numbers, epochs
 * - transactions: tx hashes, inputs, outputs, fees
 * - utxo:         current unspent transaction output set
 * - assets:       native token mints, burns, supply
 * - metadata:     transaction metadata by label
 *
 * On startup, Yaci Store connects to the configured Cardano node via
 * the N2N (node-to-node) mini-protocol, syncs from the configured
 * start point, and writes indexed data into PostgreSQL (or H2).
 *
 * The store modules auto-register their own REST API endpoints under /api/v1/...
 * This application adds custom query endpoints on top.
 */
@SpringBootApplication
public class IndexingApplication {

    public static void main(String[] args) {
        SpringApplication.run(IndexingApplication.class, args);
    }
}
