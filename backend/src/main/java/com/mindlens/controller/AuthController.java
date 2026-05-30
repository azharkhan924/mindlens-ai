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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
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
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            if ("Email already in use".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid email or password"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
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
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody com.mindlens.dto.ProfileUpdateRequest request) {
        try {
            User user = authService.updateProfile(request);
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
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
