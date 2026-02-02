package com.cs5600.repository;

import com.cs5600.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(String productId);
    List<Review> findByFarmerId(String farmerId);
    Optional<Review> findByFarmerIdAndProductId(String farmerId, String productId);
}
