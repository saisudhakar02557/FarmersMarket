package com.cs5600.graphql;

import com.cs5600.model.Order;
import com.cs5600.repository.OrderRepository;
import com.cs5600.service.OrderService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Controller
public class OrderGraphQLController {

    private final OrderService service;
    private final OrderRepository repo;

    public OrderGraphQLController(OrderService service, OrderRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @MutationMapping
    @SuppressWarnings("unchecked")
    public Order placeOrder(@Argument("input") Map<String, Object> input) {
        Order order = new Order();
        order.setFarmerId((String) input.get("farmerId"));
        order.setManagerId((String) input.get("managerId"));

        List<Map<String, Object>> itemsInput = (List<Map<String, Object>>) input.get("items");
        List<Order.OrderItem> items = new ArrayList<>();

        for (Map<String, Object> it : itemsInput) {
            Order.OrderItem item = new Order.OrderItem();
            item.setProductId((String) it.get("productId"));
            item.setQuantity((Integer) it.get("quantity"));
            item.setPrice(((Number) it.get("price")).doubleValue());
            items.add(item);
        }

        order.setItems(items);
        return service.place(order);
    }

    @QueryMapping
    public List<Order> orders() {
        return repo.findAll();
    }

    @QueryMapping
    public List<Order> ordersByFarmer(@Argument String farmerId) {
        return repo.findByFarmerId(farmerId);
    }

    @QueryMapping
    public List<Order> ordersByManager(@Argument String managerId) {
        return repo.findByManagerId(managerId);
    }

    @MutationMapping
    public Order acceptOrder(@Argument String orderId) {
        return service.accept(orderId);
    }

    @MutationMapping
    public Order rejectOrder(@Argument String orderId) {
        return service.reject(orderId);
    }

    @MutationMapping
    public Order dispatchOrder(@Argument String orderId) {
        return service.dispatch(orderId);
    }

    @MutationMapping
    public Order markOrderReceived(@Argument String orderId) {
        return service.received(orderId);
    }
}
