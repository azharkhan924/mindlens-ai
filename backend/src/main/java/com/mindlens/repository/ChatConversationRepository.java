package com.mindlens.repository;

import com.mindlens.model.ChatConversation;
import com.mindlens.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, UUID> {
    List<ChatConversation> findByUserOrderByCreatedAtDesc(User user);
    List<ChatConversation> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
