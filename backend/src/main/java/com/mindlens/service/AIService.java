package com.mindlens.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
public class AIService {

    @Value("${openai.apiKey}")
    private String apiKey;

    @Value("${openai.model}")
    private String model;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    /**
     * Analyzes incoming emotional journals using OpenAI API.
     * Returns structured text data matching our emotion schemas.
     */
    public String analyzeJournalSentiment(String title, String content) {
        if (apiKey == null || apiKey.isBlank()) {
            // Empathetic mock response fallback if API key is not supplied
            return "{\"stressScore\": 25, \"energyScore\": 72, \"confidenceScore\": 68, \"focusScore\": 75, \"motivationScore\": 80, \"emotions\": [{\"name\": \"Serenity\", \"intensity\": 0.85, \"color\": \"var(--calm)\"}], \"themes\": [\"Reflection\"], \"insight\": \"You are displaying strong mental indicators of calm alignment today.\"}";
        }

        try {
            String systemPrompt = "You are an expert mental wellness analysis companion. Analyze this journal entry for stressScore, energyScore, confidenceScore, focusScore, motivationScore (1-100), key emotions list with intensities (0.0 to 1.0), theme hashtags, and a brief warm advisory tip. Do NOT diagnose clinical disorders. Output strict JSON only.";
            String userPrompt = "Title: " + title + "\nContent: " + content;

            String requestBody = "{"
                    + "\"model\": \"" + model + "\","
                    + "\"messages\": ["
                    + "  {\"role\": \"system\", \"content\": \"" + systemPrompt.replace("\"", "\\\"") + "\"},"
                    + "  {\"role\": \"user\", \"content\": \"" + userPrompt.replace("\"", "\\\"").replace("\n", "\\n") + "\"}"
                    + "],"
                    + "\"response_format\": {\"type\": \"json_object\"}"
                    + "}";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return response.body();
            } else {
                return "{\"error\": \"Failed connection with status: " + response.statusCode() + "\"}";
            }

        } catch (Exception e) {
            return "{\"error\": \"OpenAI analysis exception: " + e.getMessage() + "\"}";
        }
    }
}
