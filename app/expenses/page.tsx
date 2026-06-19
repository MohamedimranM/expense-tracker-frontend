'use client';

import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { ExpensesList } from '@/components/ExpensesList';
import { useState } from 'react';

export default function ExpensesPage() {
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        {/* Page header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-900">My Expenses</h1>
              <p className="text-xs text-slate-500 mt-0.5">All your expense records in one place</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6">
            <ExpensesList onRefresh={refreshTrigger} />
          </div>
        </main>

        <AddExpenseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onExpenseAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </div>
    </ProtectedRoute>
  );
}
