package com.mindlens.controller;

import com.mindlens.dto.ChatRequest;
import com.mindlens.model.ChatConversation;
import com.mindlens.model.ChatMessage;
import com.mindlens.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversation>> getConversations() {
        return ResponseEntity.ok(chatService.getConversations());
    }

    @PostMapping("/conversations")
    public ResponseEntity<ChatConversation> createConversation(@RequestBody(required = false) Map<String, String> body) {
        String title = body != null ? body.get("title") : null;
        return ResponseEntity.ok(chatService.createConversation(title));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@PathVariable("id") UUID conversationId) {
        try {
            return ResponseEntity.ok(chatService.getConversationMessages(conversationId));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ChatMessage> sendMessage(
            @PathVariable("id") UUID conversationId,
            @Valid @RequestBody ChatRequest request) {
        try {
            return ResponseEntity.ok(chatService.sendMessage(conversationId, request.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
