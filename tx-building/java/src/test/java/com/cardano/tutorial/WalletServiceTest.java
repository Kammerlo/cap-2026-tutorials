package com.cardano.tutorial;

import com.bloxbean.cardano.client.account.Account;
import com.bloxbean.cardano.client.common.model.Networks;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for wallet/account functionality.
 * These tests don't require a backend connection - they test
 * local cryptographic operations (key generation, address derivation).
 */
class WalletServiceTest {

    @Test
    void createAccount_generatesValidAddress() {
        // Create a new account on preprod testnet
        Account account = new Account(Networks.preprod());

        // Verify the address is a valid preprod testnet address
        String address = account.baseAddress();
        assertNotNull(address);
        assertTrue(address.startsWith("addr_test1"),
                "Preprod testnet addresses must start with 'addr_test1', got: " + address);
    }

    @Test
    void createAccount_generatesMnemonic() {
        Account account = new Account(Networks.preprod());
        String mnemonic = account.mnemonic();

        assertNotNull(mnemonic);
        // Default mnemonic is 24 words
        String[] words = mnemonic.split(" ");
        assertEquals(24, words.length,
                "Mnemonic should be 24 words, got: " + words.length);
    }

    @Test
    void restoreAccount_fromMnemonic_derivesSameAddress() {
        // Create an account and save its mnemonic
        Account original = new Account(Networks.preprod());
        String mnemonic = original.mnemonic();
        String originalAddress = original.baseAddress();

        // Restore from the same mnemonic
        Account restored = Account.createFromMnemonic(Networks.preprod(), mnemonic);

        // Must derive the same address
        assertEquals(originalAddress, restored.baseAddress(),
                "Restoring from the same mnemonic must produce the same address");
    }

    @Test
    void differentMnemonics_produceDifferentAddresses() {
        Account account1 = new Account(Networks.preprod());
        Account account2 = new Account(Networks.preprod());

        assertNotEquals(account1.baseAddress(), account2.baseAddress(),
                "Different mnemonics should produce different addresses");
    }

    @Test
    void mainnetAddress_hasDifferentPrefix() {
        Account mainnetAccount = new Account(Networks.mainnet());

        assertTrue(mainnetAccount.baseAddress().startsWith("addr1"),
                "Mainnet addresses must start with 'addr1'");
        assertFalse(mainnetAccount.baseAddress().startsWith("addr_test"),
                "Mainnet addresses must NOT start with 'addr_test'");
    }

    @Test
    void account_hasStakeAddress() {
        Account account = new Account(Networks.preprod());
        String stakeAddress = account.stakeAddress();

        assertNotNull(stakeAddress);
        assertTrue(stakeAddress.startsWith("stake_test1"),
                "Preprod stake addresses must start with 'stake_test1'");
    }

    @Test
    void account_hasEnterpriseAddress() {
        Account account = new Account(Networks.preprod());
        String enterpriseAddress = account.enterpriseAddress();

        assertNotNull(enterpriseAddress);
        // Enterprise addresses also use addr_test1 prefix on testnet
        // but they only contain a payment credential (no staking credential)
        assertTrue(enterpriseAddress.startsWith("addr_test1"),
                "Enterprise address should be a valid testnet address");

        // Enterprise and base addresses differ because base includes staking credential
        assertNotEquals(account.baseAddress(), enterpriseAddress,
                "Enterprise and base addresses should differ");
    }
}
