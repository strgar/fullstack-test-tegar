package com.tegar.fullstack.backend.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponse {
    private Long id;
    private String title;
    private String description;
    private Long dueEpoch;
    private Long createdAtEpoch;
}
