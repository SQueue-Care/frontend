// src/components/AdminUserModal.tsx
import { useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { UserAccount } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'

export type ManagedUser = {
  user?: UserAccount
  isActive?: boolean
  id?: string
  name?: string
  email?: string
  role?: string
  nik?: string
  bpjsNumber?: string
  phone?: string
  gender?: string
  birthDate?: string
  address?: string
  specialization?: string
  avgServiceMin?: number
}

interface AdminUserModalProps {
  isOpen: boolean
  user: ManagedUser | null
  onClose: () => void
  onSuccess: () => void
}

function AdminUserModalInner({
  user,
  onClose,
  onSuccess,
}: {
  user: ManagedUser
  onClose: () => void
  onSuccess: () => void
}) {
  const [isActive, setIsActive] = useState(
    () => user.user?.isActive !== false && user.isActive !== false
  )
  const [isSaving, setIsSaving] = useState(false)
  const showAlert = useAlertStore((s) => s.showAlert)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await apiClient.patch(`/users/${user.user?.id || user.id}`, { isActive })
      showAlert('Status user berhasil diperbarui!', 'success')
      onSuccess()
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal memperbarui user.'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 duration-200">
      <div className="animate-in zoom-in-95 my-4 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl duration-200">
        <h2 className="mb-6 text-xl font-bold text-zinc-900">Kelola Akun User</h2>

        {/* Informasi Akun */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-700 uppercase">
            Informasi Akun
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Nama</p>
              <p className="text-sm font-medium text-slate-900">
                {user.user?.name || user.name || '-'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Email</p>
              <p className="text-sm font-medium text-slate-900">
                {user.user?.email || user.email || '-'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Role</p>
              <p className="text-sm font-medium text-slate-900">
                {user.user?.role || user.role || '-'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Status Saat Ini</p>
              <span
                className={`inline-block rounded-md border px-2.5 py-1 text-xs font-bold ${user.user?.isActive !== false ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
              >
                {user.user?.isActive !== false ? 'Aktif' : 'Blokir'}
              </span>
            </div>
          </div>
        </div>

        {/* Informasi Profil Pasien */}
        {(user.user?.role === 'PATIENT' || user.role === 'PATIENT') && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-700 uppercase">
              Informasi Profil Pasien
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">NIK</p>
                <p className="font-mono text-sm font-medium text-slate-900">{user.nik || '-'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Nomor BPJS</p>
                <p className="font-mono text-sm font-medium text-slate-900">
                  {user.bpjsNumber || '-'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Telepon</p>
                <p className="text-sm font-medium text-slate-900">{user.phone || '-'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Jenis Kelamin</p>
                <p className="text-sm font-medium text-slate-900">
                  {user.gender === 'MALE'
                    ? 'Laki-laki'
                    : user.gender === 'FEMALE'
                      ? 'Perempuan'
                      : '-'}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Tanggal Lahir</p>
                <p className="text-sm font-medium text-slate-900">
                  {user.birthDate
                    ? new Date(user.birthDate).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '-'}
                </p>
              </div>
              <div className="col-span-2">
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Alamat</p>
                <p className="text-sm font-medium text-slate-900">{user.address || '-'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Informasi Profil Dokter */}
        {(user.user?.role === 'DOCTOR' || user.role === 'DOCTOR') && (
          <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="mb-4 text-sm font-bold tracking-wide text-slate-700 uppercase">
              Informasi Profil Dokter
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">Spesialisasi</p>
                <p className="text-sm font-medium text-slate-900">{user.specialization || '-'}</p>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">
                  Rata-rata Layanan
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {user.avgServiceMin || 10} Menit
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Akun Edit */}
        <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="mb-3 block text-sm font-semibold text-slate-700">
            Ubah Status Akun
          </label>
          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="status"
                checked={isActive === true}
                onChange={() => setIsActive(true)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Aktif</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="status"
                checked={isActive === false}
                onChange={() => setIsActive(false)}
                className="h-4 w-4 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-sm font-medium text-slate-700">Blokir</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUserModal({ isOpen, user, onClose, onSuccess }: AdminUserModalProps) {
  if (!isOpen || !user) return null

  return (
    <AdminUserModalInner
      key={String(user.user?.id || user.id)}
      user={user}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
