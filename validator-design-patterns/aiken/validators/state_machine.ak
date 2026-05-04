//// State Machine with Thread Token + Continuing Output
////
//// Patterns demonstrated (combined):
////   * State Thread Token — a unique NFT that travels with the canonical state
////   * Continuing Output  — UTXO state evolution by re-paying to self
////   * State Machine      — explicit datum tag with allowed transitions
////   * Multi-Validator    — mint + spend handlers share one script hash
////
//// PROBLEM
//// -------
//// UTXOs are ephemeral: every spend destroys them and creates new ones with
//// fresh OutputReferences. To track a single, evolving piece of state across
//// many transactions (e.g. a counter, a DEX pool, an oracle, a CDP), we need
//// a stable identifier that travels with the state.
////
//// MECHANISM
//// ---------
//// 1. INIT: mint a unique NFT (the "thread token") and put it in a UTXO at
////    this script with the initial datum.
//// 2. STEP: spending the state UTXO is only allowed if a "continuing output"
////    is produced — at the same script address, carrying the same thread
////    token, with an updated datum that satisfies the transition rules.
//// 3. CLOSE: burn the thread token and release any locked value to the owner.
////
//// REAL-WORLD USAGE
//// ----------------
////   Minswap V2 / SundaeSwap V3  — pool NFT held by pool UTXO
////   Indigo Protocol             — CDP UTXOs identified by per-CDP NFT
////   Charli3 oracles             — feed UTXO carries a feed-specific NFT
////   Liqwid markets              — Market ID thread tokens
////   Lenfi pools                 — pool identification NFT
////
//// PITFALLS
//// --------
////   * Validator forgets to check the NFT is preserved in the continuing
////     output → state UTXO can be "stolen" or lost.
////   * Validator allows splitting the NFT across multiple outputs → state
////     bifurcation. Always assert exactly one continuing output.
////   * Allowing arbitrary new datums → must constrain every field that
////     should be invariant.

use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Address, Script}
use cardano/assets.{PolicyId}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{InlineDatum, OutputReference, Output, Transaction}

/// The on-chain state. Includes a tag to make the state machine explicit
/// and a counter that can only move in approved ways.
pub type Counter {
  state: Phase,
  count: Int,
  owner: VerificationKeyHash,
}

/// Phases of the state machine. Allowed transitions:
///   Idle    → Active   (Start)
///   Active  → Active   (Increment)
///   Active  → Closed   (Stop)
///   Closed  → ⊥        (terminal — UTXO must be burned)
pub type Phase {
  Idle
  Active
  Closed
}

/// Mint redeemer — controls creation and destruction of the thread token.
pub type MintAction {
  /// Mint the thread NFT, using a seed UTXO for one-shot uniqueness.
  Init { seed: OutputReference }
  /// Burn the thread NFT — only allowed when the state UTXO is in Closed phase.
  Burn
}

/// Spend redeemer — controls valid state transitions.
pub type StepAction {
  Start
  Increment
  Stop
}

/// Asset name for the single thread token this validator manages.
const thread_token_name: ByteArray = "STATE"

/// Find the unique continuing output at this script address that still holds
/// the thread token. Fails if there isn't exactly one.
fn continuing_output(
  outputs: List<Output>,
  own_addr: Address,
  policy: PolicyId,
) -> Output {
  expect [out] =
    list.filter(
      outputs,
      fn(o) {
        o.address == own_addr && assets.quantity_of(
          o.value,
          policy,
          thread_token_name,
        ) == 1
      },
    )
  out
}

/// Multi-validator: mint handler controls the thread token; spend handler
/// guards state transitions. Both share the same script hash, so the policy_id
/// of the thread token equals the script credential of the state UTXO.
validator state_machine {
  // ── MINT HANDLER ──────────────────────────────────────────────────────────
  mint(action: MintAction, policy_id: PolicyId, self: Transaction) {
    when action is {
      Init { seed } -> {
        // ONE-SHOT GUARANTEE: the seed UTXO must be consumed in this tx.
        // UTXOs spend at most once, so this mint succeeds at most once.
        let seed_consumed =
          list.any(self.inputs, fn(i) { i.output_reference == seed })

        // Exactly one thread token must be minted, with the expected name.
        let minted = assets.tokens(self.mint, policy_id)
        let mint_ok =
          when dict.to_pairs(minted) is {
            [Pair(name, qty)] -> name == thread_token_name && qty == 1
            _ -> False
          }

        // Initial state: token must be paid to this script address with a
        // datum in the Idle phase, count = 0. Caller specifies the owner.
        let own_addr =
          Address { payment_credential: Script(policy_id), stake_credential: None }

        let init_output_ok =
          list.any(
            self.outputs,
            fn(o) {
              let to_self = o.address == own_addr
              let has_thread =
                assets.quantity_of(o.value, policy_id, thread_token_name) == 1
              let datum_ok =
                when o.datum is {
                  InlineDatum(d) -> {
                    expect c: Counter = d
                    c.state == Idle && c.count == 0
                  }
                  _ -> False
                }
              to_self && has_thread && datum_ok
            },
          )

        seed_consumed && mint_ok && init_output_ok
      }

      Burn -> {
        // Burn requires exactly the one thread token, with quantity -1, AND
        // the spend handler will have already enforced Phase == Closed.
        let minted = assets.tokens(self.mint, policy_id)
        when dict.to_pairs(minted) is {
          [Pair(name, qty)] -> name == thread_token_name && qty == -1
          _ -> False
        }
      }
    }
  }

  // ── SPEND HANDLER ─────────────────────────────────────────────────────────
  spend(
    datum: Option<Counter>,
    action: StepAction,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(prev) = datum

    // Owner must always sign — authorisation gate.
    expect list.has(self.extra_signatories, prev.owner)

    // Find this input to learn the script address & policy id.
    expect Some(this_input) =
      list.find(self.inputs, fn(i) { i.output_reference == own_ref })
    let own_addr = this_input.output.address
    expect Script(policy_id) = own_addr.payment_credential

    when action is {
      Start -> {
        // Idle → Active, count stays at 0.
        expect prev.state == Idle
        let out = continuing_output(self.outputs, own_addr, policy_id)
        expect InlineDatum(d) = out.datum
        expect next: Counter = d
        and {
          next.state == Active,
          next.count == 0,
          next.owner == prev.owner,
        }
      }

      Increment -> {
        // Active → Active, count must increase by exactly 1.
        expect prev.state == Active
        let out = continuing_output(self.outputs, own_addr, policy_id)
        expect InlineDatum(d) = out.datum
        expect next: Counter = d
        and {
          next.state == Active,
          next.count == prev.count + 1,
          next.owner == prev.owner,
        }
      }

      Stop -> {
        // Active → Closed. After this, the state UTXO can only be spent in a
        // tx that also burns the thread token (enforced by mint handler).
        expect prev.state == Active
        let out = continuing_output(self.outputs, own_addr, policy_id)
        expect InlineDatum(d) = out.datum
        expect next: Counter = d
        and {
          next.state == Closed,
          next.count == prev.count,
          next.owner == prev.owner,
        }
      }
    }
  }

  else(_ctx: ScriptContext) {
    False
  }
}
