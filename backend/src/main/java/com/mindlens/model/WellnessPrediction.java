package com.mindlens.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wellness_predictions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WellnessPrediction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String predictionType; // e.g. "Burnout Risk"
    private Integer probability; // percentage (0-100)
    private Integer confidence; // percentage (0-100)
    private String status; // "low", "medium", "high"

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(columnDefinition = "TEXT")
    private String detailsJson; // JSON list of detailed bullet points

    private LocalDateTime predictedAt;

    @PrePersist
    protected void onCreate() {
        predictedAt = LocalDateTime.now();
    }
}
