package com.mindlens.repository;

import com.mindlens.model.User;
import com.mindlens.model.UserMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface UserMemoryRepository extends JpaRepository<UserMemory, UUID> {
    List<UserMemory> findByUserOrderByCreatedAtDesc(User user);
    List<UserMemory> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<UserMemory> findByUserAndMemoryTypeOrderByCreatedAtDesc(User user, String memoryType);
}
