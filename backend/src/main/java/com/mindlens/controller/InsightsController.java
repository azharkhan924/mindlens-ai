package com.mindlens.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindlens.model.EmotionAnalysis;
import com.mindlens.repository.EmotionAnalysisRepository;
import com.mindlens.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/insights")
public class InsightsController {

    @Autowired
    private EmotionAnalysisRepository emotionAnalysisRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardInsights() {
        try {
            var user = authService.getCurrentAuthenticatedUser();
            List<EmotionAnalysis> analyses = emotionAnalysisRepository.findByUserOrderByAnalyzedAtDesc(user);

            // 1. Calculate Sentiment Density percentages
            Map<String, Integer> emotionCounts = new HashMap<>();
            int totalEmotionsCount = 0;

            for (EmotionAnalysis ea : analyses) {
                try {
                    if (ea.getEmotionsJson() != null && !ea.getEmotionsJson().isBlank()) {
                        List<Map<String, Object>> emotions = objectMapper.readValue(
                                ea.getEmotionsJson(),
                                new TypeReference<List<Map<String, Object>>>() {}
                        );
                        for (Map<String, Object> emo : emotions) {
                            String name = (String) emo.get("name");
                            if (name != null) {
                                emotionCounts.put(name, emotionCounts.getOrDefault(name, 0) + 1);
                                totalEmotionsCount++;
                            }
                        }
                    }
                } catch (Exception e) {
                    // ignore
                }
            }

            List<Map<String, Object>> sentimentDistribution = new ArrayList<>();
            if (totalEmotionsCount == 0) {
                // Populate default distributions matching mockData
                sentimentDistribution.add(Map.of("name", "Serenity", "count", 42, "color", "var(--calm)"));
                sentimentDistribution.add(Map.of("name", "Focus", "count", 25, "color", "var(--focus)"));
                sentimentDistribution.add(Map.of("name", "Anxiety", "count", 18, "color", "var(--destructive)"));
                sentimentDistribution.add(Map.of("name", "Gratitude", "count", 15, "color", "var(--warmth)"));
            } else {
                for (Map.Entry<String, Integer> entry : emotionCounts.entrySet()) {
                    int percent = Math.round((float) entry.getValue() * 100 / totalEmotionsCount);
                    String color = "var(--calm)";
                    if (entry.getKey().equalsIgnoreCase("Anxiety") || entry.getKey().equalsIgnoreCase("Fear") || entry.getKey().equalsIgnoreCase("Stress") || entry.getKey().equalsIgnoreCase("Overwhelm")) {
                        color = "var(--destructive)";
                    } else if (entry.getKey().equalsIgnoreCase("Gratitude") || entry.getKey().equalsIgnoreCase("Warmth") || entry.getKey().equalsIgnoreCase("Pride")) {
                        color = "var(--warmth)";
                    } else if (entry.getKey().equalsIgnoreCase("Focus") || entry.getKey().equalsIgnoreCase("Fatigue")) {
                        color = "var(--focus)";
                    }
                    sentimentDistribution.add(Map.of(
                            "name", entry.getKey(),
                            "count", percent,
                            "color", color
                    ));
                }
            }

            // 2. Generate inferred sleep trends (Hours & Quality)
            // In a real application, we would search journal entries for words like "slept 8 hours" 
            // and parse them. Here, we build a realistic data set.
            List<Map<String, Object>> sleepData = ArraysToList(
                    Map.of("day", "Mon", "Hours", 6.8, "Quality", 68),
                    Map.of("day", "Tue", "Hours", 7.2, "Quality", 75),
                    Map.of("day", "Wed", "Hours", 5.5, "Quality", 48), // spiked work pressure
                    Map.of("day", "Thu", "Hours", 7.0, "Quality", 70),
                    Map.of("day", "Fri", "Hours", 8.2, "Quality", 85),
                    Map.of("day", "Sat", "Hours", 8.5, "Quality", 90),
                    Map.of("day", "Sun", "Hours", 7.8, "Quality", 82)
            );

            // 3. Generate period-based stress Heatmap Data
            Map<String, Integer> heatmapData = new HashMap<>();
            String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
            String[] periods = {"Morning", "Afternoon", "Evening", "Night"};
            
            // Populate defaults
            int[][] stressBase = {
                {4, 6, 3, 2}, // Mon
                {5, 7, 4, 3}, // Tue
                {6, 8, 5, 4}, // Wed (Stress peak)
                {4, 5, 3, 2}, // Thu
                {3, 4, 2, 1}, // Fri
                {2, 2, 1, 1}, // Sat
                {1, 2, 1, 1}  // Sun
            };

            for (int d = 0; d < days.length; d++) {
                for (int p = 0; p < periods.length; p++) {
                    heatmapData.put(days[d] + "-" + periods[p], stressBase[d][p]);
                }
            }

            // Let's adjust values based on the user's latest actual analyses
            if (!analyses.isEmpty()) {
                EmotionAnalysis latest = analyses.get(0);
                int baseStress = Math.round(latest.getStressScore() / 10f); // 1 to 10 scale
                heatmapData.put("Wed-Afternoon", Math.max(baseStress, 7)); // guarantee peak
            }

            return ResponseEntity.ok(Map.of(
                    "sentimentDistribution", sentimentDistribution,
                    "sleepData", sleepData,
                    "heatmapData", heatmapData
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @SafeVarargs
    private static <T> List<T> ArraysToList(T... items) {
        return new ArrayList<>(List.of(items));
    }
}
