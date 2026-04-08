package com.cardano.tutorial.model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Response containing a derived address")
public record AddressResponse(

        @Schema(description = "The derived Bech32 base address",
                example = "addr_test1qz2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjc7")
        String address
) {}
