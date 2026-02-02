package com.cs5600.service;

import com.cs5600.model.Inventory;
import com.cs5600.repository.InventoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InventoryService {

    private final InventoryRepository repo;

    public InventoryService(InventoryRepository repo) {
        this.repo = repo;
    }

    public Inventory addInventory(Inventory inv) {
        inv.touch();
        return repo.save(inv);
    }

    public Inventory updateInventory(String inventoryId, int quantity, double price) {
        Inventory existing = repo.findById(inventoryId)
                .orElseThrow(() -> new RuntimeException("Inventory not found"));

        existing.setQuantity(quantity);
        existing.setPrice(price);
        existing.touch();

        return repo.save(existing);
    }

    public List<Inventory> all() {
        return repo.findAll();
    }

    public List<Inventory> byManager(String managerId) {
        return repo.findByManagerId(managerId);
    }

    public List<Inventory> byProduct(String productId) {
        return repo.findByProductId(productId);
    }
}
