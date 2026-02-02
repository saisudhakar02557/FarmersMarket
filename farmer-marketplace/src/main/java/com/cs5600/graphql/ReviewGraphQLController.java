package com.cs5600.graphql;

import com.cs5600.model.Review;
import com.cs5600.repository.ReviewRepository;
import com.cs5600.service.ReviewService;
import org.springframework.graphql.data.method.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class ReviewGraphQLController {

    private final ReviewService service;
    private final ReviewRepository repo;

    public ReviewGraphQLController(ReviewService service, ReviewRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @MutationMapping
    public Review addReview(@Argument("input") Map<String, Object> input) {
        String productId = (String) input.get("productId");
        String farmerId = (String) input.get("farmerId");
        int rating = ((Number) input.get("rating")).intValue();
        String comments = (String) input.get("comments");

        return service.addReview(productId, farmerId, rating, comments);
    }

    @QueryMapping
    public List<Review> reviewsByProduct(@Argument String productId) {
        return repo.findByProductId(productId);
    }

    @QueryMapping
    public List<Review> reviewsByFarmer(@Argument String farmerId) {
        return repo.findByFarmerId(farmerId);
    }

    @QueryMapping
    public Review reviewByFarmerAndProduct(@Argument String farmerId, @Argument String productId) {
        return repo.findByFarmerIdAndProductId(farmerId, productId).orElse(null);
    }
}
