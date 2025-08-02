package com.ewallet.ewallet.service;

import com.ewallet.ewallet.entity.Transaction;
import com.ewallet.ewallet.entity.TransactionType;
import com.ewallet.ewallet.entity.Wallet;
import com.ewallet.ewallet.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final WalletService walletService;

    public TransactionService(TransactionRepository transactionRepository, WalletService walletService) {
        this.transactionRepository = transactionRepository;
        this.walletService = walletService;
    }

    @Transactional
    public Transaction credit(String walletId, Double amount) {
        Wallet receiver = walletService.findByWalletId(walletId)
                .orElseThrow(() -> new NoSuchElementException("Wallet not found: " + walletId));
        walletService.updateBalance(receiver, receiver.getBalance() + amount);

        Transaction transaction = new Transaction();
        transaction.setSender(null); // No sender for deposits
        transaction.setReceiver(receiver);
        transaction.setAmount(amount);
        transaction.setType(TransactionType.CREDITED);
        transaction.setTimestamp(LocalDateTime.now());
        return transactionRepository.save(transaction);
    }

    @Transactional
    public Transaction debit(String walletId, Double amount) {
        Wallet sender = walletService.findByWalletId(walletId)
                .orElseThrow(() -> new NoSuchElementException("Wallet not found: " + walletId));
        if (sender.getBalance() < amount) {
            throw new IllegalArgumentException("Insufficient balance");
        }
        walletService.updateBalance(sender, sender.getBalance() - amount);

        Transaction transaction = new Transaction();
        transaction.setSender(sender);
        transaction.setReceiver(null); // No receiver for withdrawals
        transaction.setAmount(amount);
        transaction.setType(TransactionType.DEBITED);
        transaction.setTimestamp(LocalDateTime.now());
        return transactionRepository.save(transaction);
    }

    @Transactional
    public void transfer(String senderWalletId, String receiverWalletId, Double amount) {
        try {
            System.out.println("Starting transfer: " + senderWalletId + " -> " + receiverWalletId + " amount: " + amount);
            
            Wallet sender = walletService.findByWalletId(senderWalletId)
                    .orElseThrow(() -> new NoSuchElementException("Sender wallet not found: " + senderWalletId));
            System.out.println("Found sender wallet: " + sender.getWalletId());
            
            Wallet receiver = walletService.findByWalletId(receiverWalletId)
                    .orElseThrow(() -> new NoSuchElementException("Receiver wallet not found: " + receiverWalletId));
            System.out.println("Found receiver wallet: " + receiver.getWalletId());

            if (sender.getBalance() < amount) {
                throw new IllegalArgumentException("Insufficient balance");
            }
            System.out.println("Balance check passed. Sender balance: " + sender.getBalance());

            // Update balances
            walletService.updateBalance(sender, sender.getBalance() - amount);
            walletService.updateBalance(receiver, receiver.getBalance() + amount);
            System.out.println("Balances updated successfully");

            // Temporarily use CREDITED/DEBITED instead of TRANSFER to test
            // Create DEBITED transaction for sender
            Transaction debitTransaction = new Transaction();
            debitTransaction.setSender(sender);
            debitTransaction.setReceiver(receiver);
            debitTransaction.setAmount(amount);
            debitTransaction.setType(TransactionType.DEBITED);
            debitTransaction.setTimestamp(LocalDateTime.now());
            
            System.out.println("Creating DEBITED transaction for sender");
            Transaction savedDebitTransaction = transactionRepository.save(debitTransaction);
            System.out.println("Debit transaction saved successfully with ID: " + savedDebitTransaction.getId());

            // Create CREDITED transaction for receiver
            Transaction creditTransaction = new Transaction();
            creditTransaction.setSender(sender);
            creditTransaction.setReceiver(receiver);
            creditTransaction.setAmount(amount);
            creditTransaction.setType(TransactionType.CREDITED);
            creditTransaction.setTimestamp(LocalDateTime.now());
            
            System.out.println("Creating CREDITED transaction for receiver");
            Transaction savedCreditTransaction = transactionRepository.save(creditTransaction);
            System.out.println("Credit transaction saved successfully with ID: " + savedCreditTransaction.getId());
            
        } catch (Exception e) {
            System.err.println("Error in transfer method: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<Transaction> getTransactionsForWallet(Wallet wallet) {
        return transactionRepository.findBySenderOrReceiver(wallet, wallet);
    }

    public Optional<Wallet> findByWalletId(String walletId) {
        return walletService.findByWalletId(walletId);
    }
}