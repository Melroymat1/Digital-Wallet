package com.ewallet.ewallet.service;

import com.ewallet.ewallet.entity.User;
import com.ewallet.ewallet.entity.Wallet;
import com.ewallet.ewallet.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@Service
public class WalletService {
    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    public Wallet createWallet(User user) {
        Wallet wallet = new Wallet();
        wallet.setWalletId(UUID.randomUUID().toString());
        wallet.setUser(user);
        wallet.setBalance(0.0);
        return walletRepository.save(wallet);
    }

    // Modified to return Optional<Wallet>
    public Optional<Wallet> findByUserId(Long userId) {
        return walletRepository.findByUserId(userId);
    }

    public Optional<Wallet> findByWalletId(String walletId) {
        return walletRepository.findByWalletId(walletId);
    }

    public void updateBalance(Wallet wallet, Double newBalance) {
        wallet.setBalance(newBalance);
        walletRepository.save(wallet);
    }
}