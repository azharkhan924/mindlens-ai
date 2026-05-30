package com.mindlens.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "wellness_scores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WellnessScore {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private Integer overallScore; // 1 to 100
    private Integer stress;
    private Integer energy;
    private Integer confidence;
    private Integer focus;
    private Integer motivation;

    @Column(columnDefinition = "TEXT")
    private String insight;

    private LocalDateTime scoredAt;

    @PrePersist
    protected void onCreate() {
        scoredAt = LocalDateTime.now();
    }
}
