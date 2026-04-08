# Cardano Transaction Building - Slide Deck Content

## Metadata
- **Title:** Building Cardano Transactions
- **Subtitle:** CAP 2026 - From Theory to Code
- **Audience:** Developers new to Cardano, familiar with general programming concepts
- **Duration:** ~60-90 minutes including live demo
- **Color scheme:** Dark navy (#1a1a2e) backgrounds, Cardano blue (#0033ad) accents, white text

---

## Slide 1: Title

- **layout:** title
- **title:** Building Cardano Transactions
- **subtitle:** From EUTXO Theory to Working Java Code
- **footer:** Cardano Ambassador Program 2026
- **speaker_notes:** Welcome the audience. This session covers both the conceptual foundations AND practical implementation of Cardano transactions. By the end, participants will understand what happens under the hood when they send ADA, and will have built and submitted their own transactions on preprod testnet using Java.

---

## Slide 2: What is a Transaction?

- **layout:** title_and_body
- **title:** What is a Transaction?
- **body:**
  - A **request to change the ledger state**
  - Consumed by a validator (the Cardano node)
  - Either fully applied or fully rejected - **no partial execution**
  - Contains: inputs to consume, outputs to create, a fee to pay
  - Analogy: a signed check that says "take these coins, create those coins, keep this fee"
- **visual_suggestion:** Simple flow diagram: Transaction -> Node validates -> Ledger updated (or rejected)
- **speaker_notes:** Emphasize that Cardano transactions are atomic - they either succeed completely or fail completely. There is no "out of gas" scenario where you pay a fee but the operation partially fails (unlike Ethereum). This is a fundamental design property of Cardano.

---

## Slide 3: UTXO vs Account Model

- **layout:** two_column
- **title:** Two Ways to Track Money
- **left_column:**
  - **Account Model (Ethereum)**
  - Like a bank account with a balance
  - Send 10 ETH: subtract from sender, add to receiver
  - Global mutable state
  - Simple to understand
  - Concurrency challenges (nonce ordering)
- **right_column:**
  - **UTXO Model (Cardano, Bitcoin)**
  - Like physical coins/bills in a wallet
  - Each "coin" (UTXO) is indivisible
  - Spend a coin -> destroy it -> create new coins
  - No global state - everything is local
  - Naturally parallel (different UTXOs are independent)
- **visual_suggestion:** Left: single box labeled "Account: 100 ETH" with arrows in/out. Right: multiple small boxes labeled "5 ADA", "10 ADA", "3 ADA" being consumed and new ones created
- **speaker_notes:** The account model is like your bank: you have one balance that goes up and down. The UTXO model is like your physical wallet: you have specific bills and coins. When you pay for a 7 EUR coffee with a 10 EUR bill, you don't tear the bill - you give it to the cashier and get 3 EUR back. That's exactly how UTXOs work: you consume the entire 10 ADA UTXO and create two new ones (7 for the recipient, 3 back to yourself as change).

---

## Slide 4: The EUTXO Model

- **layout:** title_and_body
- **title:** Extended UTXO - What Cardano Adds
- **body:**
  - Bitcoin's UTXO: value + locking script
  - Cardano's **E**UTXO adds three things:
    1. **Datum** - arbitrary data attached to a UTXO (the "state")
    2. **Redeemer** - argument provided when spending (the "action")
    3. **Script Context** - full transaction info available to validators
  - This turns UTXOs from simple "coins" into programmable state carriers
  - For simple transfers (this tutorial): datums and redeemers are not needed
  - They become essential for smart contract interactions (future session)
- **visual_suggestion:** Diagram of a UTXO box with labeled compartments: Value, Address, Datum, and an arrow labeled "Redeemer" pointing at it, with "Script Context" as the environment around it
- **speaker_notes:** EUTXO is what makes Cardano a smart contract platform, not just a payment network. But for this tutorial, we focus on the basic UTXO properties (value + address). The extended features come into play with Plutus scripts, which we'll cover in a future session.

---

## Slide 5: Anatomy of a Transaction

- **layout:** diagram
- **title:** Inside a Cardano Transaction
- **body:**
  - **Required components:**
    - Inputs: references to UTXOs being consumed (TxHash#Index)
    - Outputs: new UTXOs being created (address + value)
    - Fee: paid to block producers (in lovelace)
    - Validity interval: when the tx is valid (slot range)
  - **Optional components:**
    - Metadata: arbitrary data attached to the tx
    - Mint/Burn: native tokens being created/destroyed
    - Certificates: staking, delegation, governance
    - Collateral: pledged for Plutus script execution
    - Witnesses: signatures and scripts
- **visual_suggestion:** Box diagram showing a transaction body with labeled sections. Inputs on the left (arrows in), outputs on the right (arrows out), fee and validity at the bottom. Optional sections shown with dashed borders.
- **speaker_notes:** Walk through each component. Inputs are pointers to existing UTXOs (transaction hash + output index). Outputs are brand new UTXOs that will exist after this transaction. The fee is explicit - you declare exactly how much you're paying. The validity interval prevents a transaction from being applied too late (important for time-sensitive operations). Point out that many of the optional components are for advanced use cases we'll cover later.

---

## Slide 6: The Balancing Equation

- **layout:** title_and_body
- **title:** The Golden Rule
- **body:**
  - ```
    sum(inputs) = sum(outputs) + fee
    ```
  - **Example:**
    - You have: one UTXO worth 100 ADA
    - You want to send: 30 ADA to a friend
    - Fee: ~0.17 ADA
    - Your transaction:
      - Input: 100 ADA UTXO
      - Output 1: 30 ADA to friend
      - Output 2: 69.83 ADA back to yourself (change)
      - Fee: 0.17 ADA
    - Check: 100 = 30 + 69.83 + 0.17  ✓
  - If this equation doesn't balance, the node **rejects** the transaction
- **visual_suggestion:** Visual scale/balance showing inputs on one side and (outputs + fee) on the other, perfectly balanced. Color the change output differently to highlight it.
- **speaker_notes:** This is THE most important concept in Cardano transaction building. Hammer it home. Everything else - coin selection, fee calculation, change creation - exists to make this equation balance. When a transaction fails, the first thing to check is whether it balances. Note that "change" is not automatic - you must explicitly create a change output. This is where beginners often get confused: unlike a bank transfer where change is implicit, here you must create your own change output.

---

## Slide 7: Transaction Lifecycle

- **layout:** diagram
- **title:** From Code to Chain
- **body:**
  1. **Build** - Construct the transaction body (inputs, outputs, fee)
  2. **Sign** - Apply cryptographic signature(s) with private key(s)
  3. **Submit** - Send to a node for validation
  4. **Phase 1 Validation** - Structural checks (balancing, signatures, size limits)
  5. **Phase 2 Validation** - Script execution (only for Plutus transactions)
  6. **Inclusion** - Added to a block by a stake pool operator
  7. **Confirmation** - Block is accepted by the network
- **visual_suggestion:** Horizontal pipeline/flow diagram with 7 steps, each in a colored box with an arrow. Steps 1-3 happen off-chain (user side), steps 4-7 happen on-chain (node side). Draw a dividing line between off-chain and on-chain.
- **speaker_notes:** Emphasize the two-phase validation model. Phase 1 checks are "free" - they validate structure, signatures, and the balancing equation. If Phase 1 fails, no fee is charged. Phase 2 runs Plutus scripts - if Phase 2 fails, the collateral is consumed (to prevent spam). For simple transfers (no scripts), only Phase 1 applies. This two-phase model is unique to Cardano and provides deterministic fee guarantees.

---

## Slide 8: UTXO Selection & Change

- **layout:** two_column
- **title:** Coin Selection - Picking the Right UTXOs
- **left_column:**
  - Your address holds multiple UTXOs:
    - UTXO A: 5 ADA
    - UTXO B: 50 ADA
    - UTXO C: 12 ADA
    - UTXO D: 3 ADA
  - You want to send **15 ADA**
  - Which UTXOs do you pick?
- **right_column:**
  - **Option 1:** B (50 ADA) → change: ~34.83 ADA
  - **Option 2:** A + C (17 ADA) → change: ~1.83 ADA
  - **Option 3:** A + C + D (20 ADA) → change: ~4.83 ADA
  - Trade-offs:
    - Fewer inputs = smaller tx = lower fee
    - But: avoid "dust" UTXOs (tiny remainders)
    - Don't fragment your UTXOs unnecessarily
  - Most SDKs include a coin selection algorithm that chooses for you
- **visual_suggestion:** Visual of wallet with colored coins, showing different selection strategies. Arrows from selected coins into a transaction box, with change coming out.
- **speaker_notes:** Coin selection is a surprisingly complex problem. The library handles it, but understanding it helps debug issues. Common problem: "I have 100 ADA total but the transaction says insufficient funds" - this can happen if the ADA is split across many tiny UTXOs and the combined fees eat up the balance, or if some UTXOs are locked by scripts. Also: each input adds to the transaction size, which increases the fee.

---

## Slide 9: Fee Calculation

- **layout:** title_and_body
- **title:** How Fees Work
- **body:**
  - Cardano uses a **linear fee model**:
    - `fee = minFeeA × txSize(bytes) + minFeeB`
    - Current preprod values: minFeeA = 44, minFeeB = 155,381
    - Example: 300-byte tx → fee = 44 × 300 + 155,381 = 168,581 lovelace (~0.17 ADA)
  - **Deterministic fees** - you know the fee BEFORE submitting
    - No "gas price wars" or fee spikes
    - No failed transactions that still charge a fee (Phase 1)
  - **The chicken-and-egg problem:**
    - Fee depends on transaction size
    - Transaction size depends on fee (fee is part of the tx body)
    - Solution: build with estimated fee, calculate actual fee, rebuild
    - Most transaction builder libraries handle this iteration automatically
- **visual_suggestion:** Formula displayed prominently. Small chart comparing Cardano's predictable fees vs Ethereum's variable gas prices.
- **speaker_notes:** This is one of Cardano's strongest selling points: fee predictability. Developers can guarantee exactly what a transaction will cost before submitting it. For Plutus scripts, there's an additional cost based on execution units (memory + CPU steps), but the total fee is still deterministic. The chicken-and-egg problem is interesting - the library solves it by doing iterative estimation, but it's worth understanding why building a transaction isn't a one-pass operation.

---

## Slide 10: Addresses & Keys

- **layout:** title_and_body
- **title:** Keys, Addresses, and Wallets
- **body:**
  - **HD Wallet Derivation (CIP-1852 / BIP-44):**
    - `m / 1852' / 1815' / account' / role / index`
    - 1852 = Shelley purpose, 1815 = Cardano coin type (Ada Lovelace's birth year)
  - **Address types:**
    - **Base address** = payment credential + staking credential (most common)
    - **Enterprise address** = payment credential only (no staking rewards)
    - **Stake address** = staking credential only (for delegation/rewards)
  - **Encoding:** Bech32 format
    - Mainnet: `addr1...`
    - Testnet: `addr_test1...`
  - **24-word mnemonic** = root of all keys = THE wallet
- **visual_suggestion:** Tree diagram showing mnemonic at the root, branching into account keys, then payment/staking key pairs, then addresses. Label each derivation step with the CIP-1852 path.
- **speaker_notes:** Clarify that a "wallet" in Cardano is NOT a single address - it's the entire derivation tree from a mnemonic. Multiple addresses can be derived from the same mnemonic. The base address is what we use in this tutorial - it supports both spending and staking. Enterprise addresses are used when staking is not needed (e.g., exchange hot wallets). Stress that the mnemonic IS the wallet: losing it means losing all funds, sharing it means sharing all funds.

---

## Slide 11: Native Multi-Asset Ledger

- **layout:** two_column
- **title:** Native Tokens - No Smart Contract Required
- **left_column:**
  - **Ethereum approach:**
    - Tokens are smart contract state (ERC-20, ERC-721)
    - Each token = separate contract to deploy
    - Transfer = calling contract function
    - Requires gas for contract execution
  - **Cardano approach:**
    - Tokens are **first-class citizens** in the ledger
    - Carried alongside ADA in transaction outputs
    - No smart contract needed for transfers
    - Node enforces minting rules via "policy scripts"
- **right_column:**
  - **Benefits of native tokens:**
    - Cheaper to transfer (no script execution fee)
    - Simpler to implement
    - All tokens use the same transfer mechanism as ADA
    - Atomic multi-asset transfers in a single output
    - Token holders don't need to interact with smart contracts
- **visual_suggestion:** Two-panel comparison. Left: Ethereum with separate smart contract boxes for each token. Right: Cardano with tokens living directly in UTXOs alongside ADA.
- **speaker_notes:** This is a fundamental architectural difference. On Ethereum, if you want to send USDC, you're calling the USDC smart contract. On Cardano, sending a native token is exactly the same operation as sending ADA - it's just another value in the output. This makes token operations cheaper, simpler, and more uniform. The trade-off is the min UTXO requirement (next slide).

---

## Slide 12: The Value Type

- **layout:** title_and_body
- **title:** Multi-Asset Values
- **body:**
  - Every UTXO carries a **Value**:
    ```
    Value = ADA (lovelace) + Map<PolicyId, Map<AssetName, Quantity>>
    ```
  - **Example UTXO value:**
    ```
    {
      "lovelace": 5000000,           // 5 ADA
      "abc123...def456": {            // PolicyId
        "TutorialToken": 1000,        // 1000 TutorialTokens
        "AnotherToken": 50            // 50 AnotherTokens
      },
      "789xyz...abc012": {            // Different PolicyId
        "NFT001": 1                   // 1 NFT
      }
    }
    ```
  - A single UTXO can carry ADA + tokens from multiple policies
  - ADA is special: it's always present (no PolicyId needed)
- **visual_suggestion:** Box diagram of a UTXO with multiple "layers" showing the value structure. ADA at the base, then grouped tokens by policy.
- **speaker_notes:** The Value type is how Cardano represents multi-asset values. Think of it as a nested map: first level is PolicyId (which token family), second level is AssetName (which specific token in that family), and the value is the quantity. ADA itself is just lovelace without a PolicyId - it's treated specially as the "native" currency.

---

## Slide 13: Min UTXO Value

- **layout:** title_and_body
- **title:** Why Every UTXO Needs ADA
- **body:**
  - **Rule:** Every UTXO must carry a minimum amount of ADA
  - **Why?** UTXOs consume memory in the node's UTXO set. ADA is the "rent" for that storage.
  - **How much?** Proportional to the UTXO's serialized size:
    - `minAda = coinsPerUTXOByte × utxoSize(bytes)`
    - Current parameter: ~4,310 lovelace per byte
    - A simple ADA-only UTXO: ~1 ADA minimum
    - A UTXO with tokens: ~1.5-2+ ADA minimum (more tokens = more bytes = more ADA)
  - **Common error:** "OutputTooSmall" - your output doesn't carry enough ADA
  - Most transaction builder libraries adjust the ADA amount automatically if below the minimum
- **visual_suggestion:** Bar chart showing min UTXO amounts for different output types: ADA-only, 1 token, 5 tokens, with inline datum. Each bar grows taller.
- **speaker_notes:** This is the #1 gotcha for beginners working with native tokens. You can't send "just tokens" - you must always include enough ADA. If you're building an NFT marketplace, for example, every UTXO holding an NFT must also hold ~1.5 ADA. This is a design trade-off: it prevents UTXO set bloat (which would make nodes more expensive to run) but adds cost for token operations. Most SDKs handle this automatically, but understanding it is critical for budgeting and UX design.

---

## Slide 14: Minting Policies

- **layout:** title_and_body
- **title:** Who Can Create Tokens?
- **body:**
  - A **minting policy** defines the rules for creating/destroying tokens
  - The policy is a **NativeScript** (simple rule-based) or **PlutusScript** (arbitrary logic)
  - **NativeScript types:**
    - `ScriptPubkey` - requires a specific key's signature
    - `ScriptAll` - ALL listed conditions must be met
    - `ScriptAny` - ANY one condition must be met
    - `ScriptAtLeast` - at least N-of-M conditions
    - `RequireTimeBefore` - only valid before slot X
    - `RequireTimeAfter` - only valid after slot X
  - **Time-locked policy** = fixed supply:
    - Combine key requirement + time lock
    - After the time lock expires, no one can ever mint more
    - This is how you create provably finite-supply tokens
- **visual_suggestion:** Decision tree showing different policy types. Highlight the time-locked policy pattern with a padlock icon.
- **speaker_notes:** Minting policies are the access control for token creation. The simplest policy is ScriptPubkey: only the holder of a specific key can mint. ScriptAll is used for multi-sig: requiring multiple parties to agree. The time-locked pattern is especially important for token launches: by combining ScriptAll with RequireTimeBefore, you can prove that no new tokens will ever be minted after a certain date. This is crucial for investor confidence. In our tutorial code, we use PolicyUtil.createMultiSigScriptAllPolicy which creates a simple single-key ScriptAll policy.

---

## Slide 15: PolicyId & AssetName

- **layout:** title_and_body
- **title:** Token Identity
- **body:**
  - **PolicyId** = Blake2b-224 hash of the policy script (28 bytes = 56 hex chars)
    - Uniquely identifies the "token family"
    - Cannot be changed after creation (it's a hash)
    - Different keys = different PolicyId (even if logic is the same)
  - **AssetName** = human-readable name (up to 32 bytes, hex-encoded on-chain)
    - Identifies a specific token within a policy
    - Can be empty (for fungible tokens with one variant)
  - **Full token ID** = PolicyId + AssetName (concatenated)
    - Example: `abc123...def456.5475746f7269616c546f6b656e` (hex of "TutorialToken")
  - **Token Fingerprint (CIP-14):** `asset1...` - a human-friendly identifier
    - Derived from PolicyId + AssetName
    - Used in explorers and wallets
- **visual_suggestion:** Diagram showing: Policy Script -> hash function -> PolicyId, then PolicyId + AssetName -> Full Token ID. Show CIP-14 fingerprint as an alias.
- **speaker_notes:** The PolicyId is the permanent, immutable anchor of a token family. Once you publish a token under a PolicyId, that ID can never be used for a different policy (since it's a hash). AssetName distinguishes tokens within the same policy - for example, an NFT collection might have one PolicyId with different AssetNames for each NFT. The hex encoding of AssetName on-chain is a common confusion point: "TutorialToken" becomes "5475746f7269616c546f6b656e" in hex. Wallets and explorers decode this for display.

---

## Slide 16: Common Pitfalls

- **layout:** title_and_body
- **title:** Top 5 Mistakes Beginners Make
- **body:**
  1. **Forgetting the change output** - Entire input amount minus fee goes to the receiver. You lose your remaining ADA!
  2. **Min UTXO not met** - "OutputTooSmall" error. Every output needs minimum ADA (~1-2 ADA depending on size).
  3. **Wrong network** - Sending a testnet transaction to mainnet (or vice versa). Always check your address prefix.
  4. **TTL too tight** - Transaction expires before it reaches a block producer. Allow at least 5-10 minutes.
  5. **Trying to spend already-spent UTXOs** - UTXOs are one-time use. Once consumed, they're gone. Refresh your UTXO set before building.
  - **Bonus:** Not including the policy key when minting - the transaction will fail validation.
- **visual_suggestion:** Warning icons next to each pitfall. Could use red/yellow color coding for severity.
- **speaker_notes:** Go through each one with a real-world anecdote or example. #1 is the most dangerous - it's how people lose funds. Transaction builder libraries create change outputs automatically, but if you're building transactions manually, this is a critical step to remember. #2 is the most common - every output must carry enough ADA. #5 happens in concurrent scenarios - if two people try to spend the same UTXO, only one transaction will succeed.

---

## Slide 17: Tooling Landscape

- **layout:** title_and_body
- **title:** Developer Tools
- **body:**
  - **SDKs / Libraries:**
    - Java: **cardano-client-lib** (bloxbean) - what we use today
    - JavaScript/TypeScript: **Mesh SDK**, **Lucid Evolution**, **Blaze**
    - Python: **PyCardano**
    - Rust: **cardano-serialization-lib**
    - Haskell: **cardano-api** (official)
  - **Backend Providers:**
    - **Blockfrost** - hosted REST API (free tier available)
    - **Koios** - community-operated, open source
    - **Ogmios + Kupo** - self-hosted, full node required
    - **Yaci DevKit** - local development chain
  - **Explorers:** CardanoScan, CExplorer, Cardano Explorer
  - **Testnets:** Preprod (stable), Preview (bleeding edge)
- **visual_suggestion:** Grid/matrix of tools organized by language and category. Highlight Java + Blockfrost as "what we use today."
- **speaker_notes:** The Cardano developer ecosystem has matured significantly. For this tutorial we chose Java + cardano-client-lib + Blockfrost as the most accessible combination for enterprise Java developers. Mention that future sessions may explore other language SDKs. Blockfrost provides a free tier that's sufficient for development and testing. For production, consider self-hosted solutions (Ogmios + Kupo) for full control.

