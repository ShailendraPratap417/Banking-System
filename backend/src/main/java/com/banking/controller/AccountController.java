package com.banking.controller;

import com.banking.model.Account;
import com.banking.model.User;
import com.banking.service.AccountService;
import com.banking.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private UserService userService;

    @GetMapping("/my-accounts")
    public ResponseEntity<?> getMyAccounts() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Account> accounts = accountService.getAccountsByUser(user);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/{accountNumber}")
    public ResponseEntity<?> getAccountByNumber(@PathVariable String accountNumber) {
        try {
            Account account = accountService.getAccountByNumber(accountNumber)
                    .orElseThrow(() -> new RuntimeException("Account not found"));
            
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            if (!account.getUser().getUsername().equals(username)) {
                Map<String, Object> summary = new HashMap<>();
                summary.put("accountNumber", account.getAccountNumber());
                summary.put("fullName", account.getUser().getFullName());
                summary.put("accountType", account.getAccountType());
                return ResponseEntity.ok(summary);
            }
            
            return ResponseEntity.ok(account);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
