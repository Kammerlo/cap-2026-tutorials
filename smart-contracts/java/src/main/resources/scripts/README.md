# Smart Contract Scripts

This directory contains the compiled smart contract scripts in CBOR hex format.

## How to Generate These Files

1. **Compile the Aiken contracts:**
   ```bash
   cd ../../aiken/
   aiken build
   ```

2. **Extract the compiled scripts from plutus.json:**
   ```bash
   # Hello World validator
   cat plutus.json | jq '.validators[0].compiledCode' -r > ../java/src/main/resources/scripts/hello_world.plutus

   # CIP-68 minting policy
   cat plutus.json | jq '.validators[1].compiledCode' -r > ../java/src/main/resources/scripts/cip68_minting.plutus
   ```

3. **Verify the files exist:**
   ```bash
   ls -la smart-contracts/java/src/main/resources/scripts/
   ```

Each `.plutus` file should contain a single line of hexadecimal-encoded CBOR bytes that represents the compiled smart contract script.

## File Format

- **hello_world.plutus**: CBOR hex of the hello world spend validator
- **cip68_minting.plutus**: CBOR hex of the CIP-68 minting policy

These are loaded by `ScriptLoader.java` at runtime and converted to `PlutusV2Script` objects.
