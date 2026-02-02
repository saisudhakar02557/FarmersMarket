package com.cs5600.service;

import com.cs5600.model.Inventory;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class InventoryAtomicService {

    private final MongoTemplate mongoTemplate;

    public InventoryAtomicService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    // Atomically decrement quantity if enough stock exists.
    public Inventory reserveStock(String managerId, String productId, int qty) {
        Query q = new Query();
        q.addCriteria(Criteria.where("managerId").is(managerId)
                .and("productId").is(productId)
                .and("quantity").gte(qty));

        Update u = new Update()
                .inc("quantity", -qty)
                .set("lastUpdated", Instant.now().toString());

        FindAndModifyOptions opts = FindAndModifyOptions.options().returnNew(true);

        Inventory updated = mongoTemplate.findAndModify(q, u, opts, Inventory.class);
        if (updated == null) {
            throw new RuntimeException("Insufficient stock or product not available with this manager");
        }
        return updated;
    }

    // Compensation: add stock back (used if payment fails)
    public void releaseStock(String managerId, String productId, int qty) {
        Query q = new Query(Criteria.where("managerId").is(managerId).and("productId").is(productId));
        Update u = new Update()
                .inc("quantity", qty)
                .set("lastUpdated", Instant.now().toString());
        mongoTemplate.updateFirst(q, u, Inventory.class);
    }
}
