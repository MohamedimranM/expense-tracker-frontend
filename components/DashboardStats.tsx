'use client';

import { useState, useEffect } from 'react';
import { dashboardAPI } from '@/lib/api';
import { format } from 'date-fns';
import DownloadReportButton from './DownloadReportButton';

interface DashboardStatsProps {
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'yearly';
  date: Date;
}

export const DashboardStats = ({ timeFrame, date }: DashboardStatsProps) => {
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
          case 'daily':
            data = await dashboardAPI.getDaily(dateStr);
            break;
          case 'weekly':
            data = await dashboardAPI.getWeekly(dateStr);
            break;
          case 'monthly':
            data = await dashboardAPI.getMonthly(year, month);
            break;
          case 'yearly':
            data = await dashboardAPI.getYearly(year);
            break;
        }

        setStats(data.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeFrame, date]);

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600">
        Loading...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-600">
        No data available
      </div>
    );
  }

  const categoryStats = Object.entries(stats.byCategory || {}).map(
    ([category, amount]) => ({
      category,
      amount: amount as number,
    })
  );

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

    <div className="space-y-6 px-2 sm:px-4 lg:px-0">
      <div className="flex justify-end">
        <DownloadReportButton />
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card w-full">
          <h3 className="text-gray-600 text-sm font-medium mb-2">
            Total Spending
          </h3>

          <p className="text-2xl sm:text-3xl font-bold text-blue-600 wrap-break-word">
            AED {stats.total?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="card w-full">
          <h3 className="text-gray-600 text-sm font-medium mb-2">
            Number of Expenses
          </h3>

          <p className="text-2xl sm:text-3xl font-bold text-green-600">
            {stats.count || 0}
          </p>
        </div>

        <div className="card w-full">
  <h3 className="text-gray-600 text-sm font-medium mb-2">
    Today's Spending
  </h3>

  <p className="text-2xl sm:text-3xl font-bold text-orange-600">
    AED {todaysTotal.toFixed(2)}
  </p>

  <p className="text-xs text-gray-500 mt-2">
    {format(date, 'dd MMM yyyy')}
  </p>
</div>

        {stats.average && (
          <div className="card w-full sm:col-span-2 lg:col-span-1">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Average Expense
            </h3>

            <p className="text-2xl sm:text-3xl font-bold text-purple-600 wrap-break-word">
              AED {stats.average?.toFixed(2) || '0.00'}
            </p>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {categoryStats.length > 0 && (
        <div className="card w-full overflow-hidden">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Spending by Category
          </h3>

          <div className="space-y-4">
            {categoryStats.map(({ category, amount }) => (
              <div key={category}>
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <span className="text-sm font-medium wrap-break-word">
                    {category}
                  </span>

                  <span className="text-sm font-semibold">
                    AED {amount.toFixed(2)}
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width:
                        stats.total > 0
                          ? `${(amount / stats.total) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses List */}
      {filteredExpenses?.length > 0 && (
        <div className="card w-full">
          <h3 className="text-base sm:text-lg font-semibold mb-4">
            Expenses for {format(date, 'dd MMM yyyy')}
          </h3>

          <div className="space-y-3 max-h-100 overflow-y-auto pr-1">
            {filteredExpenses.map((exp: any) => (
              <div
                key={exp._id || exp.createdAt}
                className="p-3 sm:p-4 rounded-lg border border-gray-200 bg-gray-50"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  {/* <p className="font-medium text-gray-800 wrap-break-word">
                    {exp.description}
                  </p> */}

                  <p className="text-sm font-semibold text-blue-600">
                    AED {Number(exp.amount).toFixed(2)}
                  </p>
                </div>

                <div className="flex flex-wrap justify-between gap-2 text-xs text-gray-500 mt-2">
                  <span>{exp.category}</span>

                  <span>
                    {format(new Date(exp.date), 'dd MMM yyyy')}
                  </span>
                </div>

                {exp.notes && (
                  <p className="text-sm text-gray-600 mt-3 wrap-break-word">
                    💬 {exp.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredExpenses?.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500">
            No expenses found for {format(date, 'dd MMM yyyy')}
          </p>
        </div>
      )}
    </div>
  );
};