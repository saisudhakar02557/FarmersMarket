package com.cs5600.graphql;

import com.cs5600.model.Cart;
import com.cs5600.model.Order;
import com.cs5600.service.CartService;
import org.springframework.graphql.data.method.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class CartGraphQLController {

    private final CartService cartService;

    public CartGraphQLController(CartService cartService) {
        this.cartService = cartService;
    }

    @QueryMapping
    public Cart cartByFarmer(@Argument String farmerId) {
    	
    	if (farmerId == null || farmerId.isBlank()) {
            throw new IllegalArgumentException("farmerId is required");
        }
    	
        return cartService.cartByFarmer(farmerId);
    }

    // ✅ Mutation: addToCart(input: AddToCartInput!): Cart!
    @MutationMapping
    public Cart addToCart(@Argument("input") java.util.Map<String, Object> input) {
        if (input == null) throw new IllegalArgumentException("input is required");

        String farmerId = (String) input.get("farmerId");
        String productId = (String) input.get("productId");
        Integer quantity = (Integer) input.get("quantity");

        if (farmerId == null || farmerId.isBlank()) throw new IllegalArgumentException("farmerId is required");
        if (productId == null || productId.isBlank()) throw new IllegalArgumentException("productId is required");
        if (quantity == null || quantity <= 0) throw new IllegalArgumentException("quantity must be > 0");

        return cartService.addToCart(farmerId, productId, quantity);
    }
    
    
 // ✅ Mutation: updateCartItem(farmerId, productId, quantity): Cart!
    @MutationMapping
    public Cart updateCartItem(
            @Argument String farmerId,
            @Argument String productId,
            @Argument Integer quantity
    ) {
        if (farmerId == null || farmerId.isBlank()) throw new IllegalArgumentException("farmerId is required");
        if (productId == null || productId.isBlank()) throw new IllegalArgumentException("productId is required");
        if (quantity == null || quantity <= 0) throw new IllegalArgumentException("quantity must be > 0");

        return cartService.updateCartItem(farmerId, productId, quantity);
    }
    
    

    @MutationMapping
    public Cart removeFromCart(@Argument String farmerId, @Argument String productId) {
        if (farmerId == null || farmerId.isBlank()) throw new IllegalArgumentException("farmerId is required");
        if (productId == null || productId.isBlank()) throw new IllegalArgumentException("productId is required");

        return cartService.removeFromCart(farmerId, productId);
    }

    // ✅ Mutation: clearCart(farmerId): Cart!
    @MutationMapping
    public Cart clearCart(@Argument String farmerId) {
        if (farmerId == null || farmerId.isBlank()) throw new IllegalArgumentException("farmerId is required");

        return cartService.clearCart(farmerId);
    }

    
    @MutationMapping
    public Order checkoutFromCart(@Argument("input") Map<String, Object> input) {
        if (input == null) {
            throw new IllegalArgumentException("input is required");
        }

        String farmerId = (String) input.get("farmerId");
        String managerId = (String) input.get("managerId");
        String cardType = (String) input.get("cardType");
        String cardNumber = (String) input.get("cardNumber");
        String cvv = (String) input.get("cvv");

        if (farmerId == null || farmerId.isBlank()) throw new IllegalArgumentException("farmerId is required");
        if (managerId == null || managerId.isBlank()) throw new IllegalArgumentException("managerId is required");
        if (cardType == null || cardType.isBlank()) throw new IllegalArgumentException("cardType is required");
        if (cardNumber == null || cardNumber.isBlank()) throw new IllegalArgumentException("cardNumber is required");
        if (cvv == null || cvv.isBlank()) throw new IllegalArgumentException("cvv is required");

        return cartService.checkoutFromCart(farmerId, managerId, cardType, cardNumber, cvv);
    }
    

}
