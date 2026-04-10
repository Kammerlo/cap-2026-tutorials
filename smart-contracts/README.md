# Smart Contracts on Cardano with Aiken

Learn to build and deploy smart contracts on Cardano using Aiken and Java. This module covers:
- Writing validators in Aiken (Plutus V3)
- Locking and unlocking ADA to smart contracts
- Minting CIP-68 compliant tokens with on-chain metadata
- Updating token metadata deterministically

**Latest Updates:**
- ✅ Aiken stdlib v3.0.0 (Plutus V3)
- ✅ Updated validator syntax for V3
- ✅ Enhanced CIP-68 implementation

## Prerequisites

- **Java 17+** (Java Runtime Environment)
- **Maven 3.8+** for building the Java project
- **Aiken compiler** - install from [aiken-lang.org](https://aiken-lang.org)
- **Blockfrost API key** - get free access at [blockfrost.io](https://blockfrost.io)
- Access to Cardano **preprod testnet** (get test ADA from the [faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/))

## Project Structure

```
smart-contracts/
├── aiken/                     # On-chain smart contracts
│   ├── aiken.toml            # Aiken project config
│   └── validators/
│       ├── hello_world.ak    # Simple spend validator
│       └── cip68_minting.ak  # CIP-68 token minting policy
├── java/                      # Off-chain Java backend
│   ├── pom.xml
│   └── src/
│       └── main/java/com/cardano/tutorial/
│           ├── SmartContractsApplication.java
│           ├── config/
│           ├── controller/
│           ├── model/
│           └── service/
└── presentation/              # Slide deck and generation scripts
    ├── slides-content.md
    └── agent-prompt.md
```

## Part 1: Compile Aiken Contracts

### 1. Install Latest Aiken (with Plutus V3 support)

```bash
# macOS (with Homebrew) - install latest version
brew install aiken

# Or visit: https://aiken-lang.org/installation
# Make sure you have v1.1.0 or later for Plutus V3 support
aiken --version
```

### 2. Check and Build Contracts

```bash
cd aiken/

# Verify contracts compile with stdlib v3.0.0
aiken check

# Build contracts (generates Plutus V3 bytecode)
aiken build
```

This generates a `plutus.json` file containing the compiled Plutus V3 script bytecode.

### 3. Extract Script CBOR

The compiled scripts need to be copied to the Java resources directory:

```bash
# Extract hello world script (just the hex value)
cat plutus.json | jq '.validators[0].compiledCode' -r > ../java/src/main/resources/scripts/hello_world.plutus

# Extract CIP-68 minting script
cat plutus.json | jq '.validators[1].compiledCode' -r > ../java/src/main/resources/scripts/cip68_minting.plutus
```

## Part 2: Run the Java Backend

### 1. Set Your Blockfrost API Key

```bash
# Unix/macOS
export BLOCKFROST_API_KEY="your_blockfrost_api_key_here"

# Windows (Command Prompt)
set BLOCKFROST_API_KEY=your_blockfrost_api_key_here
```

### 2. Build the Java Project

```bash
cd java/
mvn clean install
```

### 3. Start the Application

```bash
mvn spring-boot:run
```

The API will be available at: http://localhost:8081

### 4. Access API Documentation

Open your browser to: http://localhost:8081/swagger-ui.html

## API Endpoints

### Hello World Contract

#### Lock ADA to the Script
```bash
curl -X POST http://localhost:8081/api/smart-contract/lock \
  -H "Content-Type: application/json" \
  -d '{
    "mnemonic": "your 24-word mnemonic here",
    "lovelace": 2000000
  }'
```

Response:
```json
{
  "txHash": "abc123...",
  "scriptAddress": "addr_test1...",
  "lovelace": 2000000
}
```

#### Unlock ADA from the Script
```bash
curl -X POST http://localhost:8081/api/smart-contract/unlock \
  -H "Content-Type: application/json" \
  -d '{
    "mnemonic": "your 24-word mnemonic here",
    "lockTxHash": "abc123...",
    "outputIndex": 0
  }'
```

### CIP-68 Tokens

#### Mint a CIP-68 Token
```bash
curl -X POST http://localhost:8081/api/cip68/mint \
  -H "Content-Type: application/json" \
  -d '{
    "mnemonic": "your 24-word mnemonic here",
    "tokenName": "MyToken",
    "metadata": {
      "name": "My NFT",
      "image": "ipfs://QmHash...",
      "description": "A test NFT"
    }
  }'
```

Response:
```json
{
  "txHash": "def456...",
  "policyId": "abc123...",
  "tokenName": "MyToken",
  "assetName": "000643b0..."
}
```

#### Update Token Metadata
```bash
curl -X PUT http://localhost:8081/api/cip68/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "mnemonic": "your 24-word mnemonic here",
    "policyId": "abc123...",
    "tokenName": "MyToken",
    "newMetadata": {
      "name": "Updated NFT",
      "image": "ipfs://NewHash...",
      "description": "Updated description"
    }
  }'
```

## Understanding the Contracts

### Hello World Validator

The simplest possible smart contract - it validates that the redeemer contains exactly the bytes `"Hello, World!"`:

```aiken
validator {
  fn hello_world(_datum: Data, redeemer: ByteArray, _ctx: ScriptContext) -> Bool {
    redeemer == "Hello, World!"
  }
}
```

**Usage:**
1. Lock ADA to this script with any datum
2. To unlock, provide the redeemer `"Hello, World!"`
3. The validator checks the redeemer and returns true/false

### CIP-68 Minting Policy

Enforces the CIP-68 standard for token metadata:

- **Label 100 (Reference NFT):** Stores metadata in inline datum, locked at script address
- **Label 222 (User NFT):** The actual token users hold in their wallet

The minting policy ensures:
- Both tokens are minted together
- Reference NFT goes to the script address
- User NFT goes to the minter's address

**Key Concepts:**

- **Datum:** Data stored with a UTXO (e.g., metadata)
- **Redeemer:** Proof provided when unlocking (e.g., "Hello, World!")
- **Context:** Transaction details that validators can inspect
- **Script Address:** Derived from the script itself, deterministic per network

## Costs and Considerations

### Transaction Fees
- Every transaction costs ADA for network fees
- Smart contract execution has additional costs (memory + CPU)
- Estimated fees are calculated before submission

### Collateral
- Script transactions require collateral UTXOs
- Collateral is separate from the transaction fee
- Used only if the script fails

### Storage Costs
- On-chain metadata increases transaction size
- Each byte stored costs more ADA
- CIP-68 metadata should be kept concise

## Common Issues

### "Script not found" error
Make sure you've compiled the Aiken contracts and copied the CBOR hex to the Java resources:
```bash
aiken build
cp plutus.json ../java/src/main/resources/scripts/
```

### "UTXO not found" error
The UTXO may not have been included in a block yet. Wait a few blocks and retry.

### Transaction submission fails
- Verify your wallet has sufficient ADA
- Check that you have enough collateral
- Ensure your Blockfrost API key is correct

## Next Steps

1. **Understand the eUTXO model** - Read about how Cardano differs from Ethereum
2. **Experiment with hello world** - Lock and unlock some test ADA
3. **Mint your first NFT** - Use the CIP-68 minting endpoint
4. **Update metadata** - Change your NFT's metadata on-chain
5. **Write your own validator** - Create a more complex contract based on these examples
6. **Deploy to mainnet** - Once confident, move to production (requires real ADA)

## Resources

- [Aiken Language Docs](https://aiken-lang.org)
- [Cardano Developer Portal](https://developers.cardano.org)
- [CIP-68 Standard](https://cips.cardano.org/cips/cip68/)
- [cardano-client-lib Docs](https://github.com/bloxbean/cardano-client-lib)
- [Blockfrost API](https://docs.blockfrost.io)

## Troubleshooting

### Need help?
- Check the Aiken documentation at https://aiken-lang.org/
- Ask questions on the [Cardano Forum](https://forum.cardano.org)
- Review the tx-building module for transaction building patterns
