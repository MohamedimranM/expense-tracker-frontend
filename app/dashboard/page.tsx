'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AddExpenseModal } from '@/components/AddExpenseModal';
import { DashboardStats } from '@/components/DashboardStats';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (timeFrame === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (timeFrame === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (timeFrame === 'monthly') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (timeFrame === 'yearly') {
      newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const getDateLabel = () => {
    switch (timeFrame) {
      case 'daily':
        return format(selectedDate, 'MMMM dd, yyyy');
      case 'weekly':
        return `Week of ${format(selectedDate, 'MMM dd, yyyy')}`;
      case 'monthly':
        return format(selectedDate, 'MMMM yyyy');
      case 'yearly':
        return selectedDate.getFullYear().toString();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              + Add Expense
            </button>
          </div>

          {/* Time Frame Selector */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex gap-4 flex-wrap">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((frame) => (
                <button
                  key={frame}
                  onClick={() => setTimeFrame(frame)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors capitalize ${
                    timeFrame === frame
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {frame}
                </button>
              ))}
            </div>

            {/* Date Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => handleDateChange('prev')}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                ← Previous
              </button>
              <span className="text-lg font-semibold">{getDateLabel()}</span>
              <button
                onClick={() => handleDateChange('next')}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Next →
              </button>
            </div>
          </div>

          {/* Stats */}
          <DashboardStats timeFrame={timeFrame} date={selectedDate} />
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
