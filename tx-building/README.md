# Transaction Building

Learn how Cardano transactions work from the ground up -- the EUTXO model, simple ADA transfers, multi-asset transfers, and native token minting.

## Contents

### [java/](java/) -- Spring Boot Demo Project

A runnable REST API that demonstrates each transaction building step:

| Endpoint | Description |
|----------|-------------|
| `POST /api/wallet/create` | Generate a new wallet (mnemonic + address) |
| `POST /api/wallet/restore` | Restore wallet from mnemonic |
| `GET /api/wallet/{address}/utxos` | Query UTXOs at an address |
| `GET /api/wallet/{address}/balance` | Get ADA balance |
| `POST /api/transfer/ada` | Send ADA to an address |
| `POST /api/transfer/tokens` | Send native tokens |
| `POST /api/mint` | Mint new native tokens |

**Tech stack:** Java 17, Spring Boot 3.4, [cardano-client-lib](https://github.com/bloxbean/cardano-client-lib) 0.7.1, Blockfrost backend

### [presentation/](presentation/) -- Slide Deck

17 slides covering the conceptual foundations:

1. What is a Transaction?
2. UTXO vs Account Model
3. The EUTXO Model
4. Anatomy of a Transaction
5. The Balancing Equation
6. Transaction Lifecycle
7. Coin Selection & Change
8. Fee Calculation
9. Addresses & Keys
10. Native Multi-Asset Ledger
11. The Value Type
12. Min UTXO Value
13. Minting Policies
14. PolicyId & AssetName
15. Common Pitfalls
16. Developer Tools

## Quick Start

### 1. Get a Blockfrost API key

Sign up at [blockfrost.io](https://blockfrost.io) and create a project for **Cardano preprod**.

### 2. Configure

Set your API key as an environment variable:

```bash
export BLOCKFROST_API_KEY=preprodYourKeyHere
```

Or edit `java/src/main/resources/application.yml` directly.

### 3. Run

```bash
cd java
mvn spring-boot:run
```

### 4. Explore

- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- API docs: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

### 5. Try it

```bash
# Create a wallet
curl -X POST http://localhost:8080/api/wallet/create

# Check balance (paste the address from above)
curl http://localhost:8080/api/wallet/{address}/balance
```

Fund your testnet address via the [Cardano faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/), then try sending ADA and minting tokens.

## Generate the Presentation

See [presentation/create-slides.gs](presentation/create-slides.gs) -- a Google Apps Script that creates the full slide deck in Google Slides. Instructions are in the script header.
