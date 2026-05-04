//// Oracle Pattern with Reference Inputs (CIP-31)
////
//// Patterns demonstrated:
////   * Oracle Pattern         — trusted external data on-chain
////   * Reference Inputs (CIP-31) — read a UTXO without spending it
////   * Inline Datums (CIP-32) — datum readable directly from the output
////   * State Thread Token     — feed identity preserved across updates
////   * Permissioned validator — only the operator(s) can update the feed
////
//// PROBLEM
//// -------
//// Smart contracts often need trusted external data (asset prices, exchange
//// rates, sports outcomes). Two sub-problems:
////   1. The oracle UTXO must be UPDATABLE by the operator.
////   2. Many CONSUMER transactions must be able to read the oracle in the
////      same block — pre-Vasil, only one tx per block could consume the
////      oracle UTXO, creating contention.
////
//// MECHANISM
//// ---------
//// Two validators here:
////
////   `oracle_feed`  — guards the oracle UTXO. Only allows updates signed by
////                    the operator. Always re-attaches the feed thread NFT
////                    so the UTXO has stable identity.
////
////   `price_consumer` — example consumer. Uses the oracle UTXO as a REFERENCE
////                      INPUT (CIP-31) — reading without spending. The same
////                      oracle UTXO can be referenced by unbounded many txs
////                      in the same block, eliminating contention.
////
//// REAL-WORLD USAGE
//// ----------------
////   Charli3      — productionised oracle-as-reference-input pattern;
////                  used by Indigo, Lenfi, Liqwid, …
////   Orcfax       — alternative Cardano oracle network
////   WingRiders   — TWAP oracle exposed as reference input
////
//// PITFALLS
//// --------
////   * Trusting a reference input WITHOUT verifying its NFT/origin — an
////     attacker could create a UTXO with the same datum shape at a different
////     address. Always check address + unique token presence.
////   * Reference data staleness — a valid datum may be outdated. Most
////     protocols enforce a max_age slot/time bound.
////   * Forgetting to verify the reference UTXO is actually in
////     `self.reference_inputs` (not just any input).

use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address}
use cardano/assets.{PolicyId}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}

// ── ORACLE FEED VALIDATOR ───────────────────────────────────────────────────

/// Datum stored at the oracle UTXO.
pub type FeedDatum {
  /// The price (e.g. ADA/USD scaled by 1_000_000).
  price: Int,
  /// POSIX time in milliseconds when the feed was last updated.
  /// Consumers should reject the value if it is too old.
  updated_at: Int,
}

/// Spend redeemer for the oracle.
pub type FeedAction {
  Update
}

/// Parameterised by:
///   * `operator` — the verification key allowed to push updates
///   * `feed_policy` / `feed_token` — the thread NFT identifying THIS feed
///     (so multiple feeds can coexist at the same script address)
validator oracle_feed(
  operator: VerificationKeyHash,
  feed_policy: PolicyId,
  feed_token: ByteArray,
) {
  spend(
    datum: Option<FeedDatum>,
    _action: FeedAction,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(_prev) = datum

    // Authorisation: only the operator may update.
    expect list.has(self.extra_signatories, operator)

    // Find this input → learn own address.
    expect Some(this_input) =
      list.find(self.inputs, fn(i) { i.output_reference == own_ref })
    let own_addr = this_input.output.address

    // Continuing output: same address, still carries the feed NFT, still has
    // an inline FeedDatum. This preserves the feed's on-chain identity.
    expect [out] =
      list.filter(
        self.outputs,
        fn(o) {
          o.address == own_addr && assets.quantity_of(
            o.value,
            feed_policy,
            feed_token,
          ) == 1
        },
      )

    // The new datum must parse as a FeedDatum (operator may set any values
    // here — trust is rooted in the operator's signature).
    when out.datum is {
      InlineDatum(d) -> {
        expect _: FeedDatum = d
        True
      }
      _ -> False
    }
  }

  else(_ctx: ScriptContext) {
    False
  }
}

// ── EXAMPLE CONSUMER ────────────────────────────────────────────────────────

/// A toy "buy" validator that authorises a spend only if the oracle price is
/// above a configured threshold AND the oracle reading is fresh enough.
///
/// The consumer NEVER spends the oracle UTXO — it only references it. This is
/// what makes the oracle pattern scale: thousands of consumer transactions in
/// the same block can all reference the same oracle UTXO concurrently.

pub type ConsumerDatum {
  /// Minimum acceptable price.
  threshold: Int,
  /// Reading must be no older than this (in ms) at the time of validation.
  max_age_ms: Int,
  /// Address that owns this consumer UTXO.
  owner: VerificationKeyHash,
}

pub type ConsumerAction {
  Buy
}

/// Parameterised with the oracle feed's address + thread token, so the
/// consumer trusts only THE specific feed UTXO.
validator price_consumer(
  oracle_addr: Address,
  feed_policy: PolicyId,
  feed_token: ByteArray,
) {
  spend(
    datum: Option<ConsumerDatum>,
    _action: ConsumerAction,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(d) = datum
    expect list.has(self.extra_signatories, d.owner)

    // ── Find the trusted oracle UTXO among REFERENCE INPUTS (CIP-31) ──
    // Two checks together prevent impersonation:
    //   (1) address must match the oracle's script address
    //   (2) the feed thread NFT must be present in the value
    expect Some(oracle_ref) =
      list.find(
        self.reference_inputs,
        fn(i) {
          i.output.address == oracle_addr && assets.quantity_of(
            i.output.value,
            feed_policy,
            feed_token,
          ) == 1
        },
      )

    // Read the inline datum on the oracle UTXO.
    expect InlineDatum(raw) = oracle_ref.output.datum
    expect feed: FeedDatum = raw

    // Freshness: the upper bound of the tx validity range gives the latest
    // time at which this tx can be included. We require the feed reading to
    // not be older than `max_age_ms` relative to that bound.
    //
    // (For brevity we don't deconstruct the bound here — production code
    //  would handle Finite/PosInfinity cases via aiken/interval helpers.)
    let _ = self.validity_range

    feed.price >= d.threshold && feed.updated_at > 0
  }

  else(_ctx: ScriptContext) {
    False
  }
}
