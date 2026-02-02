package com.cs5600.llm;

import com.cs5600.model.Order;
import com.cs5600.model.Product;
import com.cs5600.repository.ProductRepository;
import com.cs5600.service.CartService;
import com.cs5600.service.OrderQueryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/nl")
@CrossOrigin(origins = "http://localhost:3000")
public class NLCommandController {

    private final OllamaClient ollama;
    private final ProductRepository productRepo;
    private final CartService cartService;
    private final OrderQueryService orderQueryService;

    private final ObjectMapper mapper = new ObjectMapper();

    public NLCommandController(OllamaClient ollama,
                               ProductRepository productRepo,
                               CartService cartService,
                               OrderQueryService orderQueryService) {
        this.ollama = ollama;
        this.productRepo = productRepo;
        this.cartService = cartService;
        this.orderQueryService = orderQueryService;
    }

    @PostMapping("/command")
    public Map<String, Object> command(@RequestBody Map<String, String> req) throws Exception {
        String farmerId = req.get("farmerId");
        String message = req.get("message");
        String model = req.getOrDefault("model", "llama3.2");

        if (farmerId == null || farmerId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "farmerId is required");
        }
        if (message == null || message.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "message is required");
        }

        String prompt =
                "You are a strict JSON generator. Output ONLY valid minified JSON. No markdown.\n" +
                "Convert the user message into an intent.\n" +
                "Allowed intents:\n" +
                "ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_QTY,\n" +
                "SHOW_CART, LAST_ORDER_STATUS, SHOW_ORDERS, ORDERS_BY_STATUS,\n" +
                "CHECKOUT, UNKNOWN.\n" +
                "JSON formats:\n" +
                "{\"intent\":\"LAST_ORDER_STATUS\"}\n" +
                "{\"intent\":\"SHOW_ORDERS\"}\n" +
                "{\"intent\":\"ORDERS_BY_STATUS\",\"status\":\"DISPATCHED\"}\n" +
                "{\"intent\":\"ADD_TO_CART\",\"productName\":\"urea\",\"quantity\":2}\n" +
                "{\"intent\":\"CHECKOUT\",\"cardType\":\"CREDIT\",\"cardNumber\":\"4111111111111111\",\"cvv\":\"123\"}\n" +
                "Rules:\n" +
                "- status must be one of PLACED, ACCEPTED, DISPATCHED, RECEIVED, REJECTED\n" +
                "- cardType must be CREDIT or DEBIT\n" +
                "- cardNumber must be digits only if provided\n" +
                "- cvv must be digits only if provided\n" +
                "- If user says checkout but doesn't provide payment fields, still set intent=CHECKOUT but leave fields empty\n" +
                "- If missing required info for other intents, use UNKNOWN\n" +
                "User message: " + message;


        String llmText = ollama.chat(model, prompt).trim();

        Map<String, Object> cmd;
        try {
            cmd = mapper.readValue(llmText, Map.class);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid LLM response JSON", ex);
        }
        String intent = String.valueOf(cmd.getOrDefault("intent", "UNKNOWN"));

        // -------------------
        // CART INTENTS
        // -------------------

        if ("SHOW_CART".equalsIgnoreCase(intent)) {
            return Map.of(
                    "intent", "SHOW_CART",
                    "cart", cartService.cartByFarmer(farmerId)
            );
        }

        if ("ADD_TO_CART".equalsIgnoreCase(intent)) {
            String productName = String.valueOf(cmd.getOrDefault("productName", "")).trim();
            int quantity = ((Number) cmd.getOrDefault("quantity", 0)).intValue();

            if (productName.isBlank() || quantity <= 0) {
                return Map.of("intent", "UNKNOWN", "reason", "Missing productName or quantity", "raw", cmd);
            }

            List<Product> matches = productRepo.findByNameContainingIgnoreCase(productName);
            if (matches.isEmpty()) {
                return Map.of("intent", "UNKNOWN", "reason", "No product matched: " + productName);
            }

            Product chosen = matches.get(0);
            var updatedCart = cartService.addToCart(farmerId, chosen.getId(), quantity);

            return Map.of(
                    "intent", "ADD_TO_CART",
                    "matchedProductId", chosen.getId(),
                    "matchedProductName", chosen.getName(),
                    "cart", updatedCart
            );
        }

        if ("REMOVE_FROM_CART".equalsIgnoreCase(intent)) {
            String productName = String.valueOf(cmd.getOrDefault("productName", "")).trim();

            if (productName.isBlank()) {
                return Map.of("intent", "UNKNOWN", "reason", "Missing productName", "raw", cmd);
            }

            List<Product> matches = productRepo.findByNameContainingIgnoreCase(productName);
            if (matches.isEmpty()) {
                return Map.of("intent", "UNKNOWN", "reason", "No product matched: " + productName);
            }

            Product chosen = matches.get(0);
            var updatedCart = cartService.removeFromCart(farmerId, chosen.getId());

            return Map.of(
                    "intent", "REMOVE_FROM_CART",
                    "matchedProductId", chosen.getId(),
                    "matchedProductName", chosen.getName(),
                    "cart", updatedCart
            );
        }

        if ("UPDATE_CART_QTY".equalsIgnoreCase(intent)) {
            String productName = String.valueOf(cmd.getOrDefault("productName", "")).trim();
            int quantity = ((Number) cmd.getOrDefault("quantity", 0)).intValue();

            if (productName.isBlank() || quantity <= 0) {
                return Map.of("intent", "UNKNOWN", "reason", "Missing productName or quantity", "raw", cmd);
            }

            List<Product> matches = productRepo.findByNameContainingIgnoreCase(productName);
            if (matches.isEmpty()) {
                return Map.of("intent", "UNKNOWN", "reason", "No product matched: " + productName);
            }

            Product chosen = matches.get(0);
            var updatedCart = cartService.updateCartItem(farmerId, chosen.getId(), quantity);

            return Map.of(
                    "intent", "UPDATE_CART_QTY",
                    "matchedProductId", chosen.getId(),
                    "matchedProductName", chosen.getName(),
                    "cart", updatedCart
            );
        }

        // -------------------
        // ORDER INTENTS
        // -------------------

        if ("LAST_ORDER_STATUS".equalsIgnoreCase(intent)) {
            var order = orderQueryService.lastOrder(farmerId);
            if (order == null) {
                return Map.of(
                        "intent", "LAST_ORDER_STATUS",
                        "message", "No orders found"
                );
            }

            return Map.of(
                    "intent", "LAST_ORDER_STATUS",
                    "orderId", order.getId(),
                    "status", order.getStatus(),
                    "totalAmount", order.getTotalAmount(),
                    "orderDate", order.getOrderDate()
            );
        }

        if ("SHOW_ORDERS".equalsIgnoreCase(intent)) {
            return Map.of(
                    "intent", "SHOW_ORDERS",
                    "orders", orderQueryService.allOrders(farmerId)
            );
        }

        if ("ORDERS_BY_STATUS".equalsIgnoreCase(intent)) {
            String status = String.valueOf(cmd.getOrDefault("status", "")).trim().toUpperCase();

            if (status.isBlank()) {
                return Map.of("intent", "UNKNOWN", "reason", "Missing status", "raw", cmd);
            }

            return Map.of(
                    "intent", "ORDERS_BY_STATUS",
                    "status", status,
                    "orders", orderQueryService.ordersByStatus(farmerId, status)
            );
        }
     // -------------------
        // CHECKOUT INTENTS
        // -------------------
        
        if ("CHECKOUT".equalsIgnoreCase(intent)) {

            // If user didn't provide card fields, use safe demo defaults (or reject if you prefer)
            String cardType = String.valueOf(cmd.getOrDefault("cardType", "")).trim().toUpperCase();
            String cardNumber = String.valueOf(cmd.getOrDefault("cardNumber", "")).trim();
            String cvv = String.valueOf(cmd.getOrDefault("cvv", "")).trim();

            // ✅ Demo defaults (easy for testing)
            if (cardType.isBlank()) cardType = "CREDIT";
            if (cardNumber.isBlank()) cardNumber = "4111111111111111";
            if (cvv.isBlank()) cvv = "123";

            // You need managerId for checkout. Best choice:
            // Option A (simple demo): pass managerId from frontend in request
            // Option B (smart): compute nearest manager by farmer zip (later)
            String managerId = req.get("managerId");
            if (managerId == null || managerId.isBlank()) {
                return Map.of(
                        "intent", "CHECKOUT",
                        "error", "managerId is required for checkout (send it from frontend)"
                );
            }

            Order order = cartService.checkoutFromCart(
                    farmerId,
                    managerId,
                    cardType,
                    cardNumber,
                    cvv
            );

            return Map.of(
                    "intent", "CHECKOUT",
                    "message", "Checkout successful",
                    "orderId", order.getId(),
                    "status", order.getStatus(),
                    "totalAmount", order.getTotalAmount()
            );
        }


        // fallback
        return Map.of(
                "intent", "UNKNOWN",
                "raw", cmd
        );
    }
}
