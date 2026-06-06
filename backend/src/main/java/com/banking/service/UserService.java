package com.banking.service;

import com.banking.model.Account;
import com.banking.model.AccountType;
import com.banking.model.User;
import com.banking.repository.AccountRepository;
import com.banking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.Random;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        // Create initial Checking Account
        Account checkingAccount = Account.builder()
                .accountNumber(generateAccountNumber())
                .accountType(AccountType.CHECKING)
                .balance(new BigDecimal("1000.00"))
                .user(savedUser)
                .build();
        accountRepository.save(checkingAccount);

        // Create initial Savings Account
        Account savingsAccount = Account.builder()
                .accountNumber(generateAccountNumber())
                .accountType(AccountType.SAVINGS)
                .balance(BigDecimal.ZERO)
                .user(savedUser)
                .build();
        accountRepository.save(savingsAccount);

        return userRepository.findById(savedUser.getId()).orElse(savedUser);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    private String generateAccountNumber() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sb.append(random.nextInt(10));
        }
        String accNum = sb.toString();
        if (accountRepository.existsByAccountNumber(accNum)) {
            return generateAccountNumber();
        }
        return accNum;
    }
}
