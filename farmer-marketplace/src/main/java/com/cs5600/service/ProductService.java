package com.cs5600.service;

import com.cs5600.model.Product;
import com.cs5600.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public Product create(Product p) {
        p.setStatus("AVAILABLE");
        return repo.save(p);
    }

    public List<Product> all() {
        return repo.findAll();
    }

    public List<Product> byCategory(String categoryId) {
        return repo.findByCategoryId(categoryId);
    }
}
