package com.ewallet.ewallet.controller;

import com.ewallet.ewallet.entity.Transaction;
import com.ewallet.ewallet.entity.Wallet;
import com.ewallet.ewallet.service.TransactionService;
import com.ewallet.ewallet.service.UserService;
import com.ewallet.ewallet.service.WalletService;
import com.ewallet.ewallet.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;
    private final UserService userService;
    private final WalletService walletService;

    public TransactionController(TransactionService transactionService, UserService userService, WalletService walletService) {
        this.transactionService = transactionService;
        this.userService = userService;
        this.walletService = walletService;
    }

    @PostMapping("/credit")
    public ResponseEntity<?> credit(@RequestParam String walletId, @RequestParam Double amount) {
        try {
            Transaction transaction = transactionService.credit(walletId, amount);
            return ResponseEntity.ok(transaction);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping("/debit")
    public ResponseEntity<?> debit(@RequestParam String walletId, @RequestParam Double amount) {
        try {
            Transaction transaction = transactionService.debit(walletId, amount);
            return ResponseEntity.ok(transaction);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(
            @RequestParam String receiverWalletId,
            @RequestParam Double amount,
            Authentication authentication) {
        try {
            String username = authentication.getName();
            User user = userService.findByUsername(username)
                    .orElseThrow(() -> new NoSuchElementException("User not found: " + username));
            String senderWalletId = walletService.findByUserId(user.getId())
                    .map(Wallet::getWalletId)
                    .orElseThrow(() -> new NoSuchElementException("Sender wallet not found for user: " + username));
            transactionService.transfer(senderWalletId, receiverWalletId, amount);
            return ResponseEntity.ok("Transfer successful");
        } catch (NoSuchElementException e) {
            System.err.println("Transfer error (NoSuchElementException): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("Transfer error (IllegalArgumentException): " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            System.err.println("Transfer error (Exception): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transfer failed: " + e.getMessage());
        }
    }
}