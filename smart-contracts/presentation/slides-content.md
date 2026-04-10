---
layout: title
title: Smart Contracts on Cardano with Aiken
subtitle: Learn to build and deploy Plutus V3 validators
speaker_notes: Welcome to the smart contracts module. Today we'll explore how to write smart contracts on Cardano using Aiken with Plutus V3, understand the key differences from Ethereum, and walk through practical examples including a hello world validator and CIP-68 token standard. By the end of this session, you'll understand how deterministic contracts work on the UTXO model and be able to mint CIP-68 tokens with on-chain metadata.
---

---
layout: title_and_body
title: What is a Smart Contract?
body:
  - A program stored on-chain that enforces rules automatically
  - Executes deterministically when conditions are met
  - Immutable once deployed
  - Removes need for trusted intermediaries
speaker_notes: A smart contract is essentially a programmable agreement. Instead of relying on a bank or intermediary to enforce a transaction, the contract itself enforces the rules. Smart contracts enable complex financial instruments, NFTs, DAOs, and more. The key property is determinism - the same input always produces the same output, which is critical for blockchain consistency.
visual_suggestion: Show a simple workflow diagram - user submits transaction -> validator runs -> result is enforced automatically
---

---
layout: two_column
title: Ethereum vs Cardano Smart Contracts
left_column:
  - "Ethereum (EVM):"
  - Account-based model
  - Stateful contracts
  - Turing-complete language (Solidity)
  - State stored in contract storage
  - Execution is sequential
right_column:
  - "Cardano (UTXO):"
  - UTXO-based model
  - Stateless validators
  - Pure functions (Plutus/Aiken)
  - State in UTXOs as inline datums
  - Parallel execution possible
speaker_notes: The fundamental difference is in the model. Ethereum treats contracts like objects with mutable state - you call functions that modify the contract's storage. Cardano treats contracts as pure validation functions - given a transaction and a UTXO, the validator returns true or false. This has major implications for security, parallelizability, and cost predictability. On Cardano, you can analyze a transaction's fees statically before submitting it. On Ethereum, gas costs depend on runtime state which can change.
visual_suggestion: Side-by-side comparison diagram showing account-based vs UTXO model
---

---
layout: title_and_body
title: The Extended UTXO Model (eUTXO)
body:
  - UTXOs can carry arbitrary data (inline datums)
  - Validators check both data and transaction structure
  - Script execution is deterministic - outputs can be predicted
  - Multiple UTXOs can be spent in a single transaction
  - Validators enable sophisticated logic without global state
speaker_notes: eUTXO extends the basic UTXO model by allowing arbitrary data to be stored with each UTXO. This is the inline datum. Unlike Ethereum's global state, all state relevant to a contract is stored locally in UTXOs. This makes Cardano contracts deterministic - you can analyze a transaction completely offline and know whether it will succeed. There's no surprise where a contract's behavior changed between when you submitted the transaction and when it executed.
visual_suggestion: Diagram showing a UTXO with inline datum, then a validator checking the datum and transaction
---

---
layout: title_and_body
title: Introduction to Aiken
body:
  - Cardano's modern smart contract language
  - Compiles to Plutus V3 Core (latest version)
  - Familiar Python/Rust-like syntax
  - Strong static typing with type inference
  - stdlib v3.0.0 with BLS12-381 and crypto primitives
  - Named validators with typed handlers (spend, mint, else)
speaker_notes: Aiken is a modern language designed specifically for Cardano smart contracts. It compiles to Plutus V3, the latest version of Plutus Core, giving access to the newest features like BLS12-381 pairings. The stdlib v3.0.0 introduced breaking changes from v2 with new crypto modules and better arithmetic. Validators are now named and use typed handlers - spend for spending UTXOs, mint for minting tokens, and else as a catch-all. The syntax is inspired by both Python and Rust, making it approachable for most developers.
visual_suggestion: Show Aiken V3 code example - validator hello_world with spend handler signature
---

---
layout: title_and_body
title: Validator Anatomy (Plutus V3)
body:
  - "spend(datum: Option<Datum>, redeemer, own_ref, self: Transaction)"
  - "mint(redeemer, policy_id: PolicyId, self: Transaction)"
  - "else(ctx: ScriptContext) — catch-all handler"
  - No more ScriptContext in spend/mint — components passed directly
  - Return True to allow, fail/False to reject
speaker_notes: In the latest Aiken with Plutus V3, validator handlers receive their arguments directly instead of wrapping everything in a ScriptContext. The spend handler gets an optional datum, a redeemer, the OutputReference of the UTXO being spent, and the full Transaction. The mint handler gets a redeemer, the PolicyId being minted, and the Transaction. The else handler catches any other script purpose. The datum is now Optional because Cardano cannot enforce that a datum is present when funds are locked - only at spending time can you use expect to require it.
visual_suggestion: Diagram showing spend(datum, redeemer, own_ref, tx) and mint(redeemer, policy_id, tx) side by side
---

---
layout: title_and_body
title: Script Execution & Collateral
body:
  - Scripts run in the Plutus V3 virtual machine
  - Each script execution has a cost (memory + CPU steps)
  - Collateral ADA covers script execution costs
  - If script fails, collateral is taken
  - Collateral is NOT the transaction fee
speaker_notes: Scripts don't run for free. When you submit a transaction with scripts, you must provide collateral UTXOs that can be taken if the script fails. This prevents spam and incentivizes correct script behavior. Collateral is separate from the transaction fee - you'll pay both. The Plutus V3 machine measures execution in two dimensions - memory usage and CPU steps. Both are tracked and charged. You provide an estimate in the transaction, but cardano-client-lib computes this automatically.
visual_suggestion: Diagram showing transaction structure with fee, collateral, and script execution
---

---
layout: title_and_body
title: "Demo: Hello World Contract"
body:
  - "Validates two conditions:"
  - "1. redeemer.msg == \"Hello, World!\""
  - "2. datum.owner must sign the transaction"
  - "Datum type: { owner: VerificationKeyHash }"
  - "Redeemer type: { msg: ByteArray }"
  - Uses list.has(self.extra_signatories, owner) for auth
speaker_notes: Our hello world contract is a meaningful validator that checks two things. First, the redeemer message must exactly match Hello World. Second, the owner recorded in the datum must be among the transaction signatories. This demonstrates three key concepts - datum for storing state, redeemer for providing proof, and transaction inspection for authorization checks. The expect Some pattern ensures the datum is present.
visual_suggestion: Show the full Aiken code for the hello_world validator with spend handler
---

---
layout: title_and_body
title: "Demo: Locking ADA to a Script"
body:
  - Derive script address from compiled Plutus V3 bytecode
  - Build datum as Constr(0, [owner_pubkey_hash])
  - Use Tx.payToContract(scriptAddr, amount, datum)
  - Submit via QuickTxBuilder + Blockfrost
  - Script does NOT execute during locking
speaker_notes: Locking ADA to a script is like depositing into an escrow. The script address is deterministically derived from the compiled script bytecode. We include an inline datum containing the owner's verification key hash - this is the Constr(0, [pkh]) that matches the Aiken Datum type. The script is NOT executed at this point. It only runs when someone tries to spend the UTXO. QuickTxBuilder handles coin selection, fee estimation, and balancing automatically.
visual_suggestion: Show the Java code flow - Account -> Tx.payToContract -> QuickTxBuilder.compose -> complete
---

---
layout: title_and_body
title: "Demo: Unlocking with the Redeemer"
body:
  - Find UTXO at script address using ScriptUtxoFinders
  - Build redeemer as Constr(0, ["Hello, World!"])
  - Use ScriptTx.collectFrom(utxo, redeemer)
  - Attach spending validator + required signers
  - cardano-client-lib auto-computes execution units
speaker_notes: Unlocking uses ScriptTx instead of Tx because we're spending from a Plutus script. ScriptUtxoFinders.findFirstByInlineDatum locates our UTXO by matching the datum. The redeemer is a Constr(0, [msg]) matching the Aiken Redeemer type. We must attach the spending validator and declare required signers so the validator can check extra_signatories. The library automatically evaluates the script to compute exact execution units - no manual estimation needed.
visual_suggestion: Show the unlocking flow - ScriptUtxoFinders -> ScriptTx.collectFrom -> attachSpendingValidator -> completeAndWait
---

---
layout: title_and_body
title: What is CIP-68?
body:
  - "CIP: Cardano Improvement Proposal #68"
  - Standard for on-chain token metadata
  - Uses reference tokens to store metadata
  - Replaces off-chain metadata (CIP-25)
  - Metadata is updatable via on-chain transactions
speaker_notes: CIP-68 defines how to store token metadata on-chain using a dual-token architecture. The motivation is that off-chain metadata like IPFS can be lost or changed without the token holder's knowledge. CIP-68 stores metadata in a special reference NFT locked at a script address. The reference NFT carries an inline datum with the metadata. To update metadata, you spend the reference NFT and re-create it with new data. The user tokens are unaffected by metadata updates.
visual_suggestion: Compare on-chain metadata (always available, updatable) vs off-chain (can disappear)
---

---
layout: title_and_body
title: CIP-68 Token Structure
body:
  - "Label 100 (prefix 000643b0): Reference NFT - holds metadata datum"
  - "Label 222 (prefix 000de140): User NFT - held in user wallets"
  - "Both tokens share the same base name"
  - Minting policy enforces they are always created/burned together
  - "Datum format: Constr(0, [metadata_map, version, extra])"
speaker_notes: CIP-68 uses CIP-67 label encoding to distinguish token types. The 4-byte prefix 000643b0 marks reference tokens (label 100) and 000de140 marks user tokens (label 222). Both are prefixed to the same base name - for example, if your token is called MyNFT, the full asset names are 000643b04d794e4654 and 000de1404d794e4654. The minting policy we wrote in Aiken validates that both tokens appear in the transaction's mint field with matching quantities. The metadata datum follows a standard format with a map, version number, and an extra field.
visual_suggestion: Show the token pair structure - label prefixes, base names, and where each token lives
---

---
layout: title_and_body
title: Metadata as On-Chain Data
body:
  - Metadata stored as CBOR-encoded PlutusData in inline datum
  - "CIP-68 datum: Constr(0, [Map<ByteString,ByteString>, Int, Data])"
  - No reliance on external services (IPFS, API)
  - Metadata is queryable from any blockchain indexer
  - Updates require spending + re-creating the reference NFT
speaker_notes: The CIP-68 metadata datum is a constructor with three fields. The first is a Map of ByteString keys to ByteString values - this is where name, image, description etc. live. The second is a version integer, currently 1. The third is an extra field for future extensions, set to unit. This structure is standardized so any wallet or marketplace can decode it. The advantage over CIP-25 is that metadata is always on-chain and verifiable, not dependent on external storage.
visual_suggestion: Show the datum structure - Constr(0, [ {name: ..., image: ...}, 1, () ])
---

---
layout: title_and_body
title: "Demo: Minting a CIP-68 Token"
body:
  - Load compiled Aiken script via PlutusBlueprintUtil (PlutusV3)
  - Build asset names with CIP-67 label prefixes
  - "Redeemer: Constr(0, []) = MintTokens variant"
  - ScriptTx.mintAsset for both ref + user tokens
  - payToContract sends ref NFT to script with metadata datum
speaker_notes: On the Java side, we load the compiled Aiken script using PlutusBlueprintUtil with PlutusVersion.v3. The ScriptTx builder lets us mint both tokens in one transaction. The redeemer Constr(0) maps to the first variant in our Aiken Action type - MintTokens. The reference NFT is sent to the script address via payToContract with the metadata as an inline datum. The user NFT goes to the minter's wallet. QuickTxBuilder handles fee payer, coin selection, and script evaluation automatically.
visual_suggestion: Show the minting transaction flow - ScriptTx.mintAsset twice + payToContract
---

---
layout: title_and_body
title: "Demo: Updating Token Metadata"
body:
  - Find reference NFT UTXO at script address
  - ScriptTx.collectFrom to spend old reference NFT
  - payToContract with same token + new metadata datum
  - Attach minting script as spending validator
  - User NFTs remain unchanged in user wallets
speaker_notes: Updating metadata is elegant. We find the reference NFT UTXO using the UtxoSupplier, spend it with ScriptTx.collectFrom providing the redeemer, then send the same reference token back to the script address with a new metadata datum. The minting policy acts as both the minting validator and the address validator since the script address is derived from it. User tokens are completely unaffected - they stay in user wallets with no changes needed.
visual_suggestion: Show before/after - old reference NFT (old metadata) -> spend -> new reference NFT (new metadata)
---

---
layout: title_and_body
title: Smart Contract Security
body:
  - "Double satisfaction: UTXO model prevents it naturally"
  - "Datum validation: Always use expect Some(datum) = datum"
  - "Authorization: Check extra_signatories for owner keys"
  - "Minting pairs: Enforce label-100 + label-222 together"
  - Test with aiken check before deploying
speaker_notes: Cardano's UTXO model inherently prevents many attack vectors common in Ethereum. Double satisfaction - using the same UTXO twice - is impossible because UTXOs are consumed. For datum validation, always use expect to require the datum exists rather than silently accepting None. Authorization checks via extra_signatories ensure only the owner can unlock funds. For CIP-68, the minting policy enforces that reference and user tokens are always created as pairs, preventing orphaned tokens. Aiken's type system catches many errors at compile time, and aiken check runs property-based tests.
visual_suggestion: Show examples of each security pattern and how they're enforced
---

---
layout: title_and_body
title: Tooling Ecosystem
body:
  - "Aiken v1.1+: Build, check, test, and format contracts"
  - "cardano-client-lib 0.7.x: Java SDK with ScriptTx and QuickTxBuilder"
  - "Blockfrost: Hosted blockchain API (no node needed)"
  - "Yaci DevKit: Local Cardano testnet for rapid development"
  - "cardanoscan.io: Block explorer for preprod/mainnet"
speaker_notes: The tooling ecosystem for Cardano development has matured significantly. Aiken provides instant compile feedback and property-based testing. The cardano-client-lib Java SDK offers high-level abstractions like ScriptTx for Plutus interactions and QuickTxBuilder for automatic coin selection and fee estimation. Blockfrost provides a hosted API so you don't need to run your own Cardano node. Yaci DevKit lets you spin up a local testnet for fast iteration. And cardanoscan.io helps you inspect transactions on preprod or mainnet.
visual_suggestion: Show the tool ecosystem - how they connect together in the development workflow
---

---
layout: title_and_body
title: Summary & Next Steps
body:
  - Smart contracts are pure validators on Cardano (Plutus V3)
  - "Aiken: named validators with spend/mint/else handlers"
  - "CIP-68: on-chain metadata via reference + user token pairs"
  - "Java: ScriptTx for scripts, Tx for regular transactions"
  - Start with preprod testnet, iterate, then deploy
speaker_notes: To summarize - Cardano's smart contracts are fundamentally different from Ethereum's because of the UTXO model. Validators are pure functions that return true or false. Aiken with stdlib v3.0.0 gives you named validators with typed handlers for spend, mint, and a catch-all else. CIP-68 demonstrates a real-world pattern for on-chain metadata using reference tokens. On the Java side, cardano-client-lib's ScriptTx handles all the complexity of Plutus transactions. Your next steps - try the hello world contract, mint a CIP-68 token on preprod, update its metadata, and then explore writing your own validators.
visual_suggestion: Show the full architecture - wallet -> transaction -> validator -> blockchain
---
