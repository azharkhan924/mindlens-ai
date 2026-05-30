package com.mindlens.controller;

import com.mindlens.service.EmergencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/emergency")
public class EmergencyController {

    @Autowired
    private EmergencyService emergencyService;

    @PostMapping("/detect")
    public ResponseEntity<?> detectDistress(@RequestBody Map<String, String> body) {
        String text = body != null ? body.get("text") : "";
        boolean isCrisis = emergencyService.detectSevereDistress(text);
        return ResponseEntity.ok(Map.of("distressDetected", isCrisis));
    }

    @GetMapping("/contacts")
    public ResponseEntity<?> getEmergencyContacts() {
        // Return default crisis resources and any user-configured emergency contacts
        List<Map<String, String>> resources = Arrays.asList(
                Map.of("name", "988 Suicide & Crisis Lifeline", "number", "988", "type", "Call / Text (24/7)"),
                Map.of("name", "Crisis Text Line", "number", "Text HOME to 741741", "type", "SMS Text (24/7)"),
                Map.of("name", "The Trevor Project (LGBTQ+)", "number", "1-866-488-7386", "type", "Call / Text (24/7)"),
                Map.of("name", "National Domestic Violence Hotline", "number", "1-800-799-7233", "type", "Call (24/7)")
        );
        return ResponseEntity.ok(resources);
    }
}
