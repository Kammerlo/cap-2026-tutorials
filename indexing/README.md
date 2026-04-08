# Indexing

Learn how to index Cardano blockchain data using Yaci Store -- a modular Cardano indexer that syncs with a node and writes structured data into a database.

## Contents

### [docker-compose.yml](docker-compose.yml) -- Local Devnet Infrastructure

Spins up a complete local Cardano development environment:

| Service | Port | Description |
|---------|------|-------------|
| **yaci-cli** | 3001 | Cardano node (N2N) |
| | 3333 | Cardano node (N2C via socat) |
| | 8090 | Submit API |
| | 10000 | Cluster management API |
| | 1337 | Ogmios |
| **yaci-viewer** | 5173 | Web UI for exploring the devnet |
| **postgres** | 5432 | PostgreSQL database for indexed data |

### [java/](java/) -- Spring Boot Indexer

A Spring Boot application that embeds Yaci Store to index all data from the devnet:

| Module | What it indexes |
|--------|----------------|
| `blocks` | Block headers, slot numbers, epochs |
| `transactions` | Transaction hashes, inputs, outputs, fees |
| `utxo` | Current unspent transaction output set |
| `assets` | Native token mints, burns, supply |
| `metadata` | Transaction metadata by label |

Custom endpoint:

| Endpoint | Description |
|----------|-------------|
| `GET /api/indexer/status` | Block count, tx count, UTXO count, sync status |

Yaci Store also exposes its own REST APIs automatically under `/api/v1/...` (blocks, transactions, utxos, assets, etc.)

**Tech stack:** Java 17, Spring Boot 3.3, [Yaci Store](https://github.com/bloxbean/yaci-store) 0.1.2, PostgreSQL

## Quick Start

### 1. Start the infrastructure

```bash
docker compose up -d
```

This starts the Cardano devnet node, viewer, and PostgreSQL.

### 2. Create and start a devnet

Open a shell into the yaci-cli container and create a local devnet:

```bash
docker exec -it cardano-indexing-tutorial-yaci-cli-1 bash

# Inside the container:
yaci-cli
create-node -o --start
```

The devnet is now running. You can view it at [http://localhost:5173](http://localhost:5173).

### 3. Start the indexer

```bash
cd java
mvn spring-boot:run
```

The indexer connects to the local devnet node on port 3001 and starts syncing.

### 4. Explore

- **Indexer status:** [http://localhost:8081/api/indexer/status](http://localhost:8081/api/indexer/status)
- **Swagger UI:** [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
- **Yaci Store APIs:** [http://localhost:8081/api/v1/blocks](http://localhost:8081/api/v1/blocks), [http://localhost:8081/api/v1/txs](http://localhost:8081/api/v1/txs)
- **Yaci Viewer:** [http://localhost:5173](http://localhost:5173)
- **H2 Console** (if using H2 profile): [http://localhost:8081/h2-console](http://localhost:8081/h2-console)

### 5. Generate activity

Use the yaci-cli to top up addresses and submit transactions:

```bash
# Inside the yaci-cli container:
topup addr_test1qz... 2000
```

Then check the indexer status endpoint to see the data being indexed.

## Alternative: H2 (no Docker PostgreSQL needed)

To run with an embedded H2 database instead of PostgreSQL:

```bash
cd java
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

Note: you still need the Docker containers for the Cardano devnet node.

## Stopping

```bash
docker compose down        # Stop containers (data preserved in volumes)
docker compose down -v     # Stop and remove volumes (clean slate)
```
