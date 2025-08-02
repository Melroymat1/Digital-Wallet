package com.ewallet.ewallet.controller;

import com.ewallet.ewallet.entity.Transaction;
import com.ewallet.ewallet.entity.User;
import com.ewallet.ewallet.entity.Wallet;
import com.ewallet.ewallet.service.TransactionService;
import com.ewallet.ewallet.service.UserService;
import com.ewallet.ewallet.service.WalletService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final UserService userService;
    private final WalletService walletService;
    private final TransactionService transactionService;

    public DashboardController(UserService userService, WalletService walletService, TransactionService transactionService) {
        this.userService = userService;
        this.walletService = walletService;
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getDashboard(Authentication authentication) {
        String username = authentication.getName();
        User user = userService.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Handle Optional<Wallet>
        Wallet wallet = walletService.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Wallet not found for user: " + username));
        List<Transaction> transactions = transactionService.getTransactionsForWallet(wallet);

        List<Map<String, Object>> transactionDetails = transactions.stream()
            .filter(t -> {
                // Add debugging
                System.out.println("Filtering transaction: " + t.getType() + 
                    " | Sender: " + (t.getSender() != null ? t.getSender().getId() : "null") + 
                    " | Receiver: " + (t.getReceiver() != null ? t.getReceiver().getId() : "null") + 
                    " | Current wallet: " + wallet.getId());
                
                // Filter out transactions that don't belong to this user's perspective
                if (t.getType().toString().equals("CREDITED")) {
                    // For CREDITED transactions, only show if user is the receiver
                    boolean shouldShow = t.getReceiver() != null && t.getReceiver().getId().equals(wallet.getId());
                    System.out.println("CREDITED transaction - should show: " + shouldShow);
                    return shouldShow;
                } else if (t.getType().toString().equals("DEBITED")) {
                    // For DEBITED transactions, only show if user is the sender
                    boolean shouldShow = t.getSender() != null && t.getSender().getId().equals(wallet.getId());
                    System.out.println("DEBITED transaction - should show: " + shouldShow);
                    return shouldShow;
                } else if (t.getType().toString().equals("TRANSFER")) {
                    // For TRANSFER transactions, show if user is either sender or receiver
                    boolean shouldShow = (t.getSender() != null && t.getSender().getId().equals(wallet.getId())) ||
                           (t.getReceiver() != null && t.getReceiver().getId().equals(wallet.getId()));
                    System.out.println("TRANSFER transaction - should show: " + shouldShow);
                    return shouldShow;
                }
                System.out.println("Other transaction type - showing: true");
                return true; // Show other transaction types
            })
            .map(t -> {
                Map<String, Object> detail = new HashMap<>();
                detail.put("amount", t.getAmount());
                detail.put("type", t.getType().toString());
                detail.put("timestamp", t.getTimestamp().toString());
                
                // Handle sender information
                if (t.getSender() != null) {
                    detail.put("senderName", t.getSender().getUser().getName());
                    detail.put("senderWalletId", t.getSender().getWalletId());
                } else {
                    detail.put("senderName", "System");
                    detail.put("senderWalletId", "System");
                }
                
                // Handle receiver information
                if (t.getReceiver() != null) {
                    detail.put("receiverName", t.getReceiver().getUser().getName());
                    detail.put("receiverWalletId", t.getReceiver().getWalletId());
                } else {
                    detail.put("receiverName", "System");
                    detail.put("receiverWalletId", "System");
                }
                
                // Determine if this transaction is incoming or outgoing for the current user
                boolean isIncoming = t.getReceiver() != null && t.getReceiver().getId().equals(wallet.getId());
                detail.put("isIncoming", isIncoming);
                
                // Add transaction description based on type and user perspective
                if (t.getType().toString().equals("CREDITED")) {
                    if (t.getSender() != null && !t.getSender().getId().equals(wallet.getId())) {
                        detail.put("description", "Received from " + t.getSender().getUser().getName());
                    } else {
                        detail.put("description", "Money Added");
                    }
                } else if (t.getType().toString().equals("DEBITED")) {
                    if (t.getReceiver() != null && !t.getReceiver().getId().equals(wallet.getId())) {
                        detail.put("description", "Sent to " + t.getReceiver().getUser().getName());
                    } else {
                        detail.put("description", "Money Withdrawn");
                    }
                } else if (t.getType().toString().equals("TRANSFER")) {
                    // For TRANSFER transactions, determine if user is sender or receiver
                    if (t.getSender().getId().equals(wallet.getId())) {
                        // User is the sender
                        detail.put("description", "Sent to " + t.getReceiver().getUser().getName());
                    } else {
                        // User is the receiver
                        detail.put("description", "Received from " + t.getSender().getUser().getName());
                    }
                }
                
                return detail;
            }).collect(Collectors.toList());

        Map<String, Object> dashboardData = Map.of(
                "name", user.getName(),
                "walletId", wallet.getWalletId(),
                "balance", wallet.getBalance(),
                "transactions", transactionDetails
        );

        return ResponseEntity.ok(dashboardData);
    }
}