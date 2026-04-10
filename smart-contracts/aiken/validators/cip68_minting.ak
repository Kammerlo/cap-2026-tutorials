use aiken/builtin
use aiken/collection/dict
use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/address.{Script}
use cardano/assets.{PolicyId}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{InlineDatum, OutputReference, Transaction}

// ── CIP-67 Label Prefixes (4 bytes) ─────────────────────────────────────────

/// CIP-68 Multi-Purpose Validator  (Plutus V3)
///
/// A single validator that handles the full CIP-68 lifecycle:
///
///   mint handler  — controls minting and burning of CIP-68 token pairs
///   spend handler — guards the reference-NFT UTXOs for metadata updates
///
/// Token Pair Structure (CIP-67 + CIP-68):
///   Label 100  (prefix 000643b0)  — Reference NFT, stores metadata as inline datum
///   Label 222  (prefix 000de140)  — User NFT, the token that users hold
///
/// The reference NFT is locked at this validator's own script address.
/// Updating metadata means spending the old ref-NFT UTXO and creating a
/// new one at the same address with updated datum.
///
/// Based on the standard CIP-68 pattern used in production (Cornucopias,
/// Anastasia Labs) and the `assist` library's CIP68 type definition.
/// (100) Reference Token prefix
const prefix_100: ByteArray = #"000643b0"

/// (222) Non-Fungible Token prefix
const prefix_222: ByteArray = #"000de140"

// ── Standard CIP-68 Metadata Type ────────────────────────────────────────────
// This matches the assist library's CIP68 type and the spec at
// https://cips.cardano.org/cips/cip68/

/// The on-chain metadata datum stored at the reference-NFT UTXO.
pub type CIP68 {
  metadata: Pairs<Data, Data>,
  version: Int,
  extra: Data,
}

// ── Redeemers ────────────────────────────────────────────────────────────────

/// Redeemer for the mint handler.
pub type MintAction {
  /// Mint a new CIP-68 token pair (ref + user).
  MintTokens
  /// Burn a CIP-68 token pair.
  BurnTokens
}

/// Redeemer for the spend handler (metadata store).
pub type StoreAction {
  /// Update the metadata datum on the reference NFT.
  UpdateMeta
  /// Remove the reference NFT entirely (pair it with BurnTokens on mint).
  RemoveMeta
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/// Prepend a CIP-67 label prefix to a base token name.
fn prefixed(label: ByteArray, name: ByteArray) -> ByteArray {
  builtin.append_bytearray(label, name)
}

/// Check that the transaction is signed by a given key.
fn signed_by(tx: Transaction, vkh: VerificationKeyHash) -> Bool {
  list.has(tx.extra_signatories, vkh)
}

// ── Validator ────────────────────────────────────────────────────────────────

/// Parameterised by the owner's verification key hash.
/// Only the owner can mint, burn, or update metadata.
validator cip68(owner: VerificationKeyHash) {
  /// Mint handler — authorises minting or burning of CIP-68 token pairs.
  mint(action: MintAction, policy_id: PolicyId, self: Transaction) {
    // Owner must always sign
    expect signed_by(self, owner)

    when action is {
      MintTokens -> {
        // Derive the own script address from the policy_id
        let script_cred = Script(policy_id)

        // Find the first minted asset name to derive the base name
        let minted_tokens = assets.tokens(self.mint, policy_id)
        let token_pairs = dict.to_pairs(minted_tokens)

        // Expect at least 2 tokens (ref + user)
        expect [first, second, ..] = token_pairs

        let first_name = first.1st
        let first_qty = first.2nd
        let second_name = second.1st
        let second_qty = second.2nd

        // Verify: exactly +1 of ref (prefix_100) and +1 of user (prefix_222)
        // Dict is sorted, so prefix_100 (000643b0) comes before prefix_222 (000de140)
        let base_name =
          builtin.slice_bytearray(
            4,
            builtin.length_of_bytearray(first_name) - 4,
            first_name,
          )

        and {
          // First token is the reference NFT
          first_name == prefixed(prefix_100, base_name),
          first_qty == 1,
          // Second token is the user NFT
          second_name == prefixed(prefix_222, base_name),
          second_qty == 1,
          // Reference NFT must go to this script's own address with valid CIP-68 datum
          list.any(
            self.outputs,
            fn(output) {
              let is_script_addr =
                output.address.payment_credential == script_cred
              let has_ref_token =
                assets.quantity_of(output.value, policy_id, first_name) == 1
              // Verify the output carries an inline CIP68 datum
              let has_valid_datum =
                when output.datum is {
                  InlineDatum(raw) -> {
                    // This expect will fail if datum doesn't match CIP68 shape
                    expect _: CIP68 = raw
                    True
                  }
                  _ -> False
                }
              is_script_addr && has_ref_token && has_valid_datum
            },
          ),
        }
      }

      BurnTokens -> {
        // When burning, all minted quantities must be negative
        let minted_tokens = assets.tokens(self.mint, policy_id)
        dict.foldl(minted_tokens, True, fn(_name, qty, acc) { acc && qty < 0 })
      }
    }
  }

  /// Spend handler — guards reference-NFT UTXOs for metadata updates.
  spend(
    datum: Option<CIP68>,
    action: StoreAction,
    own_ref: OutputReference,
    self: Transaction,
  ) {
    // Owner must always sign
    expect signed_by(self, owner)
    // Datum must be present
    expect Some(_current_datum) = datum

    // Find this input to get the script address
    expect Some(this_input) =
      list.find(self.inputs, fn(i) { i.output_reference == own_ref })
    let this_addr = this_input.output.address

    when action is {
      UpdateMeta -> {
        // Count inputs and outputs at this script address
        let script_inputs =
          list.filter(self.inputs, fn(i) { i.output.address == this_addr })
        let script_outputs =
          list.filter(self.outputs, fn(o) { o.address == this_addr })

        // Must have exactly 1 input and 1 output at the script
        expect [_single_input] = script_inputs
        expect [single_output] = script_outputs

        // Output must carry a valid CIP68 datum
        when single_output.datum is {
          InlineDatum(raw) -> {
            expect _: CIP68 = raw
            True
          }
          _ -> False
        }
      }

      RemoveMeta ->
        // Owner can remove the ref NFT (for burning)
        True
    }
  }

  /// Catch-all — reject everything else.
  else(_ctx: ScriptContext) {
    False
  }
}
