package com.ewallet.ewallet.entity;

import jakarta.persistence.*;
import com.ewallet.ewallet.entity.TransactionType;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_wallet_id", nullable = true)
    private Wallet sender;

    @ManyToOne
    @JoinColumn(name = "receiver_wallet_id", nullable = true)
    private Wallet receiver;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}