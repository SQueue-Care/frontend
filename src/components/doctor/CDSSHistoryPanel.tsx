import { useEffect, useState } from 'react';
import apiClient from '../../lib/apiClient';

interface CDSSResultItem {
  id: string;
  notes?: string;
  symptoms: string[];
  candidates: Array<{
    diagnosis: string;
    confidence: number;
    urgency?: string;
  }>;
  createdAt: string;
  patient?: {
    id: string;
    user: { name: string };
  };
}

export default function CDSSHistoryPanel() {
  const [results, setResults] = useState<CDSSResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<CDSSResultItem | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      fetchResults();
      setHasFetched(true);
    }
  }, [hasFetched]);

  const fetchResults = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/cdss/results?limit=20');
      setResults(res.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch CDSS results');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-950 font-['Manrope'] mb-1">
            Riwayat Analisis CDSS
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            Daftar analisis pasien yang telah dilakukan dengan AI.
          </p>
        </div>
        <button
          onClick={fetchResults}
          disabled={isLoading}
          className="px-4 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-300 text-sm"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-600 font-bold italic text-sm">{error}</div>
        ) : results.length === 0 ? (
          <div className="py-12 text-center text-slate-500 italic text-sm">
            Belum ada hasil analisis CDSS.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => setSelectedResult(result)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-zinc-900">
                      {result.patient?.user?.name || 'Unknown Patient'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {formatDate(result.createdAt)}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-violet-50 text-violet-600 border border-violet-200 rounded-md">
                    {result.candidates?.length || 0} diagnoses
                  </span>
                </div>

                <div className="mb-2">
                  <p className="text-xs text-slate-600 mb-2 font-semibold">Gejala:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.symptoms?.slice(0, 3).map((symptom, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] rounded-full">
                        {symptom}
                      </span>
                    ))}
                    {result.symptoms?.length > 3 && (
                      <span className="px-2 py-0.5 text-[11px] text-slate-500">
                        +{result.symptoms.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-slate-600 line-clamp-2">
                  <span className="font-semibold">Catatan:</span> {result.notes || '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-zinc-900">
                Detail Analisis CDSS
              </h2>
              <button
                onClick={() => setSelectedResult(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Pasien</p>
                <p className="text-base text-zinc-900 font-bold">
                  {selectedResult.patient?.user?.name || 'Unknown'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1">Tanggal Analisis</p>
                <p className="text-sm text-slate-600">{formatDate(selectedResult.createdAt)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Catatan</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                  {selectedResult.notes || '-'}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Gejala Teridentifikasi</p>
                <div className="flex flex-wrap gap-2">
                  {selectedResult.symptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-200 rounded-full"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-3">Kandidat Diagnosis</p>
                <div className="space-y-3">
                  {selectedResult.candidates.map((candidate, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-bold text-zinc-900">
                          {idx + 1}. {candidate.diagnosis}
                        </p>
                        {candidate.urgency && (
                          <span className="text-xs font-bold px-2 py-1 rounded-md bg-violet-50 text-violet-600 border border-violet-200">
                            {candidate.urgency.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500"
                          style={{ width: `${candidate.confidence * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {Math.round(candidate.confidence * 100)}% confidence
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-6 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
