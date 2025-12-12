package com.tegar.fullstack.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ItemRequest {

    @NotBlank(message = "Judul harus diisi")
    private String title;

    private String description;

    @NotNull(message = "dueEpoch wajib diisi (epoch seconds)")
    private Long dueEpoch;
}
