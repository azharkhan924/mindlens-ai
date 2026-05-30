package com.mindlens.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "emotion_analyses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmotionAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    private JournalEntry journalEntry;

    private Integer stressScore;
    private Integer energyScore;
    private Integer confidenceScore;
    private Integer focusScore;
    private Integer motivationScore;

    @Column(columnDefinition = "TEXT")
    private String emotionsJson; // list of custom emotional objects

    @Column(columnDefinition = "TEXT")
    private String themesJson;

    @Column(columnDefinition = "TEXT")
    private String insight;

    private LocalDateTime analyzedAt;

    @PrePersist
    protected void onAnalyze() {
        analyzedAt = LocalDateTime.now();
    }
}
