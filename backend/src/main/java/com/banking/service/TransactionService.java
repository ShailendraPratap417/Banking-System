package com.banking.service;

import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.model.TransactionType;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional
    public Transaction deposit(String accountNumber, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Deposit amount must be greater than zero");
        }

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .sourceAccountNumber(accountNumber)
                .amount(amount)
                .transactionType(TransactionType.DEPOSIT)
                .timestamp(LocalDateTime.now())
                .description(description != null && !description.trim().isEmpty() ? description : "Deposit")
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction withdraw(String accountNumber, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Withdrawal amount must be greater than zero");
        }

        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        Transaction transaction = Transaction.builder()
                .sourceAccountNumber(accountNumber)
                .amount(amount)
                .transactionType(TransactionType.WITHDRAWAL)
                .timestamp(LocalDateTime.now())
                .description(description != null && !description.trim().isEmpty() ? description : "Withdrawal")
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction transfer(String sourceAccountNumber, String destinationAccountNumber, BigDecimal amount, String description) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be greater than zero");
        }
        if (sourceAccountNumber.equals(destinationAccountNumber)) {
            throw new RuntimeException("Cannot transfer to the same account");
        }

        Account sourceAccount = accountRepository.findByAccountNumber(sourceAccountNumber)
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        Account destAccount = accountRepository.findByAccountNumber(destinationAccountNumber)
                .orElseThrow(() -> new RuntimeException("Destination account not found"));

        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        destAccount.setBalance(destAccount.getBalance().add(amount));
        // Save both accounts to ensure the destination balance is persisted
        accountRepository.save(sourceAccount);
        accountRepository.save(destAccount);

        Transaction transaction = Transaction.builder()
                .sourceAccountNumber(sourceAccountNumber)
                .destinationAccountNumber(destinationAccountNumber)
                .amount(amount)
                .transactionType(TransactionType.TRANSFER)
                .timestamp(LocalDateTime.now())
                .description(description != null && !description.trim().isEmpty() ? description : "Transfer to " + destinationAccountNumber)
                .build();

        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction payBill(String sourceAccountNumber, String billerName, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be greater than zero");
        }

        Account sourceAccount = accountRepository.findByAccountNumber(sourceAccountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (sourceAccount.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        sourceAccount.setBalance(sourceAccount.getBalance().subtract(amount));
        accountRepository.save(sourceAccount);

        Transaction transaction = Transaction.builder()
                .sourceAccountNumber(sourceAccountNumber)
                .amount(amount)
                .transactionType(TransactionType.BILL_PAY)
                .timestamp(LocalDateTime.now())
                .description("Bill payment to: " + billerName)
                .build();

        return transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionHistory(String accountNumber) {
        return transactionRepository.findBySourceAccountNumberOrDestinationAccountNumberOrderByTimestampDesc(
                accountNumber, accountNumber);
    }
}
