'use client';

import { useState, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api';
import { format } from 'date-fns';
import DownloadReportButton from './DownloadReportButton';

interface DashboardStatsProps {
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
  refresh?: number;
}

const CATEGORY_COLORS: Record<string, { bar: string; badge: string }> = {
  'Food':              { bar: 'bg-orange-500',  badge: 'bg-orange-100 text-orange-700' },
  'Snack and Drinks':  { bar: 'bg-yellow-500',  badge: 'bg-yellow-100 text-yellow-700' },
  'Transportation':    { bar: 'bg-blue-500',    badge: 'bg-blue-100 text-blue-700' },
  'Entertainment':     { bar: 'bg-purple-500',  badge: 'bg-purple-100 text-purple-700' },
  'Utilities':         { bar: 'bg-teal-500',    badge: 'bg-teal-100 text-teal-700' },
  'Healthcare':        { bar: 'bg-red-500',     badge: 'bg-red-100 text-red-700' },
  'Shopping':          { bar: 'bg-pink-500',    badge: 'bg-pink-100 text-pink-700' },
  'Education':         { bar: 'bg-indigo-500',  badge: 'bg-indigo-100 text-indigo-700' },
  'Other':             { bar: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600' },
};

function getCategoryStyle(category: string) {
  return CATEGORY_COLORS[category] ?? { bar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700' };
}

export const DashboardStats = ({ timeFrame, date, refresh }: DashboardStatsProps) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        let data;
        const dateStr = format(date, 'yyyy-MM-dd');
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        switch (timeFrame) {
          case 'daily':   data = await dashboardAPI.getDaily(dateStr); break;
          case 'weekly':  data = await dashboardAPI.getWeekly(dateStr); break;
          case 'monthly': data = await dashboardAPI.getMonthly(year, month); break;
          case 'yearly':  data = await dashboardAPI.getYearly(year); break;
        }
        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [timeFrame, date, refresh]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card text-center py-16">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">No data available</p>
      </div>
    );
  }

  const categoryStats = Object.entries(stats.byCategory || {}).map(([category, amount]) => ({
    category,
    amount: amount as number,
  }));

  const filteredExpenses = stats.expenses?.filter((exp: any) => {
    const expDate = new Date(exp.date);
    const selectedDate = new Date(date);
    return (
      expDate.getFullYear() === selectedDate.getFullYear() &&
      expDate.getMonth() === selectedDate.getMonth() &&
      expDate.getDate() === selectedDate.getDate()
    );
  });

  const todaysTotal = filteredExpenses?.reduce(
    (total: number, exp: any) => total + Number(exp.amount),
    0
  ) || 0;

  console.log(stats);

  return (
    <div className="space-y-6">
      {/* Download report */}
      <div className="flex justify-end">
        <DownloadReportButton />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Spending */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Spending</p>
            <p className="text-2xl font-bold text-violet-600 truncate">AED {stats.total?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Number of Expenses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Transactions</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.count || 0}</p>
          </div>
        </div>

        {/* Today's Spending */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Today&apos;s Spending</p>
            <p className="text-2xl font-bold text-amber-600 truncate">AED {todaysTotal.toFixed(2)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{format(date, 'dd MMM yyyy')}</p>
          </div>
        </div>

        {/* Average Expense */}
        {stats.average && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 sm:col-span-2 lg:col-span-1">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Avg. Expense</p>
              <p className="text-2xl font-bold text-blue-600 truncate">AED {stats.average?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Category breakdown */}
      {categoryStats.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-5">
            Spending by Category
          </h3>
          <div className="space-y-4">
            {categoryStats.map(({ category, amount }) => {
              const pct = stats.total > 0 ? (amount / stats.total) * 100 : 0;
              const { bar, badge } = getCategoryStyle(category);
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>
                      {category}
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800">AED {amount.toFixed(2)}</span>
                      <span className="text-xs text-slate-400 ml-1.5">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`${bar} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's expense list */}
      {filteredExpenses?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
            Expenses for {format(date, 'dd MMM yyyy')}
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredExpenses.map((exp: any) => {
              const { badge } = getCategoryStyle(exp.category);
              return (
                <div
                  key={exp._id || exp.createdAt}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${badge}`}>
                      {exp.category}
                    </span>
                    {exp.notes && (
                      <p className="text-xs text-slate-500 truncate">{exp.notes}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">AED {Number(exp.amount).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">{format(new Date(exp.date), 'dd MMM')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredExpenses?.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">No expenses for {format(date, 'dd MMM yyyy')}</p>
        </div>
      )}
    </div>
  );
};
