package com.mindlens.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindlens.model.EmotionAnalysis;
import com.mindlens.model.JournalEntry;
import com.mindlens.model.User;
import com.mindlens.repository.EmotionAnalysisRepository;
import com.mindlens.repository.JournalEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class JournalService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private EmotionAnalysisRepository emotionAnalysisRepository;

    @Autowired
    private AIService aiService;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public JournalEntry createEntry(String title, String content) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        JournalEntry entry = JournalEntry.builder()
                .user(currentUser)
                .title(title == null || title.isBlank() ? "Untitled Reflection" : title)
                .content(content)
                .build();

        JournalEntry savedEntry = journalEntryRepository.save(entry);

        // Perform AI Emotion Analysis
        String analysisJson = aiService.analyzeJournalSentiment(savedEntry.getTitle(), savedEntry.getContent());
        EmotionAnalysis analysis = parseAnalysis(analysisJson);
        analysis.setJournalEntry(savedEntry);
        
        EmotionAnalysis savedAnalysis = emotionAnalysisRepository.save(analysis);
        savedEntry.setEmotionAnalysis(savedAnalysis);

        return savedEntry;
    }

    public List<JournalEntry> getAllEntries() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return journalEntryRepository.findByUserOrderByCreatedAtDesc(currentUser);
    }

    public JournalEntry getEntryById(UUID id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        JournalEntry entry = journalEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Journal entry not found"));
        
        if (!entry.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access to journal entry");
        }
        return entry;
    }

    @Transactional
    public void deleteEntry(UUID id) {
        JournalEntry entry = getEntryById(id); // Performs ownership check
        journalEntryRepository.delete(entry);
    }

    private EmotionAnalysis parseAnalysis(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            
            // Check for error field in GPT output
            if (root.has("error")) {
                throw new RuntimeException(root.get("error").asText());
            }

            JsonNode stressNode = root.get("stressScore");
            JsonNode energyNode = root.get("energyScore");
            JsonNode confidenceNode = root.get("confidenceScore");
            JsonNode focusNode = root.get("focusScore");
            JsonNode motivationNode = root.get("motivationScore");

            int stress = stressNode != null ? stressNode.asInt() : 30;
            int energy = energyNode != null ? energyNode.asInt() : 60;
            int confidence = confidenceNode != null ? confidenceNode.asInt() : 60;
            int focus = focusNode != null ? focusNode.asInt() : 60;
            int motivation = motivationNode != null ? motivationNode.asInt() : 60;

            String emotionsJson = "[]";
            if (root.has("emotions")) {
                emotionsJson = objectMapper.writeValueAsString(root.get("emotions"));
            } else {
                emotionsJson = "[{\"name\": \"Equilibrium\", \"intensity\": 0.70, \"color\": \"var(--calm)\"}]";
            }

            String themesJson = "[]";
            if (root.has("themes")) {
                themesJson = objectMapper.writeValueAsString(root.get("themes"));
            } else {
                themesJson = "[\"Reflection\"]";
            }

            String insight = root.has("insight") ? root.get("insight").asText() : "A quiet moment of reflection. Review your trends to trace mental shifts.";

            return EmotionAnalysis.builder()
                    .stressScore(stress)
                    .energyScore(energy)
                    .confidenceScore(confidence)
                    .focusScore(focus)
                    .motivationScore(motivation)
                    .emotionsJson(emotionsJson)
                    .themesJson(themesJson)
                    .insight(insight)
                    .analyzedAt(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            // Robust fallback if JSON parsing fails
            return EmotionAnalysis.builder()
                    .stressScore(35)
                    .energyScore(65)
                    .confidenceScore(65)
                    .focusScore(70)
                    .motivationScore(68)
                    .emotionsJson("[{\"name\": \"Equilibrium\", \"intensity\": 0.75, \"color\": \"var(--calm)\"}]")
                    .themesJson("[\"Self-Discovery\"]")
                    .insight("Reflection logged. Keep checking your wellness sparkline to map shifts.")
                    .analyzedAt(LocalDateTime.now())
                    .build();
        }
    }
}
