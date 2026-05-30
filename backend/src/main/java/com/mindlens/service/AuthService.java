package com.mindlens.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindlens.dto.AuthRequest;
import com.mindlens.dto.AuthResponse;
import com.mindlens.dto.ProfileUpdateRequest;
import com.mindlens.dto.RegisterRequest;
import com.mindlens.model.User;
import com.mindlens.repository.UserRepository;
import com.mindlens.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }

        String goalsJson = "";
        try {
            if (request.getWellnessGoals() != null) {
                goalsJson = objectMapper.writeValueAsString(request.getWellnessGoals());
            }
        } catch (Exception e) {
            goalsJson = "[]";
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .ageRange(request.getAgeRange())
                .wellnessGoalsJson(goalsJson)
                .build();

        User savedUser = userRepository.save(user);

        // Authenticate user after registering
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .name(savedUser.getName())
                .ageRange(savedUser.getAgeRange())
                .wellnessGoals(request.getWellnessGoals())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> goals = Collections.emptyList();
        try {
            if (user.getWellnessGoalsJson() != null && !user.getWellnessGoalsJson().isBlank()) {
                goals = objectMapper.readValue(user.getWellnessGoalsJson(), new TypeReference<List<String>>() {});
            }
        } catch (Exception e) {
            // fallback
        }

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .ageRange(user.getAgeRange())
                .wellnessGoals(goals)
                .build();
    }

    public User updateProfile(ProfileUpdateRequest request) {
        User user = getCurrentAuthenticatedUser();
        user.setName(request.getName());
        user.setAgeRange(request.getAgeRange());

        String goalsJson = "";
        try {
            if (request.getWellnessGoals() != null) {
                goalsJson = objectMapper.writeValueAsString(request.getWellnessGoals());
            }
        } catch (Exception e) {
            goalsJson = "[]";
        }
        user.setWellnessGoalsJson(goalsJson);

        return userRepository.save(user);
    }

    public User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("No user currently authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
