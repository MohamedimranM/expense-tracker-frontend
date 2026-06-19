'use client';

import { useState, useEffect } from 'react';
import { expenseAPI } from '@/lib/api';
import { format } from 'date-fns';

interface ExpensesListProps {
  onRefresh?: number;
}

const CATEGORY_BADGE: Record<string, string> = {
  'Food':              'bg-orange-100 text-orange-700',
  'Snack and Drinks':  'bg-yellow-100 text-yellow-700',
  'Transportation':    'bg-blue-100 text-blue-700',
  'Entertainment':     'bg-purple-100 text-purple-700',
  'Utilities':         'bg-teal-100 text-teal-700',
  'Healthcare':        'bg-red-100 text-red-700',
  'Shopping':          'bg-pink-100 text-pink-700',
  'Education':         'bg-indigo-100 text-indigo-700',
  'Other':             'bg-slate-100 text-slate-600',
};

function getBadge(category: string) {
  return CATEGORY_BADGE[category] ?? 'bg-violet-100 text-violet-700';
}

export const ExpensesList = ({ onRefresh }: ExpensesListProps) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, [onRefresh]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await expenseAPI.getAll();
      setExpenses(response.data.expenses);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoading(id);
    try {
      await expenseAPI.delete(id);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense');
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        </div>
        <p className="text-slate-600 font-semibold mb-1">No expenses yet</p>
        <p className="text-slate-400 text-sm">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => (
        <div
          key={expense._id}
          className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
        >
          {/* Category badge */}
          <div className="shrink-0">
            <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${getBadge(expense.category)}`}>
              {expense.category}
            </span>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
            {expense.notes && (
              <p className="text-sm text-slate-600 truncate mt-0.5">{expense.notes}</p>
            )}
          </div>

          {/* Amount */}
          <div className="shrink-0 text-right">
            <p className="text-base font-bold text-slate-900">AED {expense.amount.toFixed(2)}</p>
          </div>

          {/* Delete button */}
          <button
            onClick={() => handleDelete(expense._id)}
            disabled={deleteLoading === expense._id}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
            title="Delete expense"
          >
            {deleteLoading === expense._id ? (
              <svg className="w-4 h-4 animate-spin text-red-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      ))}
    </div>
  );
};
