package com.cardano.tutorial.service;

import com.bloxbean.cardano.aiken.AikenScriptUtil;
import com.bloxbean.cardano.client.plutus.blueprint.PlutusBlueprintUtil;
import com.bloxbean.cardano.client.plutus.blueprint.model.PlutusVersion;
import com.bloxbean.cardano.client.plutus.spec.BytesPlutusData;
import com.bloxbean.cardano.client.plutus.spec.ListPlutusData;
import com.bloxbean.cardano.client.plutus.spec.PlutusScript;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

/**
 * Loads compiled Aiken smart contract scripts from the plutus.json blueprint.
 *
 * Instead of reading individual .plutus files, this loads the full blueprint
 * produced by "aiken build" and extracts compiledCode by validator title.
 *
 * The CIP-68 validator is parameterized by the owner's verification key hash.
 * We use the aiken-java-binding to apply the parameter before creating the script.
 */
@Component
public class ScriptLoader {

    private static final String BLUEPRINT_PATH = "scripts/plutus.json";

    private static final String HELLO_WORLD_TITLE = "hello_world.hello_world.spend";
    private static final String CIP68_TITLE = "cip68_minting.cip68.mint";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private JsonNode blueprint;

    @PostConstruct
    public void init() throws IOException {
        ClassPathResource resource = new ClassPathResource(BLUEPRINT_PATH);
        try (InputStream is = resource.getInputStream()) {
            blueprint = objectMapper.readTree(is);
        }
    }

    /**
     * Load the hello world spend validator as a Plutus V3 script.
     */
    public PlutusScript loadHelloWorldScript() {
        String compiledCode = findCompiledCode(HELLO_WORLD_TITLE);
        return PlutusBlueprintUtil.getPlutusScriptFromCompiledCode(compiledCode, PlutusVersion.v3);
    }

    /**
     * Load the CIP-68 validator with the owner parameter applied.
     *
     * The Aiken validator is: validator cip68(owner: VerificationKeyHash) { ... }
     * We apply the owner's public key hash as a ByteArray parameter.
     *
     * @param ownerPkh owner's verification key hash (raw bytes, 28 bytes)
     * @return the parameterized PlutusScript ready for use as both minting policy and spending validator
     */
    public PlutusScript loadCip68Script(byte[] ownerPkh) {
        String compiledCode = findCompiledCode(CIP68_TITLE);

        // Apply the owner parameter to the parameterized script
        ListPlutusData params = new ListPlutusData();
        params.add(BytesPlutusData.of(ownerPkh));
        String appliedCode = AikenScriptUtil.applyParamToScript(params, compiledCode);

        return PlutusBlueprintUtil.getPlutusScriptFromCompiledCode(appliedCode, PlutusVersion.v3);
    }

    /**
     * Find the compiledCode for a validator by its title in the blueprint.
     */
    private String findCompiledCode(String title) {
        JsonNode validators = blueprint.get("validators");
        for (JsonNode validator : validators) {
            if (title.equals(validator.get("title").asText())) {
                return validator.get("compiledCode").asText();
            }
        }
        throw new IllegalStateException("Validator not found in plutus.json: " + title);
    }
}
