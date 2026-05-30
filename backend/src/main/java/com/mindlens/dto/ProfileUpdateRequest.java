package com.mindlens.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class ProfileUpdateRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String ageRange;
    private List<String> wellnessGoals;
}
