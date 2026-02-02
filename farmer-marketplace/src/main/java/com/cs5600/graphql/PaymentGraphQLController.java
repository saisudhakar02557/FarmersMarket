package com.cs5600.graphql;

import com.cs5600.model.Payment;
import com.cs5600.repository.PaymentRepository;
import com.cs5600.service.PaymentService;
import org.springframework.graphql.data.method.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;

@Controller
public class PaymentGraphQLController {

    private final PaymentService service;
    private final PaymentRepository repo;

    public PaymentGraphQLController(PaymentService service, PaymentRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @MutationMapping
    public Payment makePayment(@Argument("input") Map<String, Object> input) {
        String orderId = (String) input.get("orderId");
        String farmerId = (String) input.get("farmerId");
        String cardType = (String) input.get("cardType");
        String cardNumber = (String) input.get("cardNumber");
        String cvv = (String) input.get("cvv");
        double amount = ((Number) input.get("amount")).doubleValue();

        return service.makePayment(orderId, farmerId, cardType, cardNumber, cvv, amount);
    }

    @QueryMapping
    public List<Payment> payments() {
        return repo.findAll();
    }

    @QueryMapping
    public List<Payment> paymentsByFarmer(@Argument String farmerId) {
        return repo.findByFarmerId(farmerId);
    }

    @QueryMapping
    public Payment paymentByOrder(@Argument String orderId) {
        return repo.findByOrderId(orderId).orElse(null);
    }
}
