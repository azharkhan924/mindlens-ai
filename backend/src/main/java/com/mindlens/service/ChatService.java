package com.mindlens.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindlens.model.ChatConversation;
import com.mindlens.model.ChatMessage;
import com.mindlens.model.User;
import com.mindlens.repository.ChatConversationRepository;
import com.mindlens.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ChatService {

    @Autowired
    private ChatConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private AIService aiService;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    public List<ChatConversation> getConversations() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return conversationRepository.findByUserOrderByCreatedAtDesc(currentUser);
    }

    @Transactional
    public ChatConversation createConversation(String title) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        ChatConversation conversation = ChatConversation.builder()
                .user(currentUser)
                .title(title == null || title.isBlank() ? "New Session" : title)
                .build();
        return conversationRepository.save(conversation);
    }

    public List<ChatMessage> getConversationMessages(UUID conversationId) {
        // Authenticate conversation access
        ChatConversation conversation = getConversationWithAuth(conversationId);
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversation.getId());
    }

    @Transactional
    public ChatMessage sendMessage(UUID conversationId, String content) {
        ChatConversation conversation = getConversationWithAuth(conversationId);

        // Save user message
        ChatMessage userMessage = ChatMessage.builder()
                .conversation(conversation)
                .role("user")
                .content(content)
                .build();
        messageRepository.save(userMessage);

        // Fetch previous message history (e.g. last 10 messages)
        List<ChatMessage> history = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<Map<String, String>> historyList = new ArrayList<>();
        
        // Take last 10 messages
        int start = Math.max(0, history.size() - 10);
        for (int i = start; i < history.size(); i++) {
            ChatMessage msg = history.get(i);
            Map<String, String> entry = new HashMap<>();
            entry.put("role", msg.getRole());
            entry.put("content", msg.getContent());
            historyList.add(entry);
        }

        String historyJson = "[]";
        try {
            historyJson = objectMapper.writeValueAsString(historyList);
        } catch (Exception e) {
            // ignore
        }

        // Generate companion response
        String aiResponseJson = aiService.generateCompanionResponse(historyJson, content);
        
        String aiContent = "I'm listening. Please continue.";
        String detectedEmotion = "Empathy";

        try {
            JsonNode root = objectMapper.readTree(aiResponseJson);
            if (root.has("content")) {
                aiContent = root.get("content").asText();
            }
            if (root.has("detectedEmotion")) {
                detectedEmotion = root.get("detectedEmotion").asText();
            }
        } catch (Exception e) {
            // ignore and use default values
        }

        // Save AI response message
        ChatMessage assistantMessage = ChatMessage.builder()
                .conversation(conversation)
                .role("assistant")
                .content(aiContent)
                .detectedEmotion(detectedEmotion)
                .build();
        
        return messageRepository.save(assistantMessage);
    }

    private ChatConversation getConversationWithAuth(UUID conversationId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        if (!conversation.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access to chat conversation");
        }
        return conversation;
    }
}
