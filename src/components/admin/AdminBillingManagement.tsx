import { useEffect, useMemo, useState } from 'react'
import { formatRupiah } from '../../lib/formatCurrency'
import type { Bill, BillStatus } from '../../lib/types'
import { useAlertStore } from '../../store/alertStore'
import { useBillingStore } from '../../store/billingStore'
import CustomInput from '../ui/CustomInput'

type BillFilter = 'all' | 'unpaid' | 'bpjs' | 'paid'

const STATUS_LABELS: Record<BillStatus, string> = {
  PENDING: 'Belum Bayar',
  PAID: 'Lunas',
  WAIVED: 'Dibebaskan',
  BPJS_PENDING: 'Verifikasi BPJS',
}

function statusBadgeClass(status: BillStatus): string {
  switch (status) {
    case 'PAID':
    case 'WAIVED':
      return 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
    case 'BPJS_PENDING':
      return 'border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400'
    default:
      return 'border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
  }
}

export default function AdminBillingManagement() {
  const { bills, isLoading, pagination, fetchAllBills, payBill, updateBill } = useBillingStore()
  const showAlert = useAlertStore((s) => s.showAlert)
  const [filter, setFilter] = useState<BillFilter>('all')
  const [page, setPage] = useState(1)
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [sepNumber, setSepNumber] = useState('')

  const statusParam = useMemo(() => {
    if (filter === 'unpaid') return 'PENDING' as BillStatus
    if (filter === 'bpjs') return 'BPJS_PENDING' as BillStatus
    if (filter === 'paid') return 'PAID' as BillStatus
    return undefined
  }, [filter])

  useEffect(() => {
    void fetchAllBills({ page, pageSize: 15, status: statusParam })
  }, [fetchAllBills, page, statusParam])

  const stats = useMemo(() => {
    const pending = bills.filter((b) => b.status === 'PENDING').length
    const bpjs = bills.filter((b) => b.status === 'BPJS_PENDING').length
    const paid = bills.filter((b) => b.status === 'PAID' || b.status === 'WAIVED').length
    const totalUnpaid = bills
      .filter((b) => b.status === 'PENDING' || b.status === 'BPJS_PENDING')
      .reduce((sum, b) => sum + (b.patientShare ?? b.totalAmount), 0)
    return { pending, bpjs, paid, totalUnpaid }
  }, [bills])

  const handleMarkPaid = async (bill: Bill) => {
    try {
      await payBill(bill.id, 'CASHIER')
      showAlert('Tagihan ditandai lunas.', 'success')
      void fetchAllBills({ page, pageSize: 15, status: statusParam })
    } catch {
      showAlert('Gagal menandai tagihan lunas.', 'error')
    }
  }

  const handleVerifyBpjs = async (bill: Bill) => {
    if (!sepNumber.trim()) {
      showAlert('Masukkan nomor SEP terlebih dahulu.', 'warning')
      return
    }
    try {
      await updateBill(bill.id, { sepNumber: sepNumber.trim(), status: 'PAID' })
      showAlert('Verifikasi BPJS berhasil.', 'success')
      setSelectedBill(null)
      setSepNumber('')
      void fetchAllBills({ page, pageSize: 15, status: statusParam })
    } catch {
      showAlert('Gagal memverifikasi tagihan BPJS.', 'error')
    }
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div>
        <h1 className="mb-2 font-['Manrope'] text-3xl font-extrabold text-zinc-950 dark:text-zinc-100">Tagihan & Pembayaran</h1>
        <p className="text-slate-600 dark:text-zinc-400">Kelola tagihan pasien, konfirmasi pembayaran kasir, dan verifikasi BPJS.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 p-5">
          <p className="text-xs font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase">Belum Bayar</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-800 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-5">
          <p className="text-xs font-bold tracking-wider text-blue-700 dark:text-blue-400 uppercase">BPJS Pending</p>
          <p className="mt-1 text-2xl font-extrabold text-blue-800">{stats.bpjs}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-5">
          <p className="text-xs font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">Lunas</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-800 dark:text-emerald-400">{stats.paid}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-5 shadow-sm">
          <p className="text-xs font-bold tracking-wider text-slate-500 dark:text-zinc-400 uppercase">Halaman ini</p>
          <p className="mt-1 text-lg font-extrabold text-zinc-900 dark:text-zinc-100">{formatRupiah(stats.totalUnpaid)}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">total belum lunas (halaman aktif)</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'unpaid', 'bpjs', 'paid'] as BillFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
              setPage(1)
            }}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors ${
              filter === f ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'unpaid' ? 'Belum Bayar' : f === 'bpjs' ? 'BPJS' : 'Lunas'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] shadow-sm">
        {isLoading ? (
          <p className="p-8 text-center text-sm text-slate-500 dark:text-zinc-400">Memuat tagihan...</p>
        ) : bills.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500 dark:text-zinc-400">Tidak ada tagihan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#131314] text-[10px] font-black tracking-widest text-slate-500 dark:text-zinc-400 uppercase">
                <tr>
                  <th className="p-4">Pasien</th>
                  <th className="p-4">Poli / Antrean</th>
                  <th className="p-4">Jumlah</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((bill) => (
                  <tr key={bill.id} className="border-b border-slate-50 last:border-0">
                    <td className="p-4 font-semibold text-zinc-900 dark:text-zinc-100">
                      {bill.patient?.user?.name ?? bill.patientId}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-zinc-400">
                      {bill.queue?.department?.name ?? '-'}
                      {bill.queue?.queueNumber != null ? ` · No. ${bill.queue.queueNumber}` : ''}
                    </td>
                    <td className="p-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {formatRupiah(bill.patientShare ?? bill.totalAmount)}
                    </td>
                    <td className="p-4">
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase ${statusBadgeClass(bill.status)}`}>
                        {STATUS_LABELS[bill.status]}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        {(bill.status === 'PENDING' || bill.status === 'BPJS_PENDING') && (
                          <button
                            onClick={() => handleMarkPaid(bill)}
                            className="rounded-lg bg-teal-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-teal-700"
                          >
                            Tandai Lunas
                          </button>
                        )}
                        {bill.status === 'BPJS_PENDING' && (
                          <button
                            onClick={() => {
                              setSelectedBill(bill)
                              setSepNumber(bill.sepNumber ?? '')
                            }}
                            className="rounded-lg border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-400"
                          >
                            Verifikasi BPJS
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">
            Halaman {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}

      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-[#131314]/80 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1e1f20] p-6 shadow-xl">
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">Verifikasi BPJS</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{selectedBill.patient?.user?.name}</p>
            <CustomInput
              label="Nomor SEP"
              value={sepNumber}
              onChange={(val) => setSepNumber(val)}
              placeholder="Contoh: 0123R00101234567890"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSelectedBill(null)}
                className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-xs font-bold"
              >
                Batal
              </button>
              <button
                onClick={() => void handleVerifyBpjs(selectedBill)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white"
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
