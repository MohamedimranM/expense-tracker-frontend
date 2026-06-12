'use client';

import { useState, useEffect } from 'react';
import { expenseAPI } from '@/lib/api';
import { format } from 'date-fns';

interface ExpensesListProps {
  onRefresh?: number;
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
    // if (!window.confirm('Are you sure you want to delete this expense?')) return;

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
    return <div className="text-center py-8">Loading expenses...</div>;
  }

  if (expenses.length === 0) {
    return <div className="text-center py-8 text-gray-600">No expenses yet</div>;
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <div key={expense._id} className="card flex justify-between items-center">
          <div className="flex-1">
            {/* <h4 className="font-semibold">{expense.description}</h4> */}
            <p className="text-sm text-gray-600">
             <span className='font-semibold'>{expense.category} </span> • {format(new Date(expense.date), 'MMM dd, yyyy')}
            </p>
            {expense.notes && <p className="text-sm text-gray-500 mt-1"><span className="font-bold">Notes:</span> {expense.notes}</p>}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-lg text-blue-600">AED {expense.amount.toFixed(2)}</p>
            </div>
            <button
              onClick={() => handleDelete(expense._id)}
              disabled={deleteLoading === expense._id}
              className="btn btn-danger"
            >
              {deleteLoading === expense._id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
