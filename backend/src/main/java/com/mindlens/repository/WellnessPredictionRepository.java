package com.mindlens.repository;

import com.mindlens.model.User;
import com.mindlens.model.WellnessPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface WellnessPredictionRepository extends JpaRepository<WellnessPrediction, UUID> {
    List<WellnessPrediction> findByUserOrderByPredictedAtDesc(User user);
    List<WellnessPrediction> findByUserIdOrderByPredictedAtDesc(UUID userId);
}
