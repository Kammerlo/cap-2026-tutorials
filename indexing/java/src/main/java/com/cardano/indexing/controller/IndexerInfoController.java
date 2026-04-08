package com.cardano.indexing.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

/**
 * Tutorial: Indexer Info Endpoint
 *
 * A simple controller that shows the current state of the indexer:
 * how many blocks, transactions, and UTXOs have been indexed.
 *
 * This queries the tables that Yaci Store creates and populates
 * automatically. The store modules handle all the indexing -- we
 * just read the results.
 *
 * Yaci Store also exposes its own REST APIs under /api/v1/...
 * (blocks, transactions, utxos, assets, etc.) which are available
 * automatically when the corresponding store module is enabled.
 */
@RestController
@RequestMapping("/api/indexer")
@Tag(name = "Indexer Info", description = "Custom endpoints showing indexer status and statistics")
public class IndexerInfoController {

    private final DataSource dataSource;
    private final String nodeHost;
    private final int nodePort;

    public IndexerInfoController(
            DataSource dataSource,
            @Value("${store.cardano.host}") String nodeHost,
            @Value("${store.cardano.port}") int nodePort) {
        this.dataSource = dataSource;
        this.nodeHost = nodeHost;
        this.nodePort = nodePort;
    }

    @GetMapping("/status")
    @Operation(
            summary = "Get indexer status",
            description = "Returns the current sync status: how many blocks, transactions, "
                    + "and UTXOs have been indexed so far. Also shows which Cardano node "
                    + "the indexer is connected to.")
    public Map<String, Object> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("nodeHost", nodeHost);
        status.put("nodePort", nodePort);
        status.put("blockCount", queryCount("block"));
        status.put("transactionCount", queryCount("transaction"));
        status.put("utxoCount", queryCount("address_utxo"));
        return status;
    }

    /**
     * Query the row count of a table.
     * Returns -1 if the table doesn't exist yet (store hasn't created it).
     */
    private long queryCount(String tableName) {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + tableName)) {
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (Exception e) {
            // Table may not exist yet if the store module hasn't synced
        }
        return -1;
    }
}
