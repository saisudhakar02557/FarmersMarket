package com.cs5600.graphql;

import com.cs5600.model.Inventory;
import com.cs5600.service.InventoryService;
import org.springframework.graphql.data.method.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class InventoryGraphQLController {

    private final InventoryService service;

    public InventoryGraphQLController(InventoryService service) {
        this.service = service;
    }

    @MutationMapping
    public Inventory addInventory(@Argument("input") Map<String, Object> input) {
        Inventory inv = new Inventory();
        inv.setManagerId((String) input.get("managerId"));
        inv.setProductId((String) input.get("productId"));
        inv.setQuantity((Integer) input.get("quantity"));
        inv.setPrice(((Number) input.get("price")).doubleValue());
        return service.addInventory(inv);
    }

    @MutationMapping
    public Inventory updateInventory(@Argument("input") Map<String, Object> input) {
        String inventoryId = (String) input.get("inventoryId");
        int quantity = (Integer) input.get("quantity");
        double price = ((Number) input.get("price")).doubleValue();
        return service.updateInventory(inventoryId, quantity, price);
    }

    @QueryMapping
    public List<Inventory> inventories() {
        return service.all();
    }

    @QueryMapping
    public List<Inventory> inventoriesByManager(@Argument String managerId) {
        return service.byManager(managerId);
    }

    @QueryMapping
    public List<Inventory> inventoriesByProduct(@Argument String productId) {
        return service.byProduct(productId);
    }
}
