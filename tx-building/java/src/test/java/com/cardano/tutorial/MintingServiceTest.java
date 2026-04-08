package com.cardano.tutorial;

import com.bloxbean.cardano.client.transaction.spec.Asset;
import com.bloxbean.cardano.client.transaction.spec.Policy;
import com.bloxbean.cardano.client.api.util.PolicyUtil;
import org.junit.jupiter.api.Test;

import java.math.BigInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for minting-related functionality.
 * These tests verify policy creation and asset definitions locally
 * without requiring a blockchain connection.
 */
class MintingServiceTest {

    @Test
    void createPolicy_producesPolicyId() throws Exception {
        // Create a simple single-key policy
        Policy policy = PolicyUtil.createMultiSigScriptAllPolicy("TestPolicy", 1);

        String policyId = policy.getPolicyId();
        assertNotNull(policyId);
        // PolicyId is a 28-byte hash = 56 hex characters
        assertEquals(56, policyId.length(),
                "PolicyId must be 56 hex characters (28 bytes), got: " + policyId.length());
        assertTrue(policyId.matches("[0-9a-f]+"),
                "PolicyId must be lowercase hex, got: " + policyId);
    }

    @Test
    void createPolicy_hasKeys() throws Exception {
        Policy policy = PolicyUtil.createMultiSigScriptAllPolicy("TestPolicy", 1);

        assertNotNull(policy.getPolicyKeys());
        assertEquals(1, policy.getPolicyKeys().size(),
                "Policy should have 1 signing key");
    }

    @Test
    void createPolicy_hasPolicyScript() throws Exception {
        Policy policy = PolicyUtil.createMultiSigScriptAllPolicy("TestPolicy", 1);

        assertNotNull(policy.getPolicyScript(),
                "Policy must have a NativeScript");
    }

    @Test
    void differentPolicies_haveDifferentPolicyIds() throws Exception {
        Policy policy1 = PolicyUtil.createMultiSigScriptAllPolicy("Policy1", 1);
        Policy policy2 = PolicyUtil.createMultiSigScriptAllPolicy("Policy2", 1);

        // Different keys = different policy hashes
        assertNotEquals(policy1.getPolicyId(), policy2.getPolicyId(),
                "Policies with different keys must produce different PolicyIds");
    }

    @Test
    void asset_creation() {
        Asset asset = new Asset("TutorialToken", BigInteger.valueOf(1000));

        assertEquals("TutorialToken", asset.getName());
        assertEquals(BigInteger.valueOf(1000), asset.getValue());
    }

    @Test
    void asset_negation_forBurning() {
        Asset asset = new Asset("TutorialToken", BigInteger.valueOf(500));
        Asset negated = asset.negate();

        assertEquals(BigInteger.valueOf(-500), negated.getValue(),
                "Negated asset should have negative value (for burning)");
    }

    @Test
    void multiSigPolicy_withMultipleKeys() throws Exception {
        // Create a policy requiring 2 keys to sign
        Policy policy = PolicyUtil.createMultiSigScriptAllPolicy("MultiSigPolicy", 3);

        assertEquals(3, policy.getPolicyKeys().size(),
                "Policy should have 3 signing keys");
        assertNotNull(policy.getPolicyId());
    }
}
