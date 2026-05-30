package com.mindlens.controller;

import com.mindlens.dto.JournalRequest;
import com.mindlens.model.JournalEntry;
import com.mindlens.service.JournalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/journals")
public class JournalController {

    @Autowired
    private JournalService journalService;

    @PostMapping
    public ResponseEntity<JournalEntry> createEntry(@Valid @RequestBody JournalRequest request) {
        return ResponseEntity.ok(journalService.createEntry(request.getTitle(), request.getContent()));
    }

    @GetMapping
    public ResponseEntity<List<JournalEntry>> getAllEntries() {
        return ResponseEntity.ok(journalService.getAllEntries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JournalEntry> getEntryById(@PathVariable("id") UUID id) {
        try {
            return ResponseEntity.ok(journalService.getEntryById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable("id") UUID id) {
        try {
            journalService.deleteEntry(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
