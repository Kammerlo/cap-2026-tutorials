/// Hello World Smart Contract
///
/// A simple spend validator that demonstrates the basic structure of an Aiken
/// contract on Plutus V3. It unlocks a UTXO if the redeemer message matches
/// the message stored in the datum AND the transaction is signed by the owner.

use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/script_context.{ScriptContext}
use cardano/transaction.{OutputReference, Transaction}

/// Datum stored at the script UTXO — records who can unlock and the expected message.
pub type Datum {
  owner: VerificationKeyHash,
  msg: ByteArray,
}

/// Redeemer provided when spending — must carry the correct message.
pub type Redeemer {
  msg: ByteArray,
}

validator hello_world {
  /// Spend handler — runs when someone tries to consume a UTXO at this script
  /// address. Two conditions must hold:
  ///   1. redeemer.msg == datum.msg
  ///   2. The datum owner's key is among the transaction's extra signatories
  spend(
    datum: Option<Datum>,
    redeemer: Redeemer,
    _own_ref: OutputReference,
    self: Transaction,
  ) {
    expect Some(Datum { owner, msg }) = datum

    let must_say_message = redeemer.msg == msg
    let must_be_signed = list.has(self.extra_signatories, owner)

    must_say_message && must_be_signed
  }

  /// Catch-all for any other script purpose (mint, withdraw, …) — always fails.
  else(_ctx: ScriptContext) {
    False
  }
}
