import { useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { DoctorNotes, Queue } from '../../lib/types'
import { QueueStatus } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'

interface DoctorNotesModalProps {
  isOpen: boolean
  onClose: () => void
  queue: Queue | null
  onSaved?: () => void
}

function DoctorNotesModalContent({
  queue,
  onClose,
  onSaved,
}: {
  queue: Queue
  onClose: () => void
  onSaved?: () => void
}) {
  const showAlert = useAlertStore((s) => s.showAlert)
  const [diagnosis, setDiagnosis] = useState(queue.doctorNotes?.diagnosis ?? '')
  const [medicationInstructions, setMedicationInstructions] = useState(
    queue.doctorNotes?.medicationInstructions ?? ''
  )
  const [advice, setAdvice] = useState(queue.doctorNotes?.advice ?? '')
  const [isSaving, setIsSaving] = useState(false)

  const canEdit = (
    [QueueStatus.CALLED, QueueStatus.IN_PROGRESS, QueueStatus.DONE] as QueueStatus[]
  ).includes(queue.status)

  const handleSave = async () => {
    const payload: DoctorNotes = {
      diagnosis: diagnosis.trim() || null,
      medicationInstructions: medicationInstructions.trim() || null,
      advice: advice.trim() || null,
    }

    if (!payload.diagnosis && !payload.medicationInstructions && !payload.advice) {
      showAlert('Isi minimal satu bagian catatan dokter.', 'warning')
      return
    }

    setIsSaving(true)
    try {
      await apiClient.patch(`/queues/${queue.id}/doctor-notes`, payload)
      showAlert('Catatan dokter berhasil disimpan.', 'success')
      onSaved?.()
      onClose()
    } catch (err: unknown) {
      showAlert(getErrorMessage(err, 'Gagal menyimpan catatan dokter.'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 pt-24 sm:items-center sm:p-4 sm:pt-24">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity" onClick={onClose} />
        
        <div className="relative z-10 flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl dark:border dark:border-zinc-800 dark:bg-[#1e1f20]">
          
          {/* HEADER MODAL */}
          <div className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-zinc-800">
            <div>
              <h2 className="font-['Manrope'] text-xl font-bold text-zinc-900 dark:text-zinc-100">Catatan Medis Dokter</h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                {queue.patient?.user?.name || 'Pasien'} · Antrean No.{' '}
                <span className="font-mono font-bold text-amber-600 dark:text-amber-500">
                  {queue.department?.code || 'XX'}-{queue.queueNumber}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              type="button"
              aria-label="Tutup"
            >
              ✕
            </button>
          </div>

          {/* BODY MODAL */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 space-y-6">
            {!canEdit && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                Peringatan: Catatan medis hanya dapat diisi saat status antrean pasien sedang dipanggil, diperiksa, atau telah selesai.
              </div>
            )}

            {/* KELUHAN AWAL PASIEN */}
            {queue.notes?.trim() && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-zinc-800 dark:bg-[#131314]">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                  Keluhan Awal Pasien
                </p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-zinc-300">
                  {queue.notes}
                </p>
              </div>
            )}

            {/* FORM INPUT DIAGNOSIS */}
            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-zinc-400">
                Diagnosis Medis
              </label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                disabled={!canEdit || isSaving}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-zinc-800 placeholder-slate-400 transition-colors focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-200 dark:placeholder-zinc-600 dark:focus:border-amber-500 dark:focus:bg-[#1e1f20] dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-500"
                rows={3}
                placeholder="Contoh: ISPA ringan, hipertensi terkontrol..."
              />
            </div>

            {/* FORM INPUT RESEP */}
            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-zinc-400">
                Cara & Instruksi Obat
              </label>
              <textarea
                value={medicationInstructions}
                onChange={(e) => setMedicationInstructions(e.target.value)}
                disabled={!canEdit || isSaving}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-zinc-800 placeholder-slate-400 transition-colors focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-200 dark:placeholder-zinc-600 dark:focus:border-amber-500 dark:focus:bg-[#1e1f20] dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-500"
                rows={3}
                placeholder="Contoh: Paracetamol 500 mg, 3x sehari setelah makan..."
              />
            </div>

            {/* FORM INPUT SARAN */}
            <div>
              <label className="mb-2 block text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:text-zinc-400">
                Saran & Pengingat
              </label>
              <textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                disabled={!canEdit || isSaving}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-zinc-800 placeholder-slate-400 transition-colors focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-zinc-700 dark:bg-[#131314] dark:text-zinc-200 dark:placeholder-zinc-600 dark:focus:border-amber-500 dark:focus:bg-[#1e1f20] dark:disabled:bg-zinc-800/50 dark:disabled:text-zinc-500"
                rows={3}
                placeholder="Contoh: Istirahat cukup, minum air putih, kontrol jika demam &gt; 3 hari..."
              />
            </div>
          </div>

          {/* FOOTER MODAL */}
          <div className="shrink-0 border-t border-slate-200 bg-slate-50/50 px-6 py-4 dark:border-zinc-800 dark:bg-[#131314]/50">
            <button
              onClick={handleSave}
              disabled={!canEdit || isSaving}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-zinc-400 dark:border-t-transparent" />
                  Menyimpan Data...
                </>
              ) : (
                'Simpan Catatan Dokter'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function DoctorNotesModal({
  isOpen,
  onClose,
  queue,
  onSaved,
}: DoctorNotesModalProps) {
  if (!isOpen || !queue) return null
  return (
    <DoctorNotesModalContent
      key={queue.id}
      queue={queue}
      onClose={onClose}
      onSaved={onSaved}
    />
  )
}