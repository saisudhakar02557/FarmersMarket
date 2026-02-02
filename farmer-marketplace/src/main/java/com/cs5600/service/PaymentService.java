package com.cs5600.service;

import com.cs5600.model.Payment;
import com.cs5600.repository.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository repo;

    public PaymentService(PaymentRepository repo) {
        this.repo = repo;
    }

    public Payment makePayment(String orderId, String farmerId, String cardType, String cardNumber, String cvv, double amount) {

        
    	if ("000".equals(cvv)) {
    	    throw new RuntimeException("Payment declined (test)");
    	}
    	
    	// basic checks (not real payment gateway)
        if (cardNumber == null || cardNumber.length() < 4) {
            throw new RuntimeException("Invalid card number");
        }
        if (cvv == null || cvv.length() < 3) {
            throw new RuntimeException("Invalid CVV");
        }

        String last4 = cardNumber.substring(cardNumber.length() - 4);

        Payment p = new Payment();
        p.setOrderId(orderId);
        p.setFarmerId(farmerId);
        p.setCardType(cardType);
        p.setCardLast4(last4);
        p.setAmount(amount);

        p.initSuccess();
        return repo.save(p);
    }
}
