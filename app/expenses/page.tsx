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
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Expenses</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              + Add Expense
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <ExpensesList onRefresh={refreshTrigger} />
          </div>
        </main>

        {/* Add Expense Modal */}
        <AddExpenseModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onExpenseAdded={() => setRefreshTrigger((prev) => prev + 1)}
        />
      </div>
    </ProtectedRoute>
  );
}
