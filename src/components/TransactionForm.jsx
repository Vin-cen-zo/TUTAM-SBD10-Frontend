import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, Edit3, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const TransactionForm = ({ onTransactionSaved, initialData, onCancelEdit }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food'); // Default category

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(initialData.amount);
      setDescription(initialData.description);
      setCategory(initialData.category || 'Food');
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { type, amount, description, category: type === 'expense' ? category : null };

      if (initialData) {
        await api.put(`/transactions/${initialData.id}`, payload);
        toast.success('Transaction updated safely!');
      } else {
        await api.post('/transactions', payload);
        toast.success('Transaction added successfully!');
      }
      setType('expense');
      setAmount('');
      setDescription('');
      setCategory('Food');
      onTransactionSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred while saving.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        {initialData ? <Edit3 className="w-5 h-5 text-blue-600" /> : <PlusCircle className="w-5 h-5 text-blue-600" />}
        <h2 className="text-xl font-bold text-gray-800">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h2>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Type</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 font-medium">Rp</span>
            </div>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg pl-10 p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              placeholder="0"
              min="1"
              step="1"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
          <input 
            type="text" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            placeholder="What was this for?"
            required
          />
        </div>

        {type === 'expense' && (
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            >
              <option value="Food">Food & Beverage</option>
              <option value="Transport">Transportation</option>
              <option value="Utilities">Utilities & Bills</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Shopping">Shopping</option>
              <option value="Other">Other Expenses</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button 
          type="submit" 
          className="flex-1 bg-blue-600 text-white font-medium px-4 py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
        >
          {initialData ? 'Update' : 'Save'}
        </button>
        {initialData && (
          <button 
            type="button" 
            onClick={onCancelEdit} 
            className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 font-medium px-4 py-2.5 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 transition-all"
          >
            <XCircle className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TransactionForm;