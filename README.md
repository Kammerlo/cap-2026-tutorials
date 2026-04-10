# Cardano Ambassador Program 2026

Developer tutorials for building on Cardano. Each module covers a specific topic with both a hands-on code project and a presentation deck.

## Modules

| Module | Description | Languages |
|--------|-------------|-----------|
| [tx-building](tx-building/) | Transaction building fundamentals: EUTXO model, ADA transfers, native token minting | Java (Spring Boot), TypeScript (React + MeshJS) |
| [smart-contracts](smart-contracts/) | Smart contracts with Aiken: hello world validator, CIP-68 token metadata, on-chain data | Aiken, Java (Spring Boot) |

## Prerequisites

- Basic programming knowledge
- A Blockfrost API key (free at [blockfrost.io](https://blockfrost.io))
- Access to Cardano preprod testnet (get test ADA from the [faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/))

## Structure

Each module follows a consistent structure:

```
<module>/
  java/           Code project (Spring Boot + cardano-client-lib)
  react/          Code project (React + MeshJS)
  presentation/   Slide deck content and generation scripts
  README.md       Module-specific instructions
```
