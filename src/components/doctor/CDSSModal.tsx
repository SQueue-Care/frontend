import { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';

interface CDSSCandidate {
  diagnosis: string;
  confidence: number;
  reasoning: string;
  urgency?: 'low' | 'medium' | 'high';
  recommendedDepartment?: string;
}

interface CDSSResult {
  id: string;
  symptoms: string[];
  candidates: CDSSCandidate[];
  engine: string;
  disclaimer?: string;
  notes?: string;
  createdAt?: string;
}

interface CDSSModalProps {
  isOpen: boolean;
  onClose: () => void;
  queue: any | null;
}

export default function CDSSModal({ isOpen, onClose, queue }: CDSSModalProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CDSSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && queue?.id) {
      setNotes(queue.notes || '');
      setError(null);
      setResult(null);
      fetchResultByQueue();
    }
  }, [isOpen, queue?.id]);

  const fetchResultByQueue = async () => {
    if (!queue?.id) return;
    try {
      const res = await apiClient.get(`/cdss/by-queue/${queue.id}`);
      const result = res.data?.data;
      if (result) {
        setResult(result);
      } else {
        setResult(null);
      }
    } catch (err: any) {
      console.log('[CDSSModal] No existing CDSS result for this queue');
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!notes.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.post('/cdss/analyze-notes', {
        notes,
        patientId: queue?.patient?.id,
        queueId: queue?.id,
      });
      setResult(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Analisis gagal. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasExistingResult = !!result;

  const getUrgencyBadgeClasses = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-rose-50 text-rose-600 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'low':
      default:
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">🧠 Analisis CDSS</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Notes Input */}
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                Catatan Pasien
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-zinc-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all disabled:bg-slate-50"
                rows={5}
                placeholder="Masukkan keluhan/catatan pasien..."
              />
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !notes.trim()}
              className="w-full px-4 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Menganalisis...
                </>
              ) : hasExistingResult ? (
                <>
                  Analisa Ulang →
                </>
              ) : (
                <>
                  Analisa dengan AI →
                </>
              )}
            </button>

            {/* Existing result indicator */}
            {hasExistingResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                <p className="text-sm text-emerald-700 font-semibold">
                  ✓ Hasil analisis sudah ada di database
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-lg">
                <p className="text-sm text-rose-600 font-medium">❌ {error}</p>
              </div>
            )}

            {/* Results */}
            {result && (
              <>
                {/* Candidates */}
                <div>
                  <h3 className="text-sm font-bold text-zinc-700 uppercase tracking-widest mb-3">
                    Kandidat Diagnosis
                  </h3>
                  <div className="space-y-3">
                    {result.candidates.map((candidate, idx) => (
                      <div
                        key={idx}
                        className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-zinc-900">
                              {idx + 1}. {candidate.diagnosis}
                            </p>
                          </div>
                          {candidate.urgency && (
                            <span
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${getUrgencyBadgeClasses(candidate.urgency)}`}
                            >
                              {candidate.urgency === 'high' && '🔴'}
                              {candidate.urgency === 'medium' && '🟡'}
                              {candidate.urgency === 'low' && '🟢'}
                              {` ${candidate.urgency.toUpperCase()}`}
                            </span>
                          )}
                        </div>

                        {/* Confidence Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-600">Confidence</span>
                            <span className="text-xs font-bold text-slate-700">
                              {Math.round(candidate.confidence * 100)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 transition-all"
                              style={{ width: `${candidate.confidence * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Reasoning */}
                        <p className="text-sm text-slate-600 mb-2">{candidate.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-xs text-amber-700">
                    ⚠️ {result.disclaimer}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
