package com.mindlens.repository;

import com.mindlens.model.JournalEntry;
import com.mindlens.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {
    List<JournalEntry> findByUserOrderByCreatedAtDesc(User user);
    List<JournalEntry> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
