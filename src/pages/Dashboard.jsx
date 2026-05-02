import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import { TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Month Filter State
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data);
    } catch (err) {
      toast.error('Failed to fetch transactions', { id: 'fetch_err' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line
  }, []);

  const handleTransactionSaved = () => {
    fetchTransactions();
    setEditingTransaction(null);
  };

  const handleEditTransaction = (tx) => {
    setEditingTransaction(tx);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  // Filter transactions based on selected month and year
  const filteredTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate.getMonth() === Number(selectedMonth) && txDate.getFullYear() === Number(selectedYear);
  });

  const totalIncome = filteredTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = filteredTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const balance = totalIncome - totalExpense;

  // Breakdown Object
  const expensesByCategory = filteredTransactions
    .filter((tx) => tx.type === 'expense' && tx.category)
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

  // Prepare data for Recharts PieChart
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Filter Section */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <div className="flex gap-2">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <option key={i} value={i}>
                  {new Date(0, i).toLocaleString('en', { month: 'long' })}
                </option>
              ))}
            </select>
            <input 
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm font-medium w-24 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Balance</p>
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mt-1"></div>
              ) : (
                <h3 className={`text-3xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  Rp {balance.toLocaleString('id-ID')}
                </h3>
              )}
            </div>
            <div className={`p-4 rounded-full ${balance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>
              <DollarSign className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Income</p>
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mt-1"></div>
              ) : (
                <h3 className="text-3xl font-bold text-green-600">
                  Rp {totalIncome.toLocaleString('id-ID')}
                </h3>
              )}
            </div>
            <div className="bg-green-50 p-4 rounded-full text-green-600">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Total Expense</p>
              {isLoading ? (
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mt-1"></div>
              ) : (
                <h3 className="text-3xl font-bold text-red-500">
                  Rp {totalExpense.toLocaleString('id-ID')}
                </h3>
              )}
            </div>
            <div className="bg-red-50 p-4 rounded-full text-red-600">
              <TrendingDown className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar - Form & Chart */}
          <div className="lg:col-span-4 space-y-6">
            <TransactionForm 
              onTransactionSaved={handleTransactionSaved} 
              initialData={editingTransaction}
              onCancelEdit={handleCancelEdit}
            />

            {/* Expense Breakdown Pie Chart */}
            {!isLoading && pieData.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="w-5 h-5 text-gray-500" />
                  <h3 className="text-gray-800 font-bold text-lg">Expense Breakdown</h3>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`} 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3 mt-2">
                  {pieData.sort((a, b) => b.value - a.value).map((entry, index) => (
                    <div key={entry.name} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-gray-600">{entry.name}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {((entry.value / totalExpense) * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Main Content - Transaction List */}
          <div className="lg:col-span-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Transactions ({new Date(0, selectedMonth).toLocaleString('en', { month: 'short' })} {selectedYear})</h2>
              </div>
              <TransactionList 
                transactions={filteredTransactions} 
                isLoading={isLoading}
                onTransactionDeleted={fetchTransactions}
                onEditTransaction={handleEditTransaction}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;