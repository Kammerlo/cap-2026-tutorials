package com.cardano.tutorial;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@OpenAPIDefinition(
    info = @Info(
        title = "Cardano Smart Contracts API",
        version = "1.0.0",
        description = "Tutorial API for Cardano smart contracts with Aiken - Hello World validator and CIP-68 token minting"
    )
)
public class SmartContractsApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartContractsApplication.class, args);
    }
}
