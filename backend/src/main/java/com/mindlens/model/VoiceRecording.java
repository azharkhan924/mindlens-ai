package com.mindlens.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "voice_recordings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceRecording {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private String duration; // e.g. "0:45"

    @Column(columnDefinition = "TEXT")
    private String transcription;

    private Integer pace; // WPM

    private Integer energy; // 1 to 100

    private Integer pauses; // pause count

    private Integer confidence; // 0 to 100

    private LocalDateTime createdAt;

    @OneToOne(mappedBy = "voiceRecording", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private EmotionAnalysis emotionAnalysis;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
