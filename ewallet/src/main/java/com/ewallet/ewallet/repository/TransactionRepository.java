package com.ewallet.ewallet.repository;

import com.ewallet.ewallet.entity.Transaction;
import com.ewallet.ewallet.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findBySenderOrReceiver(Wallet sender, Wallet receiver);
}