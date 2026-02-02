package com.cs5600.service;

import com.cs5600.llm.OllamaClient;
import com.cs5600.model.Order;
import com.cs5600.model.Product;
import com.cs5600.repository.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class LlmCommandService {

    private static final String DEFAULT_MODEL = "llama3.2";

    private final OllamaClient ollamaClient;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final OrderService orderService;
    private final ObjectMapper mapper = new ObjectMapper();

    public LlmCommandService(OllamaClient ollamaClient,
                             ProductRepository productRepository,
                             CartService cartService,
                             OrderService orderService) {
        this.ollamaClient = ollamaClient;
        this.productRepository = productRepository;
        this.cartService = cartService;
        this.orderService = orderService;
    }

    public String handleCommand(String prompt, String userId, String role) {
        if (prompt == null || prompt.isBlank()) {
            throw new IllegalArgumentException("prompt is required");
        }
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("userId is required");
        }
        if (role == null || role.isBlank()) {
            throw new IllegalArgumentException("role is required");
        }

        String llmPrompt = buildPrompt(prompt, role);
        String llmText = ollamaClient.chat(DEFAULT_MODEL, llmPrompt).trim();

        Map<String, Object> cmd = parseCommand(llmText);
        String action = String.valueOf(cmd.getOrDefault("action", "UNKNOWN")).toUpperCase();
        Map<String, Object> parameters = toMap(cmd.get("parameters"));

        switch (action) {
            case "ADD_TO_CART":
                return handleAddToCart(userId, parameters);
            case "REMOVE_FROM_CART":
                return handleRemoveFromCart(userId, parameters);
            case "UPDATE_CART_QTY":
                return handleUpdateCartQty(userId, parameters);
            case "CLEAR_CART":
                cartService.clearCart(userId);
                return "Your cart is now cleared.";
            case "CHECKOUT_CART":
                return handleCheckout(userId, parameters);
            case "ACCEPT_ORDER":
            case "REJECT_ORDER":
            case "DISPATCH_ORDER":
            case "MARK_ORDER_RECEIVED":
                return handleOrderAction(role, action, parameters);
            default:
                return "Sorry, I couldn't understand that request.";
        }
    }

    private String buildPrompt(String prompt, String role) {
        return "You are a strict JSON generator. Output ONLY valid minified JSON. No markdown."
                + "\nReturn format: {\"action\":\"ACTION\",\"parameters\":{...}}"
                + "\nAllowed actions: ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_QTY, CLEAR_CART,"
                + " CHECKOUT_CART, ACCEPT_ORDER, REJECT_ORDER, DISPATCH_ORDER, MARK_ORDER_RECEIVED, UNKNOWN."
                + "\nParameters for cart actions: productName (string), quantity (int)."
                + "\nParameters for checkout: managerId, cardType (CREDIT/DEBIT), cardNumber, cvv."
                + "\nParameters for order actions: orderId."
                + "\nIf information is missing or the user intent is unclear, use action UNKNOWN."
                + "\nUser role: " + role + "\nUser message: " + prompt;
    }

    private Map<String, Object> parseCommand(String llmText) {
        try {
            return mapper.readValue(llmText, Map.class);
        } catch (Exception ex) {
            return Map.of("action", "UNKNOWN");
        }
    }

    private Map<String, Object> toMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Collections.emptyMap();
    }

    private String handleAddToCart(String userId, Map<String, Object> parameters) {
        String productName = String.valueOf(parameters.getOrDefault("productName", "")).trim();
        int quantity = parseInt(parameters.get("quantity"));

        if (productName.isBlank() || quantity <= 0) {
            return "Please provide a product name and quantity to add.";
        }

        Product match = findProduct(productName);
        if (match == null) {
            return "I couldn't find a product named \"" + productName + "\".";
        }

        cartService.addToCart(userId, match.getId(), quantity);
        return "Added " + quantity + " x " + match.getName() + " to your cart.";
    }

    private String handleRemoveFromCart(String userId, Map<String, Object> parameters) {
        String productName = String.valueOf(parameters.getOrDefault("productName", "")).trim();
        if (productName.isBlank()) {
            return "Please provide a product name to remove.";
        }

        Product match = findProduct(productName);
        if (match == null) {
            return "I couldn't find a product named \"" + productName + "\".";
        }

        cartService.removeFromCart(userId, match.getId());
        return "Removed " + match.getName() + " from your cart.";
    }

    private String handleUpdateCartQty(String userId, Map<String, Object> parameters) {
        String productName = String.valueOf(parameters.getOrDefault("productName", "")).trim();
        int quantity = parseInt(parameters.get("quantity"));

        if (productName.isBlank() || quantity <= 0) {
            return "Please provide a product name and new quantity.";
        }

        Product match = findProduct(productName);
        if (match == null) {
            return "I couldn't find a product named \"" + productName + "\".";
        }

        cartService.updateCartItem(userId, match.getId(), quantity);
        return "Updated " + match.getName() + " to quantity " + quantity + ".";
    }

    private String handleCheckout(String userId, Map<String, Object> parameters) {
        String managerId = String.valueOf(parameters.getOrDefault("managerId", "")).trim();
        String cardType = String.valueOf(parameters.getOrDefault("cardType", "")).trim().toUpperCase();
        String cardNumber = String.valueOf(parameters.getOrDefault("cardNumber", "")).trim();
        String cvv = String.valueOf(parameters.getOrDefault("cvv", "")).trim();

        if (managerId.isBlank()) {
            return "Please provide a managerId to complete checkout.";
        }
        if (cardType.isBlank()) {
            cardType = "CREDIT";
        }
        if (cardNumber.isBlank()) {
            cardNumber = "4111111111111111";
        }
        if (cvv.isBlank()) {
            cvv = "123";
        }

        Order order = cartService.checkoutFromCart(userId, managerId, cardType, cardNumber, cvv);
        return "Checkout complete! Order " + order.getId() + " is now " + order.getStatus() + ".";
    }

    private String handleOrderAction(String role, String action, Map<String, Object> parameters) {
        if (!"MANAGER".equalsIgnoreCase(role)) {
            return "Only managers can update order status.";
        }

        String orderId = String.valueOf(parameters.getOrDefault("orderId", "")).trim();
        if (orderId.isBlank()) {
            return "Please provide an orderId.";
        }

        return switch (action) {
            case "ACCEPT_ORDER" -> {
                orderService.accept(orderId);
                yield "Order " + orderId + " accepted.";
            }
            case "REJECT_ORDER" -> {
                orderService.reject(orderId);
                yield "Order " + orderId + " rejected.";
            }
            case "DISPATCH_ORDER" -> {
                orderService.dispatch(orderId);
                yield "Order " + orderId + " dispatched.";
            }
            case "MARK_ORDER_RECEIVED" -> {
                orderService.received(orderId);
                yield "Order " + orderId + " marked as received.";
            }
            default -> "Sorry, I couldn't understand that order request.";
        };
    }

    private Product findProduct(String productName) {
        List<Product> matches = productRepository.findByNameContainingIgnoreCase(productName);
        if (matches == null || matches.isEmpty()) {
            return null;
        }
        return matches.get(0);
    }

    private int parseInt(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text) {
            try {
                return Integer.parseInt(text);
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }
        return 0;
    }
}
