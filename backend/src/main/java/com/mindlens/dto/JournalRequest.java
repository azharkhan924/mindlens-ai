package com.mindlens.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JournalRequest {
    private String title;

    @NotBlank(message = "Journal content cannot be blank")
    private String content;
}
