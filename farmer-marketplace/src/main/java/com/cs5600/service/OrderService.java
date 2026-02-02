package com.cs5600.service;

import com.cs5600.model.Order;
import com.cs5600.model.Product;
import com.cs5600.model.User;
import com.cs5600.repository.OrderRepository;
import com.cs5600.repository.ProductRepository;
import com.cs5600.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;

    public OrderService(OrderRepository orderRepo,
                        ProductRepository productRepo,
                        UserRepository userRepo) {
        this.orderRepo = orderRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    public Order place(Order order) {

        if (order == null) {
            throw new RuntimeException("Order payload is missing");
        }

        // -------- Validate Farmer --------
        if (order.getFarmerId() == null || order.getFarmerId().isBlank()) {
            throw new RuntimeException("farmerId is required");
        }

        User farmer = userRepo.findById(order.getFarmerId())
                .orElseThrow(() -> new RuntimeException("Invalid farmerId"));

        if (!"FARMER".equalsIgnoreCase(farmer.getRole())) {
            throw new RuntimeException("farmerId is not a FARMER");
        }

        // -------- Validate Manager --------
        if (order.getManagerId() == null || order.getManagerId().isBlank()) {
            throw new RuntimeException("managerId is required");
        }

        User manager = userRepo.findById(order.getManagerId())
                .orElseThrow(() -> new RuntimeException("Invalid managerId"));

        if (!"MANAGER".equalsIgnoreCase(manager.getRole())) {
            throw new RuntimeException("managerId is not a MANAGER");
        }

        if (!"APPROVED".equalsIgnoreCase(manager.getStatus())) {
            throw new RuntimeException("Manager is not approved yet");
        }

        // -------- Validate Items --------
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RuntimeException("Order items cannot be empty");
        }

        double total = 0.0;

        for (Order.OrderItem item : order.getItems()) {

            if (item == null) {
                throw new RuntimeException("Order item cannot be null");
            }

            String productId = item.getProductId();
            if (productId == null || productId.isBlank()) {
                throw new RuntimeException("productId cannot be empty");
            }

            // block placeholder mistake
            if ("PRODUCT_ID".equalsIgnoreCase(productId)) {
                throw new RuntimeException("Invalid productId: placeholder used");
            }

            // must exist in products collection
            Product p = productRepo.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Invalid productId: " + productId));

            if (item.getQuantity() <= 0) {
                throw new RuntimeException("Quantity must be > 0 for product: " + p.getName());
            }

            if (item.getPrice() < 0) {
                throw new RuntimeException("Price must be >= 0 for product: " + p.getName());
            }

            total += item.getPrice() * item.getQuantity();
        }

        // defaults
        order.initDefaults();
        order.setTotalAmount(total);

        return orderRepo.save(order);
    }

    private Order get(String id) {
        return orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    public Order accept(String id) {
        Order o = get(id);
        if (!"PLACED".equals(o.getStatus())) {
            throw new RuntimeException("Only PLACED orders can be ACCEPTED");
        }
        o.setStatus("ACCEPTED");
        return orderRepo.save(o);
    }

    public Order reject(String id) {
        Order o = get(id);
        if (!"PLACED".equals(o.getStatus())) {
            throw new RuntimeException("Only PLACED orders can be REJECTED");
        }
        o.setStatus("REJECTED");
        return orderRepo.save(o);
    }

    public Order dispatch(String id) {
        Order o = get(id);
        if (!"ACCEPTED".equals(o.getStatus())) {
            throw new RuntimeException("Only ACCEPTED orders can be DISPATCHED");
        }
        o.setStatus("DISPATCHED");
        return orderRepo.save(o);
    }

    public Order received(String id) {
        Order o = get(id);
        if (!"DISPATCHED".equals(o.getStatus())) {
            throw new RuntimeException("Only DISPATCHED orders can be marked RECEIVED");
        }
        o.setStatus("RECEIVED");
        return orderRepo.save(o);
    }
}
