import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import type { PatientMedicalProfile, Queue } from '../../lib/types'
import { QueueStatus } from '../../lib/types'
import DoctorActivePatientPanel from './DoctorActivePatientPanel'
import DoctorMedicalHistoryPanel from './DoctorMedicalHistoryPanel'

interface DoctorPatientExaminationProps {
  queue: Queue
  hasBlockingPatient: boolean
  onUpdateStatus: (queueId: string, currentStatus: QueueStatus, nextStatus: QueueStatus) => void
  onOpenNotes: (queue: Queue) => void
  onOpenCdss: (queue: Queue) => void
}

export default function DoctorPatientExamination({
  queue,
  hasBlockingPatient,
  onUpdateStatus,
  onOpenNotes,
  onOpenCdss,
}: DoctorPatientExaminationProps) {
  const [medicalProfile, setMedicalProfile] = useState<PatientMedicalProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  useEffect(() => {
    const patientId = queue.patient?.id
    if (!patientId) return

    let cancelled = false

    apiClient
      .get(`/patients/${patientId}/medical-profile`)
      .then((response) => {
        if (!cancelled) {
          setMedicalProfile(response.data.data as PatientMedicalProfile)
        }
      })
      .catch(() => {
        if (!cancelled) setMedicalProfile(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProfile(false)
      })

    return () => {
      cancelled = true
    }
  }, [queue.patient?.id, queue.id])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <DoctorActivePatientPanel
          queue={queue}
          medicalProfile={medicalProfile}
          isLoadingProfile={isLoadingProfile}
          hasBlockingPatient={hasBlockingPatient}
          onUpdateStatus={onUpdateStatus}
          onOpenNotes={() => onOpenNotes(queue)}
          onOpenCdss={() => onOpenCdss(queue)}
        />
      </div>
      
      {/* REVISI: Trik Wrapper Absolut (Memaksa tinggi mengikuti panel kiri) */}
      <div className="relative min-h-[400px] lg:min-h-0">
        <div className="h-full w-full lg:absolute lg:inset-0">
          <DoctorMedicalHistoryPanel
            history={medicalProfile?.medicalHistory ?? []}
            isLoading={isLoadingProfile}
            currentQueueId={queue.id}
          />
        </div>
      </div>
    </div>
  )
}