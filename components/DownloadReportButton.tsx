'use client';

import { useState } from 'react';
import api from '@/lib/api';

export default function DownloadReportButton() {
  const [filter, setFilter] = useState<'daily'|'weekly'|'monthly'|'yearly'>('monthly');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const resp = await api.get('/reports/download', {
        params: { filter, date },
        responseType: 'blob',
      });
      // Normalize header value to string to satisfy TypeScript
      const contentType = String(resp.headers?.['content-type'] ?? '');

      // If server returned JSON (e.g., auth error) but axios requested blob,
      // the response will be a blob containing JSON. Detect and show message.
      if (contentType.includes('application/json')) {
        const text = await resp.data.text();
        let msg = 'Failed to download report';
        try {
          const obj = JSON.parse(text);
          msg = obj.message || text;
        } catch (e) {
          msg = text;
        }
        alert(msg);
        return;
      }

      const blob = new Blob([resp.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${filter}_${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as any)}
        className="border rounded px-2 py-1"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded px-2 py-1"
      />

      <button
        onClick={handleDownload}
        disabled={loading}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        {loading ? 'Preparing...' : 'Download PDF'}
      </button>
    </div>
  );
}
