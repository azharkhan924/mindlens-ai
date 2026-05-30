package com.mindlens.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindlens.dto.AuthRequest;
import com.mindlens.dto.AuthResponse;
import com.mindlens.dto.RegisterRequest;
import com.mindlens.model.User;
import com.mindlens.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        try {
            User user = authService.getCurrentAuthenticatedUser();
            List<String> goals = Collections.emptyList();
            try {
                if (user.getWellnessGoalsJson() != null && !user.getWellnessGoalsJson().isBlank()) {
                    goals = objectMapper.readValue(user.getWellnessGoalsJson(), new TypeReference<List<String>>() {});
                }
            } catch (Exception e) {
                // ignore
            }
            
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getName(),
                    "ageRange", user.getAgeRange(),
                    "wellnessGoals", goals,
                    "createdAt", user.getCreatedAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}
