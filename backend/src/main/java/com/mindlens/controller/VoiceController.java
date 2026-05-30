package com.mindlens.controller;

import com.mindlens.model.VoiceRecording;
import com.mindlens.service.VoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/voice")
public class VoiceController {

    @Autowired
    private VoiceService voiceService;

    @PostMapping("/scan")
    public ResponseEntity<VoiceRecording> uploadVoice(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "duration", required = false) String duration,
            @RequestParam(value = "pace", required = false) Integer pace,
            @RequestParam(value = "energy", required = false) Integer energy,
            @RequestParam(value = "pauses", required = false) Integer pauses) {
        
        byte[] audioBytes = new byte[0];
        try {
            if (file != null) {
                audioBytes = file.getBytes();
            }
        } catch (Exception e) {
            // Log warning, fallback to mock bytes
        }
        
        VoiceRecording recording = voiceService.saveVoiceScan(audioBytes, duration, pace, energy, pauses);
        return ResponseEntity.ok(recording);
    }

    @GetMapping("/scans")
    public ResponseEntity<List<VoiceRecording>> getAllRecordings() {
        return ResponseEntity.ok(voiceService.getAllVoiceRecordings());
    }

    @GetMapping("/scans/{id}")
    public ResponseEntity<VoiceRecording> getRecordingById(@PathVariable("id") UUID id) {
        try {
            return ResponseEntity.ok(voiceService.getVoiceRecordingById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
