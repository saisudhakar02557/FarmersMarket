package com.cs5600.repository;

import com.cs5600.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByCategoryId(String categoryId);
    List<com.cs5600.model.Product> findByNameContainingIgnoreCase(String name);

}
