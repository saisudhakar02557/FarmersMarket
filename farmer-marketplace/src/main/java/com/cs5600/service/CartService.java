package com.cs5600.service;

import com.cs5600.model.Cart;
import com.cs5600.model.Inventory;
import com.cs5600.model.Order;
import com.cs5600.repository.CartRepository;
import com.cs5600.repository.InventoryRepository;
import com.cs5600.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepo;
    private final InventoryRepository inventoryRepo;
    private final InventoryAtomicService inventoryAtomic;
    private final OrderRepository orderRepo;
    private final PaymentService paymentService;

    public CartService(CartRepository cartRepo,
                       InventoryRepository inventoryRepo,
                       InventoryAtomicService inventoryAtomic,
                       OrderRepository orderRepo,
                       PaymentService paymentService) {
        this.cartRepo = cartRepo;
        this.inventoryRepo = inventoryRepo;
        this.inventoryAtomic = inventoryAtomic;
        this.orderRepo = orderRepo;
        this.paymentService = paymentService;
    }

    // ---------------------------
    // Helpers
    // ---------------------------

    private Cart getOrCreateCart(String farmerId) {
        return cartRepo.findByFarmerId(farmerId).orElseGet(() -> {
            Cart c = new Cart();
            c.setFarmerId(farmerId);
            c.touch();
            return cartRepo.save(c);
        });
    }

    public Cart cartByFarmer(String farmerId) {
        return cartRepo.findByFarmerId(farmerId)
                .map(cart -> {
                    if (cart.getUpdatedAt() == null || cart.getUpdatedAt().isBlank()) {
                        cart.touch();
                        return cartRepo.save(cart);
                    }
                    return cart;
                })
                .orElse(null);
    }

    // ---------------------------
    // Cart operations
    // ---------------------------

    public Cart addToCart(String farmerId, String productId, int quantity) {
        if (farmerId == null || farmerId.isBlank()) throw new RuntimeException("farmerId is required");
        if (productId == null || productId.isBlank()) throw new RuntimeException("productId is required");
        if (quantity <= 0) throw new RuntimeException("Quantity must be > 0");

        Cart cart = getOrCreateCart(farmerId);

        // If item already exists -> increase quantity
        for (Cart.CartItem item : cart.getItems()) {
            if (productId.equals(item.getProductId())) {
                item.setQuantity(item.getQuantity() + quantity);
                cart.touch();
                return cartRepo.save(cart);
            }
        }

        // else add new
        Cart.CartItem ci = new Cart.CartItem();
        ci.setProductId(productId);
        ci.setQuantity(quantity);
        cart.getItems().add(ci);

        cart.touch();
        return cartRepo.save(cart);
    }

    public Cart updateCartItem(String farmerId, String productId, int quantity) {
        if (farmerId == null || farmerId.isBlank()) throw new RuntimeException("farmerId is required");
        if (productId == null || productId.isBlank()) throw new RuntimeException("productId is required");
        if (quantity <= 0) throw new RuntimeException("Quantity must be > 0");

        Cart cart = getOrCreateCart(farmerId);

        boolean found = false;
        for (Cart.CartItem item : cart.getItems()) {
            if (productId.equals(item.getProductId())) {
                item.setQuantity(quantity);
                found = true;
                break;
            }
        }
        if (!found) throw new RuntimeException("Item not found in cart");

        cart.touch();
        return cartRepo.save(cart);
    }

    public Cart removeFromCart(String farmerId, String productId) {
        if (farmerId == null || farmerId.isBlank()) throw new RuntimeException("farmerId is required");
        if (productId == null || productId.isBlank()) throw new RuntimeException("productId is required");

        Cart cart = getOrCreateCart(farmerId);
        cart.getItems().removeIf(i -> productId.equals(i.getProductId()));
        cart.touch();
        return cartRepo.save(cart);
    }

    public Cart clearCart(String farmerId) {
        if (farmerId == null || farmerId.isBlank()) throw new RuntimeException("farmerId is required");

        Cart cart = getOrCreateCart(farmerId);
        cart.getItems().clear();
        cart.touch();
        return cartRepo.save(cart);
    }

    // ---------------------------
    // Checkout (Cart -> Order + Payment)
    // ---------------------------
    // ✅ Atomic stock reservation (prevents oversell)
    // ✅ Transaction rollback on failure
    // ✅ Compensation: restore reserved stock if payment fails
    @Transactional
    public Order checkoutFromCart(String farmerId,
                                  String managerId,
                                  String cardType,
                                  String cardNumber,
                                  String cvv) {

        if (farmerId == null || farmerId.isBlank()) throw new RuntimeException("farmerId is required");
        if (managerId == null || managerId.isBlank()) throw new RuntimeException("managerId is required");

        Cart cart = cartRepo.findByFarmerId(farmerId)
                .orElseThrow(() -> new RuntimeException("Cart is empty"));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Keep track of what we reserved so we can restore on failure
        List<Cart.CartItem> reserved = new ArrayList<>();

        try {
            List<Order.OrderItem> orderItems = new ArrayList<>();
            double total = 0.0;

            for (Cart.CartItem ci : cart.getItems()) {
                String productId = ci.getProductId();
                int qty = ci.getQuantity();

                if (qty <= 0) throw new RuntimeException("Invalid cart quantity for productId: " + productId);

                // Get inventory (price source)
                Inventory inv = inventoryRepo.findByManagerIdAndProductId(managerId, productId)
                        .orElseThrow(() -> new RuntimeException("Product not available with this manager"));

                // 🔥 Reserve stock atomically (prevents two farmers taking same stock)
                inventoryAtomic.reserveStock(managerId, productId, qty);
                reserved.add(ci);

                // Create order item using inventory price
                Order.OrderItem oi = new Order.OrderItem();
                oi.setProductId(productId);
                oi.setQuantity(qty);
                oi.setPrice(inv.getPrice());
                orderItems.add(oi);

                total += inv.getPrice() * qty;
            }

            // Create order
            Order order = new Order();
            order.setFarmerId(farmerId);
            order.setManagerId(managerId);
            order.setItems(orderItems);
            order.initDefaults();
            order.setTotalAmount(total);

            Order savedOrder = orderRepo.save(order);

            // Payment
            paymentService.makePayment(
                    savedOrder.getId(),
                    farmerId,
                    cardType,
                    cardNumber,
                    cvv,
                    total
            );

            // Clear cart only after payment success
            cart.getItems().clear();
            cart.touch();
            cartRepo.save(cart);

            return savedOrder;

        } catch (Exception e) {

            // Compensation: restore reserved stock if anything fails
            for (Cart.CartItem ci : reserved) {
                inventoryAtomic.releaseStock(managerId, ci.getProductId(), ci.getQuantity());
            }

            // Throw to force transaction rollback (order/cart/payment writes rollback)
            throw new RuntimeException("Checkout failed: " + e.getMessage());
        }
    }
}
