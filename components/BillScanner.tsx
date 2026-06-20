'use client';

import { useRef, useState } from 'react';
import { BillScanResult } from '@/lib/api';
import { parseReceiptText } from '@/lib/parseReceipt';

interface BillScannerProps {
  onScanComplete: (data: BillScanResult) => void;
  onCancel: () => void;
}

export const BillScanner = ({ onScanComplete, onCancel }: BillScannerProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError('');
    setProgress(0);
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setProgress(0);
    setStatusText('Loading OCR engine...');
    setError('');

    try {
      const { default: Tesseract } = await import('tesseract.js');

      const result = await Tesseract.recognize(file, 'eng', {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'loading tesseract core') {
            setStatusText('Loading OCR engine...');
            setProgress(Math.round(m.progress * 20));
          } else if (m.status === 'initializing api') {
            setStatusText('Initialising...');
            setProgress(20 + Math.round(m.progress * 20));
          } else if (m.status === 'recognizing text') {
            setStatusText('Reading bill...');
            setProgress(40 + Math.round(m.progress * 60));
          }
        },
      });

      const parsed = parseReceiptText(result.data.text);
      onScanComplete(parsed);
    } catch {
      setError('Could not read the bill. Try a clearer, well-lit photo.');
    } finally {
      setScanning(false);
      setProgress(0);
      setStatusText('');
    }
  };

  const handleRetake = () => {
    setPreview(null);
    setFile(null);
    setError('');
    setProgress(0);
    setStatusText('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-violet-200 rounded-xl p-8 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 transition-colors"
        >
          <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700">Take a photo of your bill</p>
          <p className="text-xs text-slate-400 mt-1">Tap to open camera or choose from gallery</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
            <img src={preview} alt="Bill preview" className="w-full max-h-52 object-contain" />
          </div>

          {scanning && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>{statusText}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button type="button" onClick={handleRetake} disabled={scanning} className="flex-1 btn btn-secondary">
              Retake
            </button>
            <button type="button" onClick={handleScan} disabled={scanning} className="flex-1 btn btn-primary">
              {scanning ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Reading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Read Bill
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
      >
        Fill form manually instead
      </button>
    </div>
  );
};
