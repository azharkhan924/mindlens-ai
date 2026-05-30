package com.mindlens.repository;

import com.mindlens.model.User;
import com.mindlens.model.WellnessScore;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface WellnessScoreRepository extends JpaRepository<WellnessScore, UUID> {
    List<WellnessScore> findByUserOrderByScoredAtDesc(User user);
    List<WellnessScore> findByUserIdOrderByScoredAtDesc(UUID userId);
    
    List<WellnessScore> findByUserOrderByScoredAtDesc(User user, Pageable pageable);
    List<WellnessScore> findByUserIdOrderByScoredAtDesc(UUID userId, Pageable pageable);
}
