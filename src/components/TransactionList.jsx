import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, ArrowUpRight, ArrowDownRight, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
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

const TransactionList = ({ transactions, onTransactionDeleted, onEditTransaction, isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Membatasi 8 baris per halaman

  // Reset ke halaman 1 jika ada filter atau array berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions.length]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        toast.success('Transaction deleted');
        onTransactionDeleted();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error deleting transaction');
      }
    }
  };

  // Logic Pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = transactions.slice(startIndex, startIndex + itemsPerPage);

  const renderSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
      <tr key={index} className="animate-pulse">
        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
        <td className="py-4 px-4">
          <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </td>
        <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24 float-right"></div></td>
        <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div></td>
      </tr>
    ))
  );

  return (
    <div className="w-full flex flex-col h-full">
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Date</th>
              <th className="py-3 px-4 font-semibold">Transaction</th>
              <th className="py-3 px-4 font-semibold text-right">Amount</th>
              <th className="py-3 px-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {isLoading ? (
              renderSkeleton()
            ) : currentItems.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-12 text-gray-500 bg-gray-50/50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <Tag className="w-8 h-8 text-gray-300 mb-3" />
                    <p>No transactions found for this period.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="py-4 px-4 text-gray-500 whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{tx.description}</div>
                    {tx.category && (
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Tag className="w-3 h-3" /> {tx.category}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1 font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      Rp {Number(tx.amount).toLocaleString('id-ID')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing <span className="font-medium text-gray-700">{startIndex + 1}</span> to <span className="font-medium text-gray-700">{Math.min(startIndex + itemsPerPage, transactions.length)}</span> of <span className="font-medium text-gray-700">{transactions.length}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-600 px-2">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;