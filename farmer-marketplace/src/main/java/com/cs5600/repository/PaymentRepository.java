package com.cs5600.repository;

import com.cs5600.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByFarmerId(String farmerId);
    Optional<Payment> findByOrderId(String orderId);
}
