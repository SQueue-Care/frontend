// src/components/AdminServiceManagement.tsx
import { useEffect, useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { Department } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useDepartmentStore } from '../../store/departmentStore'
import CustomSelect from '../ui/CustomSelect'

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
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">
          Manajemen Layanan
        </h1>
        <p className="text-slate-600 dark:text-zinc-400">Kelola departemen dan jadwal layanan poliklinik.</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 inline-flex rounded-2xl border border-slate-200 bg-slate-50/80 p-1 dark:border-zinc-800 dark:bg-[#131314]">
        <button
          onClick={() => setServicesTab('departments')}
          className={`rounded-xl px-5 py-2.5 text-sm transition-all ${
            servicesTab === 'departments'
              ? 'bg-white text-teal-700 shadow-sm dark:bg-[#1e1f20] dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Manajemen Departemen
        </button>
        <button
          onClick={() => setServicesTab('schedules')}
          className={`rounded-xl px-5 py-2.5 text-sm transition-all ${
            servicesTab === 'schedules'
              ? 'bg-white text-teal-700 shadow-sm dark:bg-[#1e1f20] dark:text-teal-400'
              : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
        >
          Manajemen Jadwal
        </button>
      </div>

      {/* TAMPILAN DEPARTEMEN */}
      {servicesTab === 'departments' && (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
          <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-zinc-800">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Daftar Departemen</h2>
            <button
              onClick={() => handleOpenDeptModal('add')}
              className="rounded-lg bg-teal-600 px-4 py-2 text-[10px] tracking-widest uppercase text-white hover:bg-teal-700 transition-colors shadow-sm"
            >
              + Tambah Departemen
            </button>
          </div>
          <div className="no-scrollbar overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
                <tr>
                  <th className="p-6 pl-8">Nama Departemen</th>
                  <th className="p-6">Kode</th>
                  <th className="p-6">Deskripsi</th>
                  <th className="p-6 pr-8 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
                {departments.map((dept: Department) => (
                  <tr
                    key={dept.id}
                    className="transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                  >
                    <td className="p-6 pl-8 align-top font-medium text-zinc-900 dark:text-white">
                      {dept.name}
                    </td>
                    <td className="p-6 align-top">
                      <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                        {dept.code}
                      </span>
                    </td>
                    <td className="p-6 align-top">
                      <div className="max-w-xs text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
                        {dept.description || '-'}
                      </div>
                    </td>
                    <td className="p-6 pr-8 text-right align-top">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDeptModal('edit', dept)}
                          className="rounded-lg border border-transparent p-2 text-blue-600 dark:text-blue-400 transition-colors hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteDept(dept.id)}
                          className="rounded-lg border border-transparent p-2 text-rose-600 dark:text-rose-400 transition-colors hover:border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                          title="Hapus"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <CustomSelect
                  label="Filter Departemen"
                  value={selectedScheduleDeptFilter}
                  onChange={(val) => {
                    setSelectedScheduleDeptFilter(val)
                    setSelectedDoctorFilter('')
                  }}
                  options={[
                    { value: '', label: 'Pilih Departemen...' },
                    ...departments.map((dept: Department) => ({ value: dept.id, label: dept.name })),
                  ]}
                  placeholder="Pilih Departemen..."
                />
              </div>

              <div className="flex-1">
                <CustomSelect
                  label="Filter Dokter"
                  value={selectedDoctorFilter}
                  onChange={(val) => setSelectedDoctorFilter(val)}
                  options={[
                    { value: '', label: 'Pilih Dokter...' },
                    ...schedules
                      .filter((s: ScheduleItem) => s.departmentId === selectedScheduleDeptFilter)
                      .reduce((acc: ScheduleItem[], s: ScheduleItem) => {
                        if (!acc.find((d) => d.doctorId === s.doctorId)) acc.push(s)
                        return acc
                      }, [])
                      .map((s: ScheduleItem) => ({
                        value: s.doctorId,
                        label: s.doctor?.user?.name || '-',
                      })),
                  ]}
                  placeholder="Pilih Dokter..."
                  disabled={!selectedScheduleDeptFilter}
                />
              </div>
            </div>
          </div>

          {selectedDoctorFilter && (
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
              <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Jadwal Mingguan</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
                    {
                      schedules.find((s: ScheduleItem) => s.doctorId === selectedDoctorFilter)
                        ?.doctor?.user?.name
                    }{' '}
                    -{' '}
                    {
                      schedules.find((s: ScheduleItem) => s.doctorId === selectedDoctorFilter)
                        ?.department?.name
                    }
                  </p>
                </div>
                <button
                  onClick={() => handleOpenScheduleModal('add')}
                  className="rounded-lg bg-teal-600 px-4 py-2 text-[10px] tracking-widest uppercase text-white hover:bg-teal-700 transition-colors shadow-sm"
                >
                  + Tambah Jadwal
                </button>
              </div>

              {isLoadingSchedules ? (
                <div className="flex justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600"></div>
                </div>
              ) : schedules.filter((s: ScheduleItem) => s.doctorId === selectedDoctorFilter)
                  .length === 0 ? (
                <div className="py-16 text-center text-sm text-slate-400 italic dark:text-slate-500">
                  Tidak ada jadwal untuk dokter ini
                </div>
              ) : (
                <div className="no-scrollbar overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
                      <tr>
                        <th className="p-6 pl-8">Hari</th>
                        <th className="p-6">Jam Mulai</th>
                        <th className="p-6">Jam Selesai</th>
                        <th className="p-6">Kapasitas</th>
                        <th className="p-6 pr-8 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
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
                              className="transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30"
                            >
                              <td className="p-6 pl-8 align-top font-medium text-zinc-900 dark:text-white">
                                {dayNames[schedule.dayOfWeek]}
                              </td>
                              <td className="p-6 align-top">
                                <div className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                                  {schedule.startTime}
                                </div>
                              </td>
                              <td className="p-6 align-top">
                                <div className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                                  {schedule.endTime}
                                </div>
                              </td>
                              <td className="p-6 align-top">
                                <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                  {schedule.capacity} <span className="text-[10px] font-normal text-slate-500">PASIEN</span>
                                </span>
                              </td>
                              <td className="p-6 pr-8 text-right align-top">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleOpenScheduleModal('edit', schedule)}
                                    className="rounded-lg bg-indigo-50 px-4 py-2 text-[10px] tracking-widest uppercase text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                    className="rounded-lg bg-slate-50 px-4 py-2 text-[10px] tracking-widest uppercase text-slate-600 hover:bg-slate-600 hover:text-white transition-all dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-[#131314]/80 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1e1f20] p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {deptFormMode === 'add' ? 'Tambah Departemen' : 'Edit Departemen'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Nama Departemen
                </label>
                <input
                  type="text"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  placeholder="Contoh: Poliklinik Umum"
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:bg-[#131314] dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Kode Departemen
                </label>
                <input
                  type="text"
                  value={deptFormData.code}
                  onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value })}
                  placeholder="Contoh: UMU"
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:bg-[#131314] dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={deptFormData.description}
                  onChange={(e) =>
                    setDeptFormData({ ...deptFormData, description: e.target.value })
                  }
                  placeholder="Deskripsi departemen"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:bg-[#131314] dark:text-zinc-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseDeptModal}
                className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-slate-600 dark:text-zinc-400 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDept}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JADWAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-[#131314]/80 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1e1f20] p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {scheduleFormMode === 'add' ? 'Tambah Jadwal' : 'Edit Jadwal'}
            </h2>
            <div className="space-y-4">
              <div>
                <CustomSelect
                  label="Hari"
                  value={scheduleFormData.dayOfWeek}
                  onChange={(val) =>
                    setScheduleFormData({ ...scheduleFormData, dayOfWeek: val })
                  }
                  options={[
                    { value: '', label: 'Pilih Hari...' },
                    { value: 'MONDAY', label: 'Senin' },
                    { value: 'TUESDAY', label: 'Selasa' },
                    { value: 'WEDNESDAY', label: 'Rabu' },
                    { value: 'THURSDAY', label: 'Kamis' },
                    { value: 'FRIDAY', label: 'Jumat' },
                    { value: 'SATURDAY', label: 'Sabtu' },
                    { value: 'SUNDAY', label: 'Minggu' },
                  ]}
                  placeholder="Pilih Hari..."
                />
              </div>
              <div className="pt-2">
                <label className="mb-1 block text-sm text-slate-700">Jam Mulai</label>
                <input
                  type="time"
                  value={scheduleFormData.startTime}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, startTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:bg-[#131314] dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">
                  Jam Selesai
                </label>
                <input
                  type="time"
                  value={scheduleFormData.endTime}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, endTime: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:bg-[#131314] dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-700">Kapasitas</label>
                <input
                  type="number"
                  min="1"
                  value={scheduleFormData.capacity}
                  onChange={(e) =>
                    setScheduleFormData({ ...scheduleFormData, capacity: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-indigo-500 dark:bg-[#131314] dark:text-zinc-100"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={handleCloseScheduleModal}
                className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-slate-600 dark:text-zinc-400 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSchedule}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-white transition-colors hover:bg-indigo-700"
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