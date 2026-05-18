// src/components/AdminServiceManagement.tsx
import { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { useDepartmentStore } from '../store/departmentStore';

export default function AdminServiceManagement() {
  const { departments, fetchDepartments } = useDepartmentStore();

  const [servicesTab, setServicesTab] = useState<'departments' | 'schedules'>('departments');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(false);
  
  // Filter Jadwal
  const [selectedScheduleDeptFilter, setSelectedScheduleDeptFilter] = useState<string>('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('');
  
  // State Modal Departemen
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [deptFormMode, setDeptFormMode] = useState<'add' | 'edit'>('add');
  const [selectedDept, setSelectedDept] = useState<any>(null);
  const [deptFormData, setDeptFormData] = useState({ name: '', code: '', description: '' });
  
  // State Modal Jadwal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleFormMode, setScheduleFormMode] = useState<'add' | 'edit'>('add');
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [scheduleFormData, setScheduleFormData] = useState({ dayOfWeek: '', startTime: '', endTime: '', capacity: 10 });

  // Sinkronisasi Data Awal
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (servicesTab === 'schedules') {
      const fetchSchedules = async () => {
        setIsLoadingSchedules(true);
        try {
          const response = await apiClient.get('/schedules');
          setSchedules(response.data.data || []);
        } catch (error: any) {
          console.error('Gagal memuat schedules:', error);
          setSchedules([]);
        } finally {
          setIsLoadingSchedules(false);
        }
      };
      fetchSchedules();
    }
  }, [servicesTab]);

  // Handler Departemen
  const handleOpenDeptModal = (mode: 'add' | 'edit', dept?: any) => {
    setDeptFormMode(mode);
    if (mode === 'edit' && dept) {
      setSelectedDept(dept);
      setDeptFormData({ name: dept.name, code: dept.code, description: dept.description || '' });
    } else {
      setDeptFormData({ name: '', code: '', description: '' });
    }
    setIsDeptModalOpen(true);
  };

  const handleCloseDeptModal = () => {
    setIsDeptModalOpen(false);
    setSelectedDept(null);
    setDeptFormData({ name: '', code: '', description: '' });
  };

  const handleSaveDept = async () => {
    if (!deptFormData.name || !deptFormData.code) {
      alert('Nama dan kode departemen harus diisi');
      return;
    }

    try {
      if (deptFormMode === 'add') {
        await apiClient.post('/departments', deptFormData);
        alert('Departemen berhasil ditambahkan!');
      } else {
        await apiClient.patch(`/departments/${selectedDept.id}`, deptFormData);
        alert('Departemen berhasil diperbarui!');
      }
      handleCloseDeptModal();
      fetchDepartments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyimpan departemen.');
    }
  };

  const handleDeleteDept = async (deptId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus departemen ini?')) return;

    try {
      await apiClient.delete(`/departments/${deptId}`);
      alert('Departemen berhasil dihapus!');
      fetchDepartments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus departemen.');
    }
  };

  // Handler Jadwal
  const handleOpenScheduleModal = (mode: 'add' | 'edit', schedule?: any) => {
    setScheduleFormMode(mode);
    if (mode === 'edit' && schedule) {
      setSelectedSchedule(schedule);
      setScheduleFormData({
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        capacity: schedule.capacity
      });
    } else {
      setScheduleFormData({ dayOfWeek: '', startTime: '', endTime: '', capacity: 10 });
    }
    setIsScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedSchedule(null);
    setScheduleFormData({ dayOfWeek: '', startTime: '', endTime: '', capacity: 10 });
  };

  const handleSaveSchedule = async () => {
    if (!scheduleFormData.dayOfWeek || !scheduleFormData.startTime || !scheduleFormData.endTime) {
      alert('Hari, jam mulai, dan jam selesai harus diisi');
      return;
    }

    try {
      const payload = {
        doctorId: selectedDoctorFilter,
        dayOfWeek: scheduleFormData.dayOfWeek,
        startTime: scheduleFormData.startTime,
        endTime: scheduleFormData.endTime,
        capacity: Number(scheduleFormData.capacity),
        departmentId: selectedScheduleDeptFilter
      };

      if (scheduleFormMode === 'add') {
        await apiClient.post('/schedules', payload);
        alert('Jadwal berhasil ditambahkan!');
      } else {
        await apiClient.patch(`/schedules/${selectedSchedule.id}`, payload);
        alert('Jadwal berhasil diperbarui!');
      }
      handleCloseScheduleModal();
      const response = await apiClient.get('/schedules');
      setSchedules(response.data.data || []);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menyimpan jadwal.');
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

    try {
      await apiClient.delete(`/schedules/${scheduleId}`);
      alert('Jadwal berhasil dihapus!');
      const response = await apiClient.get('/schedules');
      setSchedules(response.data.data || []);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal menghapus jadwal.');
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-zinc-950 font-['Manrope'] mb-2">Manajemen Layanan</h1>
        <p className="text-slate-600">Kelola departemen dan jadwal layanan poliklinik.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button
          onClick={() => setServicesTab('departments')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            servicesTab === 'departments'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manajemen Departemen
        </button>
        <button
          onClick={() => setServicesTab('schedules')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            servicesTab === 'schedules'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manajemen Jadwal
        </button>
      </div>

      {/* TAMPILAN DEPARTEMEN */}
      {servicesTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-zinc-900">Daftar Departemen</h2>
            <button onClick={() => handleOpenDeptModal('add')} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm">
              + Tambah Departemen
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Departemen</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kode</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Deskripsi</th>
                  <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium text-zinc-900 bg-white">
                {departments.map((dept: any) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                    <td className="p-4 pl-6 font-bold">{dept.name}</td>
                    <td className="p-4"><span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-extrabold rounded-lg font-mono text-xs">{dept.code}</span></td>
                    <td className="p-4 text-slate-500 text-sm truncate max-w-xs">{dept.description || '-'}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenDeptModal('edit', dept)} className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200" title="Edit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteDept(dept.id)} className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200" title="Hapus">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Departemen</label>
                <select
                  value={selectedScheduleDeptFilter}
                  onChange={(e) => {
                    setSelectedScheduleDeptFilter(e.target.value);
                    setSelectedDoctorFilter('');
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                >
                  <option value="">Pilih Departemen...</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Dokter</label>
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium bg-white hover:border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  disabled={!selectedScheduleDeptFilter}
                >
                  <option value="">Pilih Dokter...</option>
                  {schedules
                    .filter((s: any) => s.departmentId === selectedScheduleDeptFilter)
                    .reduce((acc: any[], s: any) => {
                      if (!acc.find((d) => d.doctorId === s.doctorId)) acc.push(s);
                      return acc;
                    }, [])
                    .map((s: any) => (
                      <option key={s.doctorId} value={s.doctorId}>
                        {s.doctor?.user?.name || '-'}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {selectedDoctorFilter && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Jadwal Mingguan</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {schedules.find((s: any) => s.doctorId === selectedDoctorFilter)?.doctor?.user?.name} -
                    {schedules.find((s: any) => s.doctorId === selectedDoctorFilter)?.department?.name}
                  </p>
                </div>
                <button onClick={() => handleOpenScheduleModal('add')} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  + Tambah Jadwal
                </button>
              </div>

              {isLoadingSchedules ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : schedules.filter((s: any) => s.doctorId === selectedDoctorFilter).length === 0 ? (
                <div className="py-8 text-center text-slate-500 italic text-sm">Tidak ada jadwal untuk dokter ini</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-4 pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Hari</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Mulai</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Selesai</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kapasitas</th>
                        <th className="p-4 pr-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium text-zinc-900 bg-white">
                      {schedules
                        .filter((s: any) => s.doctorId === selectedDoctorFilter)
                        .sort((a: any, b: any) => {
                          const dayOrder: Record<string, number> = {
                            'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3,
                            'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6
                          };
                          return dayOrder[a.dayOfWeek] - dayOrder[b.dayOfWeek];
                        })
                        .map((schedule: any) => {
                          const dayNames: Record<string, string> = {
                            'MONDAY': 'Senin', 'TUESDAY': 'Selasa', 'WEDNESDAY': 'Rabu',
                            'THURSDAY': 'Kamis', 'FRIDAY': 'Jumat', 'SATURDAY': 'Sabtu', 'SUNDAY': 'Minggu'
                          };

                          return (
                            <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0">
                              <td className="p-4 pl-6 font-bold">{dayNames[schedule.dayOfWeek]}</td>
                              <td className="p-4 text-slate-500 font-mono text-sm">{schedule.startTime}</td>
                              <td className="p-4 text-slate-500 font-mono text-sm">{schedule.endTime}</td>
                              <td className="p-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {schedule.capacity}
                                </span>
                              </td>
                              <td className="p-4 pr-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleOpenScheduleModal('edit', schedule)} className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold rounded-lg transition-colors border border-blue-100 hover:border-blue-600" title="Edit">
                                    Edit
                                  </button>
                                  <button onClick={() => handleDeleteSchedule(schedule.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-500 hover:text-white text-xs font-bold rounded-lg transition-colors border border-slate-200 hover:border-slate-500" title="Hapus">
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">
              {deptFormMode === 'add' ? 'Tambah Departemen' : 'Edit Departemen'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Departemen</label>
                <input
                  type="text"
                  value={deptFormData.name}
                  onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                  placeholder="Contoh: Poliklinik Umum"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kode Departemen</label>
                <input
                  type="text"
                  value={deptFormData.code}
                  onChange={(e) => setDeptFormData({ ...deptFormData, code: e.target.value })}
                  placeholder="Contoh: UMU"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi (Opsional)</label>
                <textarea
                  value={deptFormData.description}
                  onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                  placeholder="Deskripsi departemen"
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleCloseDeptModal}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveDept}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL JADWAL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-zinc-900 mb-4">
              {scheduleFormMode === 'add' ? 'Tambah Jadwal' : 'Edit Jadwal'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hari</label>
                <select
                  value={scheduleFormData.dayOfWeek}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, dayOfWeek: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                <label className="block text-sm font-semibold text-slate-700 mb-1">Jam Mulai</label>
                <input
                  type="time"
                  value={scheduleFormData.startTime}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Jam Selesai</label>
                <input
                  type="time"
                  value={scheduleFormData.endTime}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Kapasitas</label>
                <input
                  type="number"
                  min="1"
                  value={scheduleFormData.capacity}
                  onChange={(e) => setScheduleFormData({ ...scheduleFormData, capacity: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={handleCloseScheduleModal}
                className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}