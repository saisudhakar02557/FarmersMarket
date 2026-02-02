package com.cs5600.service;

import com.cs5600.model.Order;
import com.cs5600.model.Review;
import com.cs5600.repository.OrderRepository;
import com.cs5600.repository.ReviewRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final OrderRepository orderRepo;

    public ReviewService(ReviewRepository reviewRepo, OrderRepository orderRepo) {
        this.reviewRepo = reviewRepo;
        this.orderRepo = orderRepo;
    }

    public Review addReview(String productId, String farmerId, int rating, String comments) {

        if (rating < 1 || rating > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        // Only one review per farmer+product
        reviewRepo.findByFarmerIdAndProductId(farmerId, productId).ifPresent(r -> {
            throw new RuntimeException("You already reviewed this product");
        });

        // Must have RECEIVED order that contains this product
        List<Order> receivedOrders = orderRepo.findByFarmerIdAndStatus(farmerId, "RECEIVED");

        boolean boughtAndReceived = receivedOrders.stream()
                .anyMatch(o -> o.getItems().stream().anyMatch(i -> productId.equals(i.getProductId())));

        if (!boughtAndReceived) {
            throw new RuntimeException("You can review only after receiving an order containing this product");
        }

        Review r = new Review();
        r.setProductId(productId);
        r.setFarmerId(farmerId);
        r.setRating(rating);
        r.setComments(comments);
        r.setReviewDate(Instant.now().toString());

        return reviewRepo.save(r);
    }
}
