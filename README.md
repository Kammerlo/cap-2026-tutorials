# Cardano Ambassador Program 2026

Developer tutorials for building on Cardano. Each module covers a specific topic with both a hands-on code project and a presentation deck.

## Modules

| Module | Description | Languages |
|--------|-------------|-----------|
| [tx-building](tx-building/) | Transaction building fundamentals: EUTXO model, ADA transfers, native token minting | Java (Spring Boot), TypeScript (React + MeshJS) |
| [indexing](indexing/) | Blockchain data indexing with Yaci Store: local devnet, block/tx/UTXO/asset indexing | Java (Spring Boot + Yaci Store), Docker |

## Prerequisites

- Basic programming knowledge
- A Blockfrost API key (free at [blockfrost.io](https://blockfrost.io)) -- for tx-building module
- Access to Cardano preprod testnet (get test ADA from the [faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/)) -- for tx-building module
- Docker & Docker Compose -- for indexing module

## Structure

Each module follows a consistent structure:

```
<module>/
  java/           Code project (Spring Boot + cardano-client-lib)
  react/          Code project (React + MeshJS)
  presentation/   Slide deck content and generation scripts
  README.md       Module-specific instructions
```
