// src/components/AdminServiceManagement.tsx
import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { Department } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useDepartmentStore } from '../../store/departmentStore'

interface ScheduleItem {
  id: string
  doctorId: string
  departmentId: string
  dayOfWeek: string
  startTime: string
  endTime: string
  capacity: number
  doctor?: { user?: { name?: string } }
  department?: { name?: string }
}

export default function AdminServiceManagement() {
  const { departments, fetchDepartments } = useDepartmentStore()
  const showAlert = useAlertStore((s) => s.showAlert)

  const [servicesTab, setServicesTab] = useState<'departments' | 'schedules'>('departments')
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false)

  // Filter Jadwal
  const [selectedScheduleDeptFilter, setSelectedScheduleDeptFilter] = useState<string>('')
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('')

  // State Modal Departemen
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false)
  const [deptFormMode, setDeptFormMode] = useState<'add' | 'edit'>('add')
  const [selectedDept, setSelectedDept] = useState<Department | null>(null)
  const [deptFormData, setDeptFormData] = useState({ name: '', code: '', description: '' })

  // State Modal Jadwal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleFormMode, setScheduleFormMode] = useState<'add' | 'edit'>('add')
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleItem | null>(null)
  const [scheduleFormData, setScheduleFormData] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    capacity: 10,
  })

  // Sinkronisasi Data Awal
  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  useEffect(() => {
    if (servicesTab !== 'schedules') return

    let cancelled = false
    void (async () => {
      setIsLoadingSchedules(true)
      try {
        const response = await apiClient.get('/schedules')
        if (!cancelled) setSchedules(response.data.data || [])
      } catch (error: unknown) {
        console.error('Gagal memuat schedules:', error)
        if (!cancelled) setSchedules([])
      } finally {
        if (!cancelled) setIsLoadingSchedules(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [servicesTab])

  // Handler Departemen
  const handleOpenDeptModal = (mode: 'add' | 'edit', dept?: Department) => {
    setDeptFormMode(mode)
    if (mode === 'edit' && dept) {
      setSelectedDept(dept)
      setDeptFormData({ name: dept.name, code: dept.code, description: dept.description || '' })
    } else {
      setDeptFormData({ name: '', code: '', description: '' })
    }
    setIsDeptModalOpen(true)
  }

  const handleCloseDeptModal = () => {
    setIsDeptModalOpen(false)
    setSelectedDept(null)
    setDeptFormData({ name: '', code: '', description: '' })
  }

  const handleSaveDept = async () => {
    if (!deptFormData.name || !deptFormData.code) {
      showAlert('Nama dan kode departemen harus diisi', 'warning')
      return
    }

    try {
      if (deptFormMode === 'add') {
        await apiClient.post('/departments', deptFormData)
        showAlert('Departemen berhasil ditambahkan!', 'success')
      } else if (selectedDept) {
        await apiClient.patch(`/departments/${selectedDept.id}`, deptFormData)
        showAlert('Departemen berhasil diperbarui!', 'success')
      }
      handleCloseDeptModal()
      fetchDepartments()
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal menyimpan departemen.'), 'error')
    }
  }

  const handleDeleteDept = async (deptId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus departemen ini?')) return

    try {
      await apiClient.delete(`/departments/${deptId}`)
      showAlert('Departemen berhasil dihapus!', 'success')
      fetchDepartments()
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal menghapus departemen.'), 'error')
    }
  }

  // Handler Jadwal
  const handleOpenScheduleModal = (mode: 'add' | 'edit', schedule?: ScheduleItem) => {
    setScheduleFormMode(mode)
    if (mode === 'edit' && schedule) {
      setSelectedSchedule(schedule)
      setScheduleFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        capacity: schedule.capacity,
      })
    } else {
      setScheduleFormData({ dayOfWeek: '', startTime: '', endTime: '', capacity: 10 })
    }
    setIsScheduleModalOpen(true)
  }

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false)
    setSelectedSchedule(null)
    setScheduleFormData({ dayOfWeek: '', startTime: '', endTime: '', capacity: 10 })
  }

  const handleSaveSchedule = async () => {
    if (!scheduleFormData.dayOfWeek || !scheduleFormData.startTime || !scheduleFormData.endTime) {
      showAlert('Hari, jam mulai, dan jam selesai harus diisi', 'warning')
      return
    }

    if (!selectedScheduleDeptFilter || !selectedDoctorFilter) {
      showAlert(
        'Anda wajib memilih Departemen dan Dokter terlebih dahulu pada filter area kerja.',
        'warning'
      )
      return
    }

    try {
      const payload = {
        doctorId: selectedDoctorFilter,
        dayOfWeek: scheduleFormData.dayOfWeek,
        startTime: scheduleFormData.startTime,
        endTime: scheduleFormData.endTime,
        capacity: Number(scheduleFormData.capacity),
        departmentId: selectedScheduleDeptFilter,
      }

      if (scheduleFormMode === 'add') {
        await apiClient.post('/schedules', payload)
        showAlert('Jadwal berhasil ditambahkan!', 'success')
      } else if (selectedSchedule) {
        await apiClient.patch(`/schedules/${selectedSchedule.id}`, payload)
        showAlert('Jadwal berhasil diperbarui!', 'success')
      }
      handleCloseScheduleModal()
      const response = await apiClient.get('/schedules')
      setSchedules(response.data.data || [])
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal menyimpan jadwal.'), 'error')
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return

    try {
      await apiClient.delete(`/schedules/${scheduleId}`)
      showAlert('Jadwal berhasil dihapus!', 'success')
      const response = await apiClient.get('/schedules')
      setSchedules(response.data.data || [])
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal menghapus jadwal.'), 'error')
    }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950">
          Manajemen Layanan
        </h1>
        <p className="text-slate-600">Kelola departemen dan jadwal layanan poliklinik.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setServicesTab('departments')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            servicesTab === 'departments'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manajemen Departemen
        </button>
        <button
          onClick={() => setServicesTab('schedules')}
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            servicesTab === 'schedules'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manajemen Jadwal
        </button>
      </div>

      {/* TAMPILAN DEPARTEMEN */}
      {servicesTab === 'departments' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">Daftar Departemen</h2>
            <button
              onClick={() => handleOpenDeptModal('add')}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              + Tambah Departemen
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="p-4 pl-6 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Nama Departemen
                  </th>
                  <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Kode
                  </th>
                  <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Deskripsi
                  </th>
                  <th className="p-4 pr-6 text-right text-xs font-bold tracking-wider text-slate-500 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white text-sm font-medium text-zinc-900">
                {departments.map((dept: Department) => (
                  <tr
                    key={dept.id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="p-4 pl-6 font-bold">{dept.name}</td>
                    <td className="p-4">
                      <span className="inline-block rounded-lg bg-slate-100 px-3 py-1 font-mono text-xs font-extrabold text-slate-700">
                        {dept.code}
                      </span>
                    </td>
                    <td className="max-w-xs truncate p-4 text-sm text-slate-500">
                      {dept.description || '-'}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDeptModal('edit', dept)}
                          className="rounded-lg border border-transparent p-1.5 text-blue-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          title="Edit"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteDept(dept.id)}
                          className="rounded-lg border border-transparent p-1.5 text-rose-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                          title="Hapus"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAMPILAN JADWAL */}
      {servicesTab === 'schedules' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Departemen
                </label>
                <select
                  value={selectedScheduleDeptFilter}
                  onChange={(e) => {
                    setSelectedScheduleDeptFilter(e.target.value)
                    setSelectedDoctorFilter('')
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-slate-300 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Pilih Departemen...</option>
                  {departments.map((dept: Department) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Dokter</label>
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-slate-300 focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                  disabled={!selectedScheduleDeptFilter}
                >
                  <option value="">Pilih Dokter...</option>
                  {schedules
                    .filter((s: ScheduleItem) => s.departmentId === selectedScheduleDeptFilter)
                    .reduce((acc: ScheduleItem[], s: ScheduleItem) => {
                      if (!acc.find((d) => d.doctorId === s.doctorId)) acc.push(s)
                      return acc
                    }, [])
                    .map((s: ScheduleItem) => (
                      <option key={s.doctorId} value={s.doctorId}>
                        {s.doctor?.user?.name || '-'}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {selectedDoctorFilter && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Jadwal Mingguan</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {
                      schedules.find((s: ScheduleItem) => s.doctorId === selectedDoctorFilter)
                        ?.doctor?.user?.name
                    }{' '}
                    -
                    {
                      schedules.find((s: ScheduleItem) => s.doctorId === selectedDoctorFilter)
                        ?.department?.name
                    }
                  </p>
                </div>
                <button
                  onClick={() => handleOpenScheduleModal('add')}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  + Tambah Jadwal
                </button>
              </div>

              {isLoadingSchedules ? (
                <div className="flex justify-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
                </div>
              ) : schedules.filter((s: ScheduleItem) => s.doctorId === selectedDoctorFilter)
                  .length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500 italic">
                  Tidak ada jadwal untuk dokter ini
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        <th className="p-4 pl-6 text-xs font-bold tracking-wider text-slate-500 uppercase">
                          Hari
                        </th>
                        <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                          Jam Mulai
                        </th>
                        <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                          Jam Selesai
                        </th>
                        <th className="p-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                          Kapasitas
                        </th>
                        <th className="p-4 pr-6 text-right text-xs font-bold tracking-wider text-slate-500 uppercase">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white text-sm font-medium text-zinc-900">
                      {schedules
                        .filter((s: ScheduleItem) => s.doctorId === selectedDoctorFilter)
                        .sort((a: ScheduleItem, b: ScheduleItem) => {
                          const dayOrder: Record<string, number> = {
                            MONDAY: 0,
                            TUESDAY: 1,
                            WEDNESDAY: 2,
                            THURSDAY: 3,
                            FRIDAY: 4,
                            SATURDAY: 5,
                            SUNDAY: 6,
                          }
                          return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek]
                        })
                        .map((schedule: ScheduleItem) => {
                          const dayNames: Record<string, string> = {
                            MONDAY: 'Senin',
                            TUESDAY: 'Selasa',
                            WEDNESDAY: 'Rabu',
                            THURSDAY: 'Kamis',
                            FRIDAY: 'Jumat',
                            SATURDAY: 'Sabtu',
                            SUNDAY: 'Minggu',
                          }

                          return (
                            <tr
                              key={schedule.id}
                              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/50"
                            >
                              <td className="p-4 pl-6 font-bold">{dayNames[schedule.dayOfWeek]}</td>
                              <td className="p-4 font-mono text-sm text-slate-500">
                                {schedule.startTime}
                              </td>
                              <td className="p-4 font-mono text-sm text-slate-500">
                                {schedule.endTime}
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                  {schedule.capacity}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenScheduleModal('edit', schedule)}
                                    className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                    title="Edit"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-slate-500 hover:bg-slate-500 hover:text-white"
                                    title="Hapus"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL DEPARTEMEN */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-zinc-900">
              {deptFormMode === 'add' ? 'Tambah Departemen' : 'Edit Departemen'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Nama Departemen
                </label>
                <input
                  type="text"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  placeholder="Contoh: Poliklinik Umum"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Kode Departemen
                </label>
                <input
                  type="text"
                  value={deptFormData.code}
                  onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value })}
                  placeholder="Contoh: UMU"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={deptFormData.description}
                  onChange={(e) =>
                    setDeptFormData({ ...deptFormData, description: e.target.value })
                  }
                  placeholder="Deskripsi departemen"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseDeptModal}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDept}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JADWAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-zinc-900">
              {scheduleFormMode === 'add' ? 'Tambah Jadwal' : 'Edit Jadwal'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Hari</label>
                <select
                  value={scheduleFormData.dayOfWeek}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, dayOfWeek: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Pilih Hari...</option>
                  <option value="MONDAY">Senin</option>
                  <option value="TUESDAY">Selasa</option>
                  <option value="WEDNESDAY">Rabu</option>
                  <option value="THURSDAY">Kamis</option>
                  <option value="FRIDAY">Jumat</option>
                  <option value="SATURDAY">Sabtu</option>
                  <option value="SUNDAY">Minggu</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Jam Mulai</label>
                <input
                  type="time"
                  value={scheduleFormData.startTime}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, startTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Jam Selesai
                </label>
                <input
                  type="time"
                  value={scheduleFormData.endTime}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, endTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Kapasitas</label>
                <input
                  type="number"
                  min="1"
                  value={scheduleFormData.capacity}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, capacity: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseScheduleModal}
                className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSchedule}
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
