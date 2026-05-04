//// Withdraw-Zero Trick (a.k.a. "Stake Validator Trick" or "Forwarding Pattern")
////
//// Pattern demonstrated:
////   * Withdraw-Zero  — delegate expensive global checks from many spending
////                      validators to ONE stake-credential validator
////   * Forwarding     — spending validators trust whatever the stake
////                      validator decides
////
//// PROBLEM
//// -------
//// Imagine a DEX batcher: a single transaction consumes N order UTXOs at the
//// same script address. Each spending validator runs independently. If each
//// of them needs to verify the SAME global property (e.g. "the pool reserves
//// after this batch are correct"), the work explodes:
////
////    naive cost  =  N × (cost of full global check)   →  O(N²) ex-units
////
//// At ~16 KB ex-budget, this caps batch size brutally low.
////
//// MECHANISM
//// ---------
//// 1. Define a STAKE-CREDENTIAL validator (a Plutus V3 `withdraw` handler).
//// 2. The transaction includes a "withdrawal" of zero ADA from this stake
////    credential. Because the withdrawal is non-zero in the protocol sense
////    (it appears in the withdrawals map), the stake validator IS invoked
////    with the full ScriptContext. It runs the expensive global check ONCE.
//// 3. Each spending validator only checks: "is the trusted stake validator
////    being invoked in this same transaction?" — a constant-time map lookup.
////
////    cheap cost  =  N × O(1)  +  1 × (cost of full global check)
////
//// REAL-WORLD USAGE
//// ----------------
////   SundaeSwap V3   — "scoopers" architecture; one stake validator
////                     authorises an entire batch of order spends.
////   Minswap V2      — order batching uses the same idiom.
////   Genius Yield    — Smart Liquidity Vaults order matching.
////   Splash Protocol — heavily relies on the trick.
////   Anastasia Labs  — `aiken-design-patterns` repo has a canonical version.
////
//// PITFALLS
//// --------
////   * Forgetting to register the stake credential before first use (one-time
////     cardano-cli step but easy to miss in deployment scripts).
////   * The stake validator's redeemer is the ONLY one passed — if you need
////     per-spend redeemers, encode them in a list redeemer indexed by input.
////   * Trusting the withdrawal's PRESENCE without checking the stake
////     credential is the EXACT one you trust → impersonation by another
////     stake validator that just happens to be invoked.
////   * Plutus V3 added native `publish` / `vote` handlers that can replace
////     this for governance use cases — choose the right tool.

use aiken/collection/list
use aiken/collection/pairs
use cardano/address.{Credential, Script}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{OutputReference, Transaction}

// ── BATCH AUTHORITY (the stake validator that does the heavy lifting) ──────

/// Datum at each order UTXO. Trivial here — in production this would carry
/// the trader's intent (asset_in, asset_out, min_received, deadline, etc.).
pub type Order {
  trader: ByteArray,
  amount: Int,
}

/// Batch redeemer — passed once to the stake validator. In production this
/// would carry per-order indices and matching info.
pub type BatchAction {
  Settle
}

/// The expensive global check runs HERE, exactly once per batch transaction.
/// In a real DEX this would:
///   * iterate all order inputs and matching outputs
///   * verify the pool's invariant after the batch
///   * verify slippage bounds for every trader
///   * collect the protocol fee
///
/// For teaching purposes we just demand the redeemer is `Settle` and that at
/// least one input is present — enough to show the call shape.
validator batch_authority {
  withdraw(redeemer: BatchAction, _credential: Credential, self: Transaction) {
    when redeemer is {
      Settle -> {
        // Pretend this is the EXPENSIVE batched check.
        let has_inputs = list.length(self.inputs) > 0
        has_inputs
      }
    }
  }

  else(_ctx: ScriptContext) {
    False
  }
}

// ── ORDER VALIDATOR (delegates to the batch authority via withdraw-zero) ───

/// Parameterised with the script hash of the batch authority. Each order spend
/// is cheap — it only verifies that the batch authority is being invoked in
/// the same transaction. The batch authority does the real validation.
validator order(batch_authority_hash: ByteArray) {
  spend(
    datum: Option<Order>,
    _redeemer: Data,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(_) = datum

    // Constant-time check: does this transaction include a withdrawal whose
    // credential matches the batch authority's script hash?
    //
    // We don't care about the withdrawn amount — typically it's 0 ADA, hence
    // the name "withdraw-zero". The presence of the withdrawal in the map is
    // what causes the stake validator to be invoked, and its successful
    // invocation is what we delegate trust to.
    let trusted_cred = Script(batch_authority_hash)
    when pairs.get_first(self.withdrawals, trusted_cred) is {
      Some(_) -> True
      None -> False
    }
  }

  else(_ctx: ScriptContext) {
    False
  }
}
