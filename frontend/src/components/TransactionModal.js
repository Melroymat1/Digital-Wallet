import React, { useState } from 'react';
import { X, DollarSign, Send, User } from 'lucide-react';

const TransactionModal = ({ type, onClose, onSubmit, walletId }) => {
  const [formData, setFormData] = useState({
    amount: '',
    receiverWalletId: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return;
    }

    if (type === 'transfer' && !formData.receiverWalletId) {
      return;
    }

    setIsLoading(true);
    
    try {
      await onSubmit(type, parseFloat(formData.amount), formData.receiverWalletId);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case 'credit':
        return 'Add Money to Wallet';
      case 'debit':
        return 'Withdraw Money';
      case 'transfer':
        return 'Send Money';
      default:
        return 'Transaction';
    }
  };

  const getModalIcon = () => {
    switch (type) {
      case 'credit':
        return <DollarSign className="h-6 w-6 text-green-600" />;
      case 'debit':
        return <DollarSign className="h-6 w-6 text-red-600" />;
      case 'transfer':
        return <Send className="h-6 w-6 text-blue-600" />;
      default:
        return <DollarSign className="h-6 w-6 text-gray-600" />;
    }
  };

  const getButtonText = () => {
    switch (type) {
      case 'credit':
        return 'Add Money';
      case 'debit':
        return 'Withdraw';
      case 'transfer':
        return 'Send Money';
      default:
        return 'Submit';
    }
  };

  const getButtonClass = () => {
    switch (type) {
      case 'credit':
        return 'btn-success';
      case 'debit':
        return 'btn-danger';
      case 'transfer':
        return 'btn-primary';
      default:
        return 'btn-primary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slide-up border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              type === 'credit' ? 'bg-green-100 shadow-glow-green' :
              type === 'debit' ? 'bg-red-100 shadow-glow-red' :
              'bg-blue-100 shadow-glow'
            }`}>
              {getModalIcon()}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {getModalTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {type === 'transfer' && (
            <div>
              <label htmlFor="receiverWalletId" className="block text-sm font-medium text-gray-700 mb-2">
                Receiver Wallet ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="receiverWalletId"
                  name="receiverWalletId"
                  type="text"
                  required
                  className="input-field pl-10"
                  placeholder="Enter receiver's wallet ID"
                  value={formData.receiverWalletId}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400 font-bold text-lg">₹</span>
              </div>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="input-field pl-10"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          {type === 'transfer' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-glow">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You will be sending money from your wallet ({walletId}) to the specified receiver.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.amount || parseFloat(formData.amount) <= 0}
              className={`${getButtonClass()} flex-1 flex justify-center items-center`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                getButtonText()
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal; 