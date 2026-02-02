package com.cs5600.service;

import com.cs5600.model.Order;
import com.cs5600.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderQueryService {

    private final OrderRepository orderRepo;

    public OrderQueryService(OrderRepository orderRepo) {
        this.orderRepo = orderRepo;
    }

    public Order lastOrder(String farmerId) {
        List<Order> orders = orderRepo.findByFarmerIdOrderByOrderDateDesc(farmerId);
        return orders.isEmpty() ? null : orders.get(0);
    }

    public List<Order> allOrders(String farmerId) {
        return orderRepo.findByFarmerIdOrderByOrderDateDesc(farmerId);
    }

    public List<Order> ordersByStatus(String farmerId, String status) {
        return orderRepo.findByFarmerIdAndStatus(farmerId, status.toUpperCase());
    }
}
