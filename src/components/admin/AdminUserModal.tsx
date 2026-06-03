// src/components/admin/AdminUserModal.tsx
import { useState } from 'react'
import apiClient from '../../lib/apiClient'
import { getErrorMessage } from '../../lib/errors'
import type { UserAccount } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import CustomInput from '../ui/CustomInput'

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
  const [isSaving, setIsSaving] = useState(false)
  const showAlert = useAlertStore((s) => s.showAlert)
  
  const [editForm, setEditForm] = useState({
    isActive: user.user?.isActive !== false && user.isActive !== false,
    name: user.user?.name || user.name || '',
    email: user.user?.email || user.email || '',
    nik: user.nik || '',
    bpjsNumber: user.bpjsNumber || '',
    phone: user.phone || '',
    specialization: user.specialization || '',
    address: user.address || '',
  })

  const role = user.user?.role || user.role || 'UNKNOWN'

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const payload = { ...editForm }
      await apiClient.patch(`/users/${user.user?.id || user.id}`, payload)
      showAlert('Status dan data pengguna berhasil diperbarui!', 'success')
      onSuccess()
    } catch (error: unknown) {
      showAlert(getErrorMessage(error, 'Gagal memperbarui data pengguna.'), 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 backdrop-blur-md transition-all duration-300 dark:bg-black/60">
      
      <div className="flex w-full max-w-2xl flex-col max-h-[90vh] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#1e1f20]">
        
        {/* HEADER TETAP */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-zinc-800 dark:bg-[#131314]/50">
          <div>
            <h3 className="font-['Manrope'] text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Edit Kredensial Pengguna
            </h3>
            <p className="mt-0.5 text-[10px] font-medium tracking-widest text-slate-500 uppercase dark:text-zinc-400">
              Manajemen Profil & Akses
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 outline-none"
            aria-label="Tutup"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* BODY BISA DIGULIR */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
          <div className="space-y-6">
            
            {/* Informasi Akun & Dasar */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#131314]/50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase dark:text-zinc-400">
                  Kredensial Dasar
                </h3>
                <span className="inline-flex rounded-md border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold tracking-widest text-slate-600 uppercase dark:border-zinc-700 dark:bg-[#1e1f20] dark:text-slate-400">
                  Role: {role}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <CustomInput
                  label="Nama Lengkap"
                  value={editForm.name}
                  onChange={(val) => setEditForm({ ...editForm, name: val })}
                />
                <CustomInput
                  label="Alamat Email"
                  type="email"
                  value={editForm.email}
                  onChange={(val) => setEditForm({ ...editForm, email: val })}
                />
              </div>
            </div>

            {/* Informasi Spesifik Pasien */}
            {role === 'PATIENT' && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 p-5">
                <h3 className="mb-5 text-[11px] font-bold tracking-widest text-blue-700 uppercase dark:text-blue-400">
                  Data Klinis & Registrasi Pasien
                </h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <CustomInput
                    label="Nomor Induk Kependudukan (NIK)"
                    type="number"
                    maxLength={16}
                    value={editForm.nik}
                    onChange={(val) => setEditForm({ ...editForm, nik: val })}
                  />
                  <CustomInput
                    label="Nomor BPJS"
                    type="number"
                    maxLength={13}
                    value={editForm.bpjsNumber}
                    onChange={(val) => setEditForm({ ...editForm, bpjsNumber: val })}
                  />
                  <CustomInput
                    label="Nomor Telepon"
                    type="tel"
                    maxLength={15}
                    value={editForm.phone}
                    onChange={(val) => setEditForm({ ...editForm, phone: val })}
                  />
                  <div className="col-span-1 sm:col-span-2">
                    <CustomInput
                      label="Alamat Domisili"
                      multiline={true}
                      rows={2}
                      value={editForm.address}
                      onChange={(val) => setEditForm({ ...editForm, address: val })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Informasi Spesifik Dokter */}
            {role === 'DOCTOR' && (
              <div className="rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50/50 dark:bg-purple-500/5 p-5">
                <h3 className="mb-5 text-[11px] font-bold tracking-widest text-purple-700 uppercase dark:text-purple-400">
                  Data Penugasan Dokter
                </h3>
                <div className="grid grid-cols-1 gap-5">
                   <CustomInput
                    label="Spesialisasi Klinis"
                    value={editForm.specialization}
                    onChange={(val) => setEditForm({ ...editForm, specialization: val })}
                  />
                </div>
              </div>
            )}

            {/* Status Akun Edit */}
            <div>
              <h3 className="mb-3 text-[11px] font-bold tracking-widest text-slate-500 uppercase dark:text-zinc-400">
                Izin Autentikasi Pengguna
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {/* SARAN PERBAIKAN: Penambahan input radio tersembunyi (sr-only) agar interaksi klik pada label berfungsi mengubah state, serta pengurangan padding untuk merampingkan desain. */}
                <label 
                  className={`relative flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                    editForm.isActive 
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm dark:border-emerald-500/50 dark:bg-emerald-500/10' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-zinc-700 dark:hover:bg-[#131314]'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="accountStatus" 
                    className="sr-only" 
                    checked={editForm.isActive === true}
                    onChange={() => setEditForm({ ...editForm, isActive: true })}
                  />
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${editForm.isActive ? 'border-emerald-500' : 'border-slate-300 dark:border-zinc-600'}`}>
                    {editForm.isActive && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                  </div>
                  <span className={`text-xs font-bold ${editForm.isActive ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                    Aktif
                  </span>
                </label>

                <label 
                  className={`relative flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                    !editForm.isActive 
                      ? 'border-rose-500 bg-rose-50/50 shadow-sm dark:border-rose-500/50 dark:bg-rose-500/10' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-zinc-800 dark:bg-[#1e1f20] dark:hover:border-zinc-700 dark:hover:bg-[#131314]'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="accountStatus" 
                    className="sr-only" 
                    checked={editForm.isActive === false}
                    onChange={() => setEditForm({ ...editForm, isActive: false })}
                  />
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${!editForm.isActive ? 'border-rose-500' : 'border-slate-300 dark:border-zinc-600'}`}>
                    {!editForm.isActive && <div className="h-2 w-2 rounded-full bg-rose-500" />}
                  </div>
                  <span className={`text-xs font-bold ${!editForm.isActive ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                    Blokir
                  </span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER TETAP */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-5 dark:border-zinc-800 dark:bg-[#131314]/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-[#1e1f20] px-5 py-2.5 text-xs font-bold tracking-widest uppercase text-slate-600 dark:text-zinc-300 transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800 shadow-sm"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-teal-600 dark:bg-teal-500 px-6 py-2.5 text-xs font-bold tracking-widest uppercase text-white dark:text-zinc-900 transition-all hover:bg-teal-700 dark:hover:bg-teal-400 shadow-md shadow-teal-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Pembaruan'}
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