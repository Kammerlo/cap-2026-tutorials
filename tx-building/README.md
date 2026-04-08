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

### [react/](react/) -- React + MeshJS Demo App

A browser-based single-page app that demonstrates the same concepts using wallet extensions:

| Feature | Description |
|---------|-------------|
| Connect Wallet | Connect via browser wallet extension (Nami, Eternl, Lace, etc.) |
| Wallet Info | View address, ADA balance, and UTXO count |
| Send ADA | Transfer ADA to any preprod address |
| Send Tokens | Transfer native tokens (multi-asset) |
| Mint Tokens | Mint new native tokens with a single-signature policy |

**Tech stack:** TypeScript, React 18, Vite, [MeshJS](https://meshjs.dev/) (core + react)

**Key difference:** The Java project manages keys server-side via mnemonics. The React project uses browser wallet extensions -- private keys never leave the user's device.

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

### 3. Run the Java project

```bash
cd java
mvn spring-boot:run
```

- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- API docs: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

```bash
# Create a wallet
curl -X POST http://localhost:8080/api/wallet/create

# Check balance (paste the address from above)
curl http://localhost:8080/api/wallet/{address}/balance
```

### 4. Run the React project

```bash
cd react
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), connect your wallet, and try sending ADA or minting tokens.

**Prerequisite:** A Cardano browser wallet extension on preprod (e.g. [Nami](https://namiwallet.io/), [Eternl](https://eternl.io/), [Lace](https://www.lace.io/)).

### 5. Get test ADA

Fund your testnet address via the [Cardano faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/), then try sending ADA and minting tokens.

## Generate the Presentation

See [presentation/create-slides.gs](presentation/create-slides.gs) -- a Google Apps Script that creates the full slide deck in Google Slides. Instructions are in the script header.
