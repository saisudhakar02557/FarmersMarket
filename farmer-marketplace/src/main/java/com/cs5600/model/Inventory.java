package com.cs5600.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "inventories")
public class Inventory {

    @Id
    private String id;

    private String managerId;
    private String productId;

    private int quantity;
    private double price;

    private String lastUpdated; // store as ISO string for easy GraphQL

    public Inventory() {}

    public String getId() { return id; }

    public String getManagerId() { return managerId; }
    public void setManagerId(String managerId) { this.managerId = managerId; }

    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }

    public void touch() {
        this.lastUpdated = Instant.now().toString();
    }
}
