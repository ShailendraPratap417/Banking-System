package com.banking.controller;

import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.service.AccountService;
import com.banking.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AccountService accountService;

    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Map<String, Object> request) {
        try {
            String accountNumber = (String) request.get("accountNumber");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = (String) request.get("description");

            validateAccountOwner(accountNumber);

            Transaction tx = transactionService.deposit(accountNumber, amount, description);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Map<String, Object> request) {
        try {
            String accountNumber = (String) request.get("accountNumber");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = (String) request.get("description");

            validateAccountOwner(accountNumber);

            Transaction tx = transactionService.withdraw(accountNumber, amount, description);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(@RequestBody Map<String, Object> request) {
        try {
            String sourceAccountNumber = (String) request.get("sourceAccountNumber");
            String destinationAccountNumber = (String) request.get("destinationAccountNumber");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String description = (String) request.get("description");

            validateAccountOwner(sourceAccountNumber);

            Transaction tx = transactionService.transfer(sourceAccountNumber, destinationAccountNumber, amount, description);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/pay-bill")
    public ResponseEntity<?> payBill(@RequestBody Map<String, Object> request) {
        try {
            String sourceAccountNumber = (String) request.get("sourceAccountNumber");
            String billerName = (String) request.get("billerName");
            BigDecimal amount = new BigDecimal(request.get("amount").toString());

            validateAccountOwner(sourceAccountNumber);

            Transaction tx = transactionService.payBill(sourceAccountNumber, billerName, amount);
            return ResponseEntity.ok(tx);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/history/{accountNumber}")
    public ResponseEntity<?> getHistory(@PathVariable String accountNumber) {
        try {
            validateAccountOwner(accountNumber);
            List<Transaction> history = transactionService.getTransactionHistory(accountNumber);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    private void validateAccountOwner(String accountNumber) {
        Account account = accountService.getAccountByNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found: " + accountNumber));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized: You do not own this account!");
        }
    }
}
