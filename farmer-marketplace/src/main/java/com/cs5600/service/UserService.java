package com.cs5600.service;

import com.cs5600.model.User;
import com.cs5600.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public User register(User user) {
        repo.findByEmail(user.getEmail()).ifPresent(u -> {
            throw new RuntimeException("Email already exists");
        });

        if ("MANAGER".equalsIgnoreCase(user.getRole())) {
            user.setStatus("PENDING");
        } else {
            user.setStatus("APPROVED");
        }

        return repo.save(user);
    }

    public User approveManager(String managerId) {
        User manager = repo.findById(managerId)
                .orElseThrow(() -> new RuntimeException("Manager not found"));

        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            throw new RuntimeException("User is not a manager");
        }

        manager.setStatus("APPROVED");
        return repo.save(manager);
    }

    public List<User> users() {
        return repo.findAll();
    }

    public List<User> usersByRole(String role) {
        return repo.findByRole(role.toUpperCase());
    }
}
