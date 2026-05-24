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
      <div className="fixed inset-0 z-40 bg-black/50 transition-opacity" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white transition-colors dark:bg-[#1e1f20] shadow-lg">
          <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 transition-colors dark:border-zinc-800 bg-white transition-colors dark:bg-[#1e1f20] px-6 py-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 transition-colors dark:text-zinc-100 ">Catatan Dokter</h2>
              <p className="text-sm text-slate-500 transition-colors dark:text-zinc-400 ">
                {queue.patient?.user?.name || 'Pasien'} · No.{' '}
                {queue.department?.code || 'XX'}-{queue.queueNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 transition-colors dark:text-zinc-500 transition-colors hover:text-slate-600"
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="space-y-5 p-6">
            {!canEdit && (
              <div className="rounded-lg border border-amber-200 transition-colors dark:border-amber-500/20 bg-amber-50 transition-colors dark:bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
                Catatan dokter hanya dapat diisi saat pasien dipanggil, sedang diperiksa, atau
                setelah pemeriksaan selesai.
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 transition-colors dark:text-zinc-300 ">Diagnosis</label>
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                disabled={!canEdit || isSaving}
                className="w-full rounded-lg border border-slate-200 transition-colors dark:border-zinc-800 px-4 py-3 text-sm text-zinc-800 transition-colors dark:text-zinc-200 placeholder-slate-400 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:bg-slate-50"
                rows={3}
                placeholder="Contoh: ISPA ringan, hipertensi terkontrol..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 transition-colors dark:text-zinc-300 ">
                Cara Makan Obat
              </label>
              <textarea
                value={medicationInstructions}
                onChange={(e) => setMedicationInstructions(e.target.value)}
                disabled={!canEdit || isSaving}
                className="w-full rounded-lg border border-slate-200 transition-colors dark:border-zinc-800 px-4 py-3 text-sm text-zinc-800 transition-colors dark:text-zinc-200 placeholder-slate-400 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:bg-slate-50"
                rows={3}
                placeholder="Contoh: Paracetamol 500 mg, 3x sehari setelah makan..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-zinc-700 transition-colors dark:text-zinc-300 ">
                Saran & Pengingat
              </label>
              <textarea
                value={advice}
                onChange={(e) => setAdvice(e.target.value)}
                disabled={!canEdit || isSaving}
                className="w-full rounded-lg border border-slate-200 transition-colors dark:border-zinc-800 px-4 py-3 text-sm text-zinc-800 transition-colors dark:text-zinc-200 placeholder-slate-400 transition-all focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:bg-slate-50"
                rows={3}
                placeholder="Contoh: Istirahat cukup, minum air putih, kontrol jika demam &gt; 3 hari..."
              />
            </div>

            {queue.notes?.trim() && (
              <div className="rounded-lg border border-slate-200 transition-colors dark:border-zinc-800 bg-slate-50 transition-colors dark:bg-[#131314] p-4">
                <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 transition-colors dark:text-zinc-400 uppercase">
                  Keluhan awal pasien
                </p>
                <p className="text-sm whitespace-pre-wrap text-slate-700 transition-colors dark:text-zinc-300 ">{queue.notes}</p>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!canEdit || isSaving}
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 font-bold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Menyimpan...
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
