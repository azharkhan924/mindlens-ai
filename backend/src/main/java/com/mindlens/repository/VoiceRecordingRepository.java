package com.mindlens.repository;

import com.mindlens.model.User;
import com.mindlens.model.VoiceRecording;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface VoiceRecordingRepository extends JpaRepository<VoiceRecording, UUID> {
    List<VoiceRecording> findByUserOrderByCreatedAtDesc(User user);
    List<VoiceRecording> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
