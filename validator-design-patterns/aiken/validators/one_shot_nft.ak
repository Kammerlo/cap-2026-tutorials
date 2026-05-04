//// One-Shot NFT — Singleton Minting Policy
////
//// Pattern: Singleton / One-Shot Mint
////
//// PROBLEM
//// -------
//// A native Plutus minting policy is a pure function of (Redeemer, Context).
//// Without extra constraints, anyone could re-run it and mint additional
//// tokens. How do we guarantee that a token can only be minted ONCE in the
//// entire chain history?
////
//// MECHANISM
//// ---------
//// The policy is parameterised at compile time with a specific OutputReference
//// (a "seed UTXO" that exists at deployment time). The mint is allowed only if
//// that exact UTXO is consumed in the same transaction.
////
//// Why this works: every UTXO on Cardano can be spent at most once. So the
//// seed UTXO can be consumed in exactly one transaction, ever. Therefore the
//// mint succeeds at most once.
////
//// REAL-WORLD USAGE
//// ----------------
////   Minswap V2     — pool factory NFTs
////   SundaeSwap V3  — pool identification NFTs
////   Indigo         — protocol authority tokens
////   CIP-68         — collection-level reference NFTs
////
//// PITFALLS
//// --------
////   * Forgetting the MINT QUANTITY check — only checking the seed input lets
////     an attacker mint arbitrary amounts in the single allowed transaction.
////   * Allowing other tokens of this policy to be minted alongside.
////   * Hard-coding the OutputReference instead of passing it as a parameter.

use aiken/collection/dict
use aiken/collection/list
use cardano/assets.{PolicyId}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{OutputReference, Transaction}

/// Parameterised by a "seed" OutputReference. The mint succeeds at most once,
/// in the unique transaction that consumes this specific UTXO.
validator one_shot_nft(seed: OutputReference, asset_name: ByteArray) {
  mint(_redeemer: Data, policy_id: PolicyId, self: Transaction) {
    // 1. The seed UTXO must be among the transaction inputs.
    //    Because UTXOs can be spent at most once, this can succeed at most once.
    let seed_consumed =
      list.any(self.inputs, fn(i) { i.output_reference == seed })

    // 2. Exactly one token of this policy must be minted, with the expected
    //    asset name and quantity 1. This forbids attackers from minting
    //    additional tokens of this policy in the single allowed transaction.
    let minted = assets.tokens(self.mint, policy_id)
    let exactly_one =
      when dict.to_pairs(minted) is {
        [Pair(name, qty)] -> name == asset_name && qty == 1
        _ -> False
      }

    seed_consumed && exactly_one
  }

  else(_ctx: ScriptContext) {
    False
  }
}
