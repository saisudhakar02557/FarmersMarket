package com.cs5600.repository;

import com.cs5600.model.Cart;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByFarmerId(String farmerId);
}
