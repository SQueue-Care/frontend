import { hasDoctorNotes } from '../../lib/doctorNotes'
import type { DoctorNotes } from '../../lib/types'

interface DoctorNotesDisplayProps {
  doctorNotes?: DoctorNotes | null
  emptyMessage?: string
}

export default function DoctorNotesDisplay({
  doctorNotes,
  emptyMessage = 'Pemeriksaan selesai. Dokter tidak meninggalkan catatan pengingat khusus.',
}: DoctorNotesDisplayProps) {
  if (!hasDoctorNotes(doctorNotes)) {
    return (
      <p className="text-sm leading-relaxed font-normal text-slate-400 italic dark:text-zinc-500">
        {emptyMessage}
      </p>
    )
  }

  const sections = [
    { label: 'Diagnosis', value: doctorNotes?.diagnosis },
    { label: 'Cara Makan Obat', value: doctorNotes?.medicationInstructions },
    { label: 'Saran & Pengingat', value: doctorNotes?.advice },
  ]

  return (
    <div className="space-y-4">
      {sections.map(
        (section) =>
          section.value?.trim() && (
            <div key={section.label}>
              <p className="mb-1 text-[10px] font-black tracking-widest text-amber-700 uppercase dark:text-amber-500">
                {section.label}
              </p>
              <p className="text-sm leading-relaxed font-semibold whitespace-pre-wrap text-zinc-800 dark:text-amber-100">
                {section.value}
              </p>
            </div>
          )
      )}
    </div>
  )
}

export function DoctorNotesSection({
  doctorNotes,
  variant = 'panel',
}: DoctorNotesDisplayProps & { variant?: 'panel' | 'page' }) {
  const wrapperClass =
    variant === 'page'
      ? 'animate-in fade-in rounded-3xl border border-amber-200 bg-amber-50/60 p-6 shadow-sm duration-500 dark:border-amber-900/50 dark:bg-amber-900/10 lg:col-span-3'
      : 'animate-in fade-in duration-500'

  const innerClass =
    variant === 'page'
      ? ''
      : 'rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm transition-colors dark:border-amber-900/50 dark:bg-amber-900/10'

  return (
    <div className={wrapperClass}>
      <h4 className="mb-3 border-b border-amber-200 pb-2 text-[10px] font-black tracking-widest text-amber-600 uppercase transition-colors dark:border-amber-900/50 dark:text-amber-500">
        Catatan Dokter & Pengingat Penyakit
      </h4>
      <div className={innerClass}>
        <DoctorNotesDisplay doctorNotes={doctorNotes} />
      </div>
    </div>
  )
}
