// src/components/AdminUserModal.tsx
import { useState, useEffect } from 'react';
import apiClient from '../../lib/apiClient';

interface AdminUserModalProps {
  isOpen: boolean;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminUserModal({ isOpen, user, onClose, onSuccess }: AdminUserModalProps) {
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      // Mengambil status isActive dari relasi .user jika ada, atau langsung dari objek
      setIsActive(user.user?.isActive !== false && user.isActive !== false);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.patch(`/users/${user.user?.id || user.id}`, { isActive });
      alert('Status user berhasil diperbarui!');
      onSuccess(); // Panggil fungsi refresh dari parent
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal memperbarui user.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 my-4 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">Kelola Akun User</h2>

        {/* Informasi Akun */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Informasi Akun</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Nama</p>
              <p className="text-sm text-slate-900 font-medium">{user.user?.name || user.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Email</p>
              <p className="text-sm text-slate-900 font-medium">{user.user?.email || user.email || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Role</p>
              <p className="text-sm text-slate-900 font-medium">{user.user?.role || user.role || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Status Saat Ini</p>
              <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-md border ${user.user?.isActive !== false ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                {user.user?.isActive !== false ? 'Aktif' : 'Blokir'}
              </span>
            </div>
          </div>
        </div>

        {/* Informasi Profil Pasien */}
        {(user.user?.role === 'PATIENT' || user.role === 'PATIENT') && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Informasi Profil Pasien</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">NIK</p>
                <p className="text-sm text-slate-900 font-medium font-mono">{user.nik || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Nomor BPJS</p>
                <p className="text-sm text-slate-900 font-medium font-mono">{user.bpjsNumber || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Telepon</p>
                <p className="text-sm text-slate-900 font-medium">{user.phone || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Jenis Kelamin</p>
                <p className="text-sm text-slate-900 font-medium">
                  {user.gender === 'MALE' ? 'Laki-laki' : user.gender === 'FEMALE' ? 'Perempuan' : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Tanggal Lahir</p>
                <p className="text-sm text-slate-900 font-medium">
                  {user.birthDate ? new Date(user.birthDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Alamat</p>
                <p className="text-sm text-slate-900 font-medium">{user.address || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Informasi Profil Dokter */}
        {(user.user?.role === 'DOCTOR' || user.role === 'DOCTOR') && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">Informasi Profil Dokter</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Spesialisasi</p>
                <p className="text-sm text-slate-900 font-medium">{user.specialization || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Rata-rata Layanan</p>
                <p className="text-sm text-slate-900 font-medium">{user.avgServiceMin || 10} Menit</p>
              </div>
            </div>
          </div>
        )}

        {/* Status Akun Edit */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-sm font-semibold text-slate-700 mb-3">Ubah Status Akun</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" checked={isActive === true} onChange={() => setIsActive(true)} className="w-4 h-4 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="status" checked={isActive === false} onChange={() => setIsActive(false)} className="w-4 h-4 text-rose-600 focus:ring-rose-500" />
              <span className="text-sm font-medium text-slate-700">Blokir</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
            Batal
          </button>
          <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70">
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );
}