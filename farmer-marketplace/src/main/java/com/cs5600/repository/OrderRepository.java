package com.cs5600.repository;

import com.cs5600.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByFarmerId(String farmerId);
    List<Order> findByManagerId(String managerId);
    List<Order> findByFarmerIdAndStatus(String farmerId, String status);

    List<Order> findByFarmerIdOrderByOrderDateDesc(String farmerId);


}
