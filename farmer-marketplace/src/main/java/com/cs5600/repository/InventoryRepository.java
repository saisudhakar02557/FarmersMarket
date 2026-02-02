package com.cs5600.repository;

import com.cs5600.model.Inventory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryRepository extends MongoRepository<Inventory, String> {
    List<Inventory> findByManagerId(String managerId);
    List<Inventory> findByProductId(String productId);
    Optional<Inventory> findByManagerIdAndProductId(String managerId, String productId);
}
