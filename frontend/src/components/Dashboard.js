import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, transactionAPI } from '../services/api';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Send, 
  LogOut, 
  RefreshCw,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import TransactionModal from './TransactionModal';

const Dashboard = () => {
  const { logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardAPI.getDashboard();
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (type, amount, receiverWalletId = null) => {
    try {
      if (type === 'credit') {
        await transactionAPI.credit(dashboardData.walletId, amount);
        toast.success('Amount credited successfully!');
      } else if (type === 'debit') {
        await transactionAPI.debit(dashboardData.walletId, amount);
        toast.success('Amount debited successfully!');
      } else if (type === 'transfer') {
        await transactionAPI.transfer(receiverWalletId, amount);
        toast.success('Transfer completed successfully!');
      }
      
      setShowModal(false);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.message || 'Transaction failed');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'CREDITED':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      case 'DEBITED':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      case 'TRANSFER':
        return <Send className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTransactionTypeText = (transaction) => {
    // Use the description from backend if available
    if (transaction.description) {
      return transaction.description;
    }
    
    // Fallback logic
    switch (transaction.type) {
      case 'CREDITED':
        return transaction.isIncoming ? 'Money Received' : 'Money Added';
      case 'DEBITED':
        return transaction.isIncoming ? 'Money Sent' : 'Money Withdrawn';
      case 'TRANSFER':
        // For TRANSFER, check if user is sender or receiver
        if (transaction.senderWalletId === dashboardData.walletId) {
          return transaction.receiverName ? `Sent to ${transaction.receiverName}` : 'Transfer Sent';
        } else {
          return transaction.senderName ? `Received from ${transaction.senderName}` : 'Transfer Received';
        }
      default:
        return transaction.type;
    }
  };

  const getTransactionAmountColor = (transaction) => {
    // For incoming transactions (money received), show green
    if (transaction.type === 'CREDITED' && transaction.isIncoming) {
      return 'text-green-600';
    }
    // For outgoing transactions (money sent/withdrawn), show red
    if (transaction.type === 'DEBITED' && !transaction.isIncoming) {
      return 'text-red-600';
    }
    // For TRANSFER transactions, determine based on user role
    if (transaction.type === 'TRANSFER') {
      if (transaction.senderWalletId === dashboardData.walletId) {
        return 'text-red-600'; // User is sender (money going out)
      } else {
        return 'text-green-600'; // User is receiver (money coming in)
      }
    }
    // For CREDITED (money added to wallet)
    if (transaction.type === 'CREDITED' && !transaction.isIncoming) {
      return 'text-green-600';
    }
    // For DEBITED (money withdrawn from wallet)
    if (transaction.type === 'DEBITED' && transaction.isIncoming) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getTransactionAmountPrefix = (transaction) => {
    // For incoming transactions (money received), show +
    if (transaction.type === 'CREDITED' && transaction.isIncoming) {
      return '+';
    }
    // For outgoing transactions (money sent/withdrawn), show -
    if (transaction.type === 'DEBITED' && !transaction.isIncoming) {
      return '-';
    }
    // For TRANSFER transactions, determine based on user role
    if (transaction.type === 'TRANSFER') {
      if (transaction.senderWalletId === dashboardData.walletId) {
        return '-'; // User is sender (money going out)
      } else {
        return '+'; // User is receiver (money coming in)
      }
    }
    // For CREDITED (money added to wallet)
    if (transaction.type === 'CREDITED' && !transaction.isIncoming) {
      return '+';
    }
    // For DEBITED (money withdrawn from wallet)
    if (transaction.type === 'DEBITED' && transaction.isIncoming) {
      return '-';
    }
    return '';
  };

  const getTransactionStatusText = (transaction) => {
    if (transaction.type === 'CREDITED' && transaction.isIncoming) {
      return 'Received';
    } else if (transaction.type === 'DEBITED' && !transaction.isIncoming) {
      return 'Sent';
    } else if (transaction.type === 'CREDITED' && !transaction.isIncoming) {
      return 'Added';
    } else if (transaction.type === 'DEBITED' && transaction.isIncoming) {
      return 'Withdrawn';
    } else if (transaction.type === 'TRANSFER') {
      if (transaction.senderWalletId === dashboardData.walletId) {
        return 'Sent';
      } else {
        return 'Received';
      }
    }
    return transaction.type;
  };

  const getTransactionStatusColor = (transaction) => {
    if (transaction.type === 'CREDITED' && transaction.isIncoming) {
      return 'text-green-500';
    } else if (transaction.type === 'DEBITED' && !transaction.isIncoming) {
      return 'text-red-500';
    } else if (transaction.type === 'CREDITED' && !transaction.isIncoming) {
      return 'text-green-500';
    } else if (transaction.type === 'DEBITED' && transaction.isIncoming) {
      return 'text-red-500';
    } else if (transaction.type === 'TRANSFER') {
      if (transaction.senderWalletId === dashboardData.walletId) {
        return 'text-red-500';
      } else {
        return 'text-green-500';
      }
    }
    return 'text-blue-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
          <button onClick={fetchDashboardData} className="btn-primary">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-glow">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">E-Wallet</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Welcome, {dashboardData.name}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Card */}
        <div className="card-hover mb-8 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {formatCurrency(dashboardData.balance)}
              </h2>
              <p className="text-gray-600 font-medium">Available Balance</p>
              <p className="text-sm text-gray-500 mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">
                Wallet ID: {dashboardData.walletId}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setModalType('credit');
                  setShowModal(true);
                }}
                className="btn-success flex items-center shadow-glow-green"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Money
              </button>
              <button
                onClick={() => {
                  setModalType('debit');
                  setShowModal(true);
                }}
                className="btn-secondary flex items-center"
              >
                <Minus className="h-4 w-4 mr-2" />
                Withdraw
              </button>
              <button
                onClick={() => {
                  setModalType('transfer');
                  setShowModal(true);
                }}
                className="btn-primary flex items-center shadow-glow"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Money
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-hover shadow-glow-green">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl shadow-glow-green">
                <TrendingUp className="h-7 w-7 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.transactions.filter(t => t.type === 'CREDITED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover shadow-glow-red">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-xl shadow-glow-red">
                <TrendingDown className="h-7 w-7 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Debits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.transactions.filter(t => t.type === 'DEBITED').length}
                </p>
              </div>
            </div>
          </div>

          <div className="card-hover shadow-glow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl shadow-glow">
                <Send className="h-7 w-7 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transfers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.transactions.filter(t => t.type === 'TRANSFER').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="card shadow-glow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Transaction History</h3>
            <button
              onClick={fetchDashboardData}
              className="text-primary-600 hover:text-primary-700 transition-colors p-2 rounded-lg hover:bg-primary-50"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {dashboardData.transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Start by adding money to your wallet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'CREDITED' ? 'bg-green-100 shadow-glow-green' :
                      transaction.type === 'DEBITED' ? 'bg-red-100 shadow-glow-red' :
                      'bg-blue-100 shadow-glow'
                    }`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getTransactionTypeText(transaction)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </p>
                      {transaction.type === 'TRANSFER' && (
                        <>
                          {transaction.senderWalletId === dashboardData.walletId ? (
                            // User is sender
                            transaction.receiverName && (
                              <p className="text-xs text-gray-400 flex items-center mt-1">
                                <User className="h-3 w-3 mr-1" />
                                To: {transaction.receiverName} ({transaction.receiverWalletId})
                              </p>
                            )
                          ) : (
                            // User is receiver
                            transaction.senderName && (
                              <p className="text-xs text-gray-400 flex items-center mt-1">
                                <User className="h-3 w-3 mr-1" />
                                From: {transaction.senderName} ({transaction.senderWalletId})
                              </p>
                            )
                          )}
                        </>
                      )}
                      {transaction.type === 'CREDITED' && transaction.isIncoming && transaction.senderName && transaction.senderName !== 'System' && (
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          From: {transaction.senderName} ({transaction.senderWalletId})
                        </p>
                      )}
                      {transaction.type === 'DEBITED' && !transaction.isIncoming && transaction.receiverName && transaction.receiverName !== 'System' && (
                        <p className="text-xs text-gray-400 flex items-center mt-1">
                          <User className="h-3 w-3 mr-1" />
                          To: {transaction.receiverName} ({transaction.receiverWalletId})
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${getTransactionAmountColor(transaction)}`}>
                      {getTransactionAmountPrefix(transaction)}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className={`text-xs font-medium capitalize ${
                      getTransactionStatusColor(transaction)
                    }`}>
                      {getTransactionStatusText(transaction)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <TransactionModal
          type={modalType}
          onClose={() => setShowModal(false)}
          onSubmit={handleTransaction}
          walletId={dashboardData.walletId}
        />
      )}
    </div>
  );
};

export default Dashboard; 