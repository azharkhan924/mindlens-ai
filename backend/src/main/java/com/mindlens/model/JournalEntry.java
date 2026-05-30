package com.mindlens.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "journal_entries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "journalEntry", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private EmotionAnalysis emotionAnalysis;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
