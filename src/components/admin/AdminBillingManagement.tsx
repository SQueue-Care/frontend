import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { EllipsisVerticalIcon } from '@heroicons/react/20/solid'
import { Fragment, useEffect, useMemo, useState } from 'react'
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
    case 'PENDING':
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
          <p className="text-xs tracking-wider text-amber-700 dark:text-amber-400 uppercase">Belum Bayar</p>
          <p className="mt-1 text-2xl text-amber-800 dark:text-amber-400">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 p-5">
          <p className="text-xs tracking-wider text-blue-700 dark:text-blue-400 uppercase">BPJS Pending</p>
          <p className="mt-1 text-2xl text-blue-800">{stats.bpjs}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 p-5">
          <p className="text-xs tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">Lunas</p>
          <p className="mt-1 text-2xl text-emerald-800 dark:text-emerald-400">{stats.paid}</p>
        </div>
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-[#1e1f20] p-5 shadow-sm">
          <p className="text-xs tracking-wider text-slate-500 dark:text-zinc-400 uppercase">Halaman ini</p>
          <p className="mt-1 text-lg text-zinc-900 dark:text-zinc-100">{formatRupiah(stats.totalUnpaid)}</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">total belum lunas (halaman aktif)</p>
        </div>
      </div>

      <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50/80 p-1 dark:border-zinc-800 dark:bg-[#131314]">
        {(['all', 'unpaid', 'bpjs', 'paid'] as BillFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f)
              setPage(1)
            }}
            className={`rounded-xl px-5 py-2.5 text-sm transition-all ${
              filter === f
                ? 'bg-white text-teal-700 shadow-sm dark:bg-[#1e1f20] dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {f === 'all' ? 'Semua' : f === 'unpaid' ? 'Belum Bayar' : f === 'bpjs' ? 'BPJS' : 'Lunas'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]">
        {isLoading ? (
          <p className="p-16 text-center text-xs tracking-widest text-teal-700 uppercase dark:text-teal-500 animate-pulse">
            Memuat tagihan...
          </p>
        ) : bills.length === 0 ? (
          <p className="p-16 text-center font-medium text-slate-400 italic dark:text-slate-500">
            Tidak ada tagihan yang terekam.
          </p>
        ) : (
          <div className="no-scrollbar overflow-x-auto relative">
            <table className="w-full min-w-[900px] border-collapse text-left whitespace-nowrap">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] tracking-widest text-slate-400 uppercase dark:border-zinc-800 dark:bg-[#131314] dark:text-zinc-500">
                <tr>
                  <th className="p-6 pl-8">Pasien</th>
                  <th className="p-6">Poli / Antrean</th>
                  <th className="p-6">Jumlah</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 pr-8 text-right sticky right-0 z-20 bg-slate-50/95 dark:bg-[#131314]/95 backdrop-blur-sm border-l border-slate-100 dark:border-zinc-800/50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.2)]">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm dark:divide-zinc-800">
                {bills.map((bill, index) => (
                  <tr
                    key={bill.id}
                    style={{ zIndex: bills.length - index }}
                    className="group relative transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-slate-700/30 focus-within:z-50 hover:z-50"
                  >
                    <td className="p-6 pl-8 align-top font-medium text-zinc-900 dark:text-white">
                      {bill.patient?.user?.name ?? bill.patientId}
                    </td>
                    <td className="p-6 align-top text-slate-600 dark:text-zinc-400">
                      <div>{bill.queue?.department?.name ?? '-'}</div>
                      {bill.queue?.queueNumber != null && (
                        <div className="mt-1 inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-[10px] tracking-widest text-slate-600 uppercase dark:bg-slate-900/50 dark:text-slate-400">
                          No. {bill.queue.queueNumber}
                        </div>
                      )}
                    </td>
                    <td className="p-6 align-top font-semibold text-zinc-900 dark:text-white">
                      {formatRupiah(bill.patientShare ?? bill.totalAmount)}
                    </td>
                    <td className="p-6 align-top">
                      <span
                        className={`inline-flex min-w-[120px] items-center justify-center rounded-lg border px-3.5 py-1.5 text-[10px] tracking-widest uppercase transition-colors ${statusBadgeClass(
                          bill.status
                        )}`}
                      >
                        {STATUS_LABELS[bill.status]}
                      </span>
                    </td>
                    <td 
                      className="p-6 pr-8 text-right align-top sticky right-0 z-10 bg-white group-hover:bg-slate-50/80 dark:bg-[#1e1f20] dark:group-hover:bg-[#252628] border-l border-slate-100 dark:border-zinc-800/50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] dark:shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.2)] transition-colors focus-within:z-50 group-hover:z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end">
                        {(bill.status === 'PENDING' || bill.status === 'BPJS_PENDING') ? (
                          <Menu as="div" className="relative inline-block text-left">
                            <div>
                              <MenuButton className="flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300 focus:outline-none transition-colors">
                                <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
                              </MenuButton>
                            </div>
                            <Transition
                              as={Fragment}
                              enter="transition ease-out duration-100"
                              enterFrom="transform opacity-0 scale-95"
                              enterTo="transform opacity-100 scale-100"
                              leave="transition ease-in duration-75"
                              leaveFrom="transform opacity-100 scale-100"
                              leaveTo="transform opacity-0 scale-95"
                            >
                              <MenuItems className="absolute right-0 mt-2 w-max min-w-[150px] origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-[#1e1f20] dark:ring-white/10 z-50 divide-y divide-slate-100 dark:divide-zinc-800">
                                <div className="py-1">
                                  <MenuItem>
                                    {({ active }) => (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          void handleMarkPaid(bill)
                                        }}
                                        className={`${
                                          active
                                            ? 'bg-slate-50 text-emerald-600 dark:bg-zinc-800 dark:text-emerald-400'
                                            : 'text-slate-700 dark:text-zinc-300'
                                        } group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                                      >
                                        Tandai Lunas
                                      </button>
                                    )}
                                  </MenuItem>
                                  {bill.status === 'BPJS_PENDING' && (
                                    <MenuItem>
                                      {({ active }) => (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedBill(bill)
                                            setSepNumber(bill.sepNumber ?? '')
                                          }}
                                          className={`${
                                            active
                                              ? 'bg-slate-50 text-blue-600 dark:bg-zinc-800 dark:text-blue-400'
                                              : 'text-slate-700 dark:text-zinc-300'
                                          } group flex w-full items-center px-4 py-2.5 text-sm transition-colors`}
                                        >
                                          Verifikasi BPJS
                                        </button>
                                      )}
                                    </MenuItem>
                                  )}
                                </div>
                              </MenuItems>
                            </Transition>
                          </Menu>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-zinc-500 italic px-2">Tidak ada aksi</span>
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
            className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-xs disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Halaman {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-xs disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}

      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-[#131314]/80 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1e1f20] p-6 shadow-xl">
            <h3 className="text-lg text-zinc-900 dark:text-zinc-100">Verifikasi BPJS</h3>
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
                className="rounded-lg border border-slate-200 dark:border-zinc-800 px-4 py-2 text-xs text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => void handleVerifyBpjs(selectedBill)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs text-white hover:bg-blue-700 transition-colors shadow-sm"
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