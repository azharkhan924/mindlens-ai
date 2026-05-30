package com.mindlens.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class EmergencyService {

    private static final List<String> CRISIS_KEYWORDS = Arrays.asList(
            "suicide", "kill myself", "end my life", "want to die", 
            "self harm", "cutting myself", "better off dead", 
            "hurt myself", "hopelessness despair"
    );

    public boolean detectSevereDistress(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }
        
        String cleanText = text.toLowerCase();
        return CRISIS_KEYWORDS.stream().anyMatch(cleanText::contains);
    }
}
