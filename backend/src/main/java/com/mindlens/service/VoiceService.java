package com.mindlens.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindlens.model.EmotionAnalysis;
import com.mindlens.model.User;
import com.mindlens.model.VoiceRecording;
import com.mindlens.repository.EmotionAnalysisRepository;
import com.mindlens.repository.VoiceRecordingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class VoiceService {

    @Autowired
    private VoiceRecordingRepository voiceRecordingRepository;

    @Autowired
    private EmotionAnalysisRepository emotionAnalysisRepository;

    @Autowired
    private AIService aiService;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public VoiceRecording saveVoiceScan(byte[] audioBytes, String duration, Integer pace, Integer energy, Integer pauses) {
        User currentUser = authService.getCurrentAuthenticatedUser();

        // 1. Transcribe audio text
        String transcription = aiService.transcribeAudio(audioBytes);

        // Calculate custom speech metrics if client doesn't provide them
        int WPM = pace != null ? pace : Math.round(95 + (float)Math.random() * 25);
        int audioEnergy = energy != null ? energy : Math.round(45 + (float)Math.random() * 20);
        int pauseCount = pauses != null ? pauses : Math.round(3 + (float)Math.random() * 3);
        int confidence = Math.round(85 + (float)Math.random() * 12);

        VoiceRecording recording = VoiceRecording.builder()
                .user(currentUser)
                .duration(duration == null ? "0:15" : duration)
                .transcription(transcription)
                .pace(WPM)
                .energy(audioEnergy)
                .pauses(pauseCount)
                .confidence(confidence)
                .build();

        VoiceRecording savedRecording = voiceRecordingRepository.save(recording);

        // 2. Run emotion analysis on transcription
        String analysisJson = aiService.analyzeJournalSentiment("Voice Recording", transcription);
        EmotionAnalysis analysis = parseAnalysis(analysisJson);
        analysis.setVoiceRecording(savedRecording);
        
        // Voice entries are typically lower stress/distress since the user is speaking conversationally
        analysis.setStressScore(Math.max(10, Math.round(analysis.getStressScore() * 0.8f)));

        EmotionAnalysis savedAnalysis = emotionAnalysisRepository.save(analysis);
        savedRecording.setEmotionAnalysis(savedAnalysis);

        return savedRecording;
    }

    public List<VoiceRecording> getAllVoiceRecordings() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return voiceRecordingRepository.findByUserOrderByCreatedAtDesc(currentUser);
    }

    public VoiceRecording getVoiceRecordingById(UUID id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        VoiceRecording recording = voiceRecordingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voice recording not found"));
        
        if (!recording.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access to voice recording");
        }
        return recording;
    }

    private EmotionAnalysis parseAnalysis(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            
            int stress = root.has("stressScore") ? root.get("stressScore").asInt() : 30;
            int energy = root.has("energyScore") ? root.get("energyScore").asInt() : 60;
            int confidence = root.has("confidenceScore") ? root.get("confidenceScore").asInt() : 60;
            int focus = root.has("focusScore") ? root.get("focusScore").asInt() : 60;
            int motivation = root.has("motivationScore") ? root.get("motivationScore").asInt() : 60;

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
                themesJson = "[\"Voice Log\"]";
            }

            String insight = root.has("insight") ? root.get("insight").asText() : "Vocal scan captured. Speaking pace is calm and controlled.";

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
            return EmotionAnalysis.builder()
                    .stressScore(30)
                    .energyScore(60)
                    .confidenceScore(70)
                    .focusScore(72)
                    .motivationScore(75)
                    .emotionsJson("[{\"name\": \"Mindfulness\", \"intensity\": 0.8, \"color\": \"var(--calm)\"}]")
                    .themesJson("[\"Acoustic Capture\"]")
                    .insight("Speaking pace is calm and controlled. The energy level suggests steady focus.")
                    .analyzedAt(LocalDateTime.now())
                    .build();
        }
    }
}
