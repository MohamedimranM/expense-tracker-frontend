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
    if (timeFrame === 'daily') newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    else if (timeFrame === 'weekly') newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    else if (timeFrame === 'monthly') newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    else if (timeFrame === 'yearly') newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getDateLabel = () => {
    switch (timeFrame) {
      case 'daily':   return format(selectedDate, 'MMMM dd, yyyy');
      case 'weekly':  return `Week of ${format(selectedDate, 'MMM dd, yyyy')}`;
      case 'monthly': return format(selectedDate, 'MMMM yyyy');
      case 'yearly':  return selectedDate.getFullYear().toString();
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        {/* Page header */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs text-slate-500 mt-0.5">Track and analyze your expenses</p>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Time frame + date navigation */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
            {/* Pill tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-5">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((frame) => (
                <button
                  key={frame}
                  onClick={() => setTimeFrame(frame)}
                  className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    timeFrame === frame
                      ? 'bg-white text-violet-700 shadow-sm font-semibold'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {frame}
                </button>
              ))}
            </div>

            {/* Date nav */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleDateChange('prev')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline">Previous</span>
              </button>

              <span className="text-sm sm:text-base font-semibold text-slate-800">{getDateLabel()}</span>

              <button
                onClick={() => handleDateChange('next')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <DashboardStats timeFrame={timeFrame} date={selectedDate} refresh={refreshTrigger} />
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
