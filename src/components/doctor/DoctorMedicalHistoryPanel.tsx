import type { Queue } from '../../lib/types'
import { formatDateId } from '../../lib/patientUtils'

interface DoctorMedicalHistoryPanelProps {
  history: Queue[]
  isLoading: boolean
  currentQueueId?: string
}

export default function DoctorMedicalHistoryPanel({
  history,
  isLoading,
  currentQueueId,
}: DoctorMedicalHistoryPanelProps) {
  const pastVisits = history.filter((visit) => visit.id !== currentQueueId)

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h3 className="font-['Manrope'] text-lg font-extrabold text-zinc-900">Riwayat Medis</h3>
        <p className="text-xs text-slate-500">Kunjungan sebelumnya yang telah selesai</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : pastVisits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm font-medium text-slate-500">Belum ada riwayat kunjungan</p>
            <p className="mt-1 text-xs text-slate-400">Riwayat akan muncul setelah pemeriksaan selesai</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {pastVisits.map((visit) => (
              <li
                key={visit.id}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-colors hover:border-indigo-100 hover:bg-indigo-50/30"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-indigo-700">
                      {visit.department?.name || 'Poli'}
                    </p>
                    <p className="text-[11px] text-slate-500">{formatDateId(visit.queueDate)}</p>
                  </div>
                  {visit.doctor?.user?.name && (
                    <span className="shrink-0 rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                      {visit.doctor.user.name}
                    </span>
                  )}
                </div>
                {visit.doctorNotes?.diagnosis ? (
                  <p className="text-sm font-semibold text-zinc-900">{visit.doctorNotes.diagnosis}</p>
                ) : (
                  <p className="text-sm italic text-slate-400">Diagnosis belum dicatat</p>
                )}
                {visit.doctorNotes?.medicationInstructions && (
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {visit.doctorNotes.medicationInstructions}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
