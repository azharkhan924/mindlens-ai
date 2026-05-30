package com.mindlens.controller;

import com.mindlens.model.WellnessPrediction;
import com.mindlens.model.WellnessScore;
import com.mindlens.service.WellnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/wellness")
public class WellnessController {

    @Autowired
    private WellnessService wellnessService;

    @GetMapping("/score")
    public ResponseEntity<WellnessScore> getScore() {
        return ResponseEntity.ok(wellnessService.calculateAndSaveCurrentScore());
    }

    @GetMapping("/predictions")
    public ResponseEntity<List<WellnessPrediction>> getPredictions() {
        return ResponseEntity.ok(wellnessService.generateAndGetPredictions());
    }

    @GetMapping("/timeline")
    public ResponseEntity<List<WellnessScore>> getTimeline() {
        return ResponseEntity.ok(wellnessService.getHistoricalScores());
    }
}
