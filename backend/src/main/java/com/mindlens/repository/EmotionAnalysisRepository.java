package com.mindlens.repository;

import com.mindlens.model.EmotionAnalysis;
import com.mindlens.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmotionAnalysisRepository extends JpaRepository<EmotionAnalysis, UUID> {
    
    @Query("SELECT ea FROM EmotionAnalysis ea WHERE ea.journalEntry.user = :user OR ea.voiceRecording.user = :user ORDER BY ea.analyzedAt DESC")
    List<EmotionAnalysis> findByUserOrderByAnalyzedAtDesc(@Param("user") User user);
    
    @Query("SELECT ea FROM EmotionAnalysis ea WHERE ea.journalEntry.user.id = :userId OR ea.voiceRecording.user.id = :userId ORDER BY ea.analyzedAt DESC")
    List<EmotionAnalysis> findByUserIdOrderByAnalyzedAtDesc(@Param("userId") UUID userId);
}
