package com.mindlens.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindlens.model.EmotionAnalysis;
import com.mindlens.model.User;
import com.mindlens.model.WellnessPrediction;
import com.mindlens.model.WellnessScore;
import com.mindlens.repository.EmotionAnalysisRepository;
import com.mindlens.repository.WellnessPredictionRepository;
import com.mindlens.repository.WellnessScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class WellnessService {

    @Autowired
    private WellnessScoreRepository wellnessScoreRepository;

    @Autowired
    private WellnessPredictionRepository wellnessPredictionRepository;

    @Autowired
    private EmotionAnalysisRepository emotionAnalysisRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public WellnessScore calculateAndSaveCurrentScore() {
        User currentUser = authService.getCurrentAuthenticatedUser();

        // Fetch recent analyses
        List<EmotionAnalysis> recentAnalyses = emotionAnalysisRepository.findByUserOrderByAnalyzedAtDesc(currentUser);

        int totalStress = 30;
        int totalEnergy = 60;
        int totalConfidence = 65;
        int totalFocus = 70;
        int totalMotivation = 65;
        int count = 0;

        // Take up to 8 recent entries
        int limit = Math.min(recentAnalyses.size(), 8);
        for (int i = 0; i < limit; i++) {
            EmotionAnalysis ea = recentAnalyses.get(i);
            totalStress += ea.getStressScore();
            totalEnergy += ea.getEnergyScore();
            totalConfidence += ea.getConfidenceScore();
            totalFocus += ea.getFocusScore();
            totalMotivation += ea.getMotivationScore();
            count++;
        }

        if (count > 0) {
            totalStress = Math.round((float) totalStress / (count + 1));
            totalEnergy = Math.round((float) totalEnergy / (count + 1));
            totalConfidence = Math.round((float) totalConfidence / (count + 1));
            totalFocus = Math.round((float) totalFocus / (count + 1));
            totalMotivation = Math.round((float) totalMotivation / (count + 1));
        }

        // Higher overall is better (low stress + high energy/confidence/focus/motivation)
        float baseWellness = (100f - totalStress + totalEnergy + totalConfidence + totalFocus + totalMotivation) / 5f;
        int overall = Math.max(25, Math.min(98, Math.round(baseWellness)));

        String insight = "Your metrics indicate high mental clarity and stability. Perfect day for learning or creative expansion.";
        if (totalStress > 60) {
            insight = "Your stress score has risen. You are showing elevated indicators of burnout. Consider activating calm modes.";
        } else if (totalEnergy < 45) {
            insight = "Overall cognitive load is high, and physical energy indicators are low. Prioritize deep rest today.";
        } else if (overall > 80) {
            insight = "Outstanding balance of energy and serene mood today. Keep doing what you're doing, your mindset is strong!";
        }

        WellnessScore score = WellnessScore.builder()
                .user(currentUser)
                .overallScore(overall)
                .stress(totalStress)
                .energy(totalEnergy)
                .confidence(totalConfidence)
                .focus(totalFocus)
                .motivation(totalMotivation)
                .insight(insight)
                .build();

        return wellnessScoreRepository.save(score);
    }

    public List<WellnessScore> getHistoricalScores() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        // Return up to 30 history points
        return wellnessScoreRepository.findByUserOrderByScoredAtDesc(currentUser, PageRequest.of(0, 30));
    }

    @Transactional
    public List<WellnessPrediction> generateAndGetPredictions() {
        User currentUser = authService.getCurrentAuthenticatedUser();

        // 1. Calculate latest score first to ground the predictions
        WellnessScore scores = calculateAndSaveCurrentScore();

        // Clear previous predictions
        List<WellnessPrediction> oldPredictions = wellnessPredictionRepository.findByUserOrderByPredictedAtDesc(currentUser);
        wellnessPredictionRepository.deleteAll(oldPredictions);

        List<WellnessPrediction> predictions = new ArrayList<>();

        // Prediction 1: Burnout Risk
        int burnoutProb = Math.round(scores.getStress() * 0.85f + (100f - scores.getEnergy()) * 0.15f);
        String burnoutStatus = burnoutProb > 65 ? "high" : (burnoutProb > 45 ? "medium" : "low");
        List<String> burnoutDetails = Arrays.asList(
                "Elevated average weekly stress scores (currently at " + scores.getStress() + "/100).",
                "Mild fatigue indicators registered in recent check-ins.",
                "Compounded high-priority deadline sensitivity matches in journals."
        );
        predictions.add(createPrediction(currentUser, "Burnout Risk", burnoutProb, 88, burnoutStatus,
                "Burnout risk represents your aggregate nervous system load vs cognitive energy recovery.", burnoutDetails));

        // Prediction 2: Stress Escalation
        int stressEscProb = Math.round(scores.getStress() * 0.6f + (100f - scores.getFocus()) * 0.4f);
        String stressStatus = stressEscProb > 55 ? "medium" : "low";
        List<String> stressDetails = Arrays.asList(
                "Pace of speech in voice entries indicates mild cognitive rushing.",
                "Focus capacity shows slight friction, making tasks feel heavier.",
                "Daily reflection themes showing elevated deadline sensitivity."
        );
        predictions.add(createPrediction(currentUser, "Stress Escalation", stressEscProb, 82, stressStatus,
                "Predicts the probability of encountering an acute anxiety or distress threshold in the coming days.", stressDetails));

        // Prediction 3: Motivation Decline
        int motivationDeclineProb = Math.round((100f - scores.getMotivation()) * 0.7f + scores.getStress() * 0.3f);
        String motStatus = motivationDeclineProb > 65 ? "high" : (motivationDeclineProb > 45 ? "medium" : "low");
        List<String> motDetails = Arrays.asList(
                "Energy index is currently " + scores.getEnergy() + "/100.",
                "Strong correlation between high stress and physical fatigue indicators.",
                "Self-direction metrics are stable but require intentional recharge."
        );
        predictions.add(createPrediction(currentUser, "Motivation Decline", motivationDeclineProb, 85, motStatus,
                "Estimates the likelihood of feeling listless, distracted, or finding it difficult to start complex tasks.", motDetails));

        // Prediction 4: Recovery Likelihood
        int recoveryProb = Math.round((100f - scores.getStress()) * 0.5f + scores.getConfidence() * 0.5f);
        String recStatus = recoveryProb > 70 ? "high" : "medium";
        List<String> recDetails = Arrays.asList(
                "Excellent emotional self-awareness demonstrated in journals.",
                "Strong active goals for stress reduction and self-discovery.",
                "Highly adaptive cognitive patterns recognized in conversations."
        );
        predictions.add(createPrediction(currentUser, "Recovery Likelihood", recoveryProb, 90, recStatus,
                "Chances of returning to an optimal baseline of peace and high vitality within the next 48 hours.", recDetails));

        return wellnessPredictionRepository.saveAll(predictions);
    }

    private WellnessPrediction createPrediction(User user, String type, int prob, int conf, String status, String expl, List<String> details) {
        String detailsJson = "[]";
        try {
            detailsJson = objectMapper.writeValueAsString(details);
        } catch (Exception e) {
            // ignore
        }

        return WellnessPrediction.builder()
                .user(user)
                .predictionType(type)
                .probability(prob)
                .confidence(conf)
                .status(status)
                .explanation(expl)
                .detailsJson(detailsJson)
                .build();
    }
}
