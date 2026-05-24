import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatRupiah } from '../../lib/formatCurrency'
import type { Bill, BillStatus, PaymentType } from '../../lib/types'
import { useAuthStore } from '../../store/authStore'
import { useBillingStore } from '../../store/billingStore'

type BillFilter = 'all' | 'unpaid' | 'paid'

const STATUS_LABELS: Record<BillStatus, string> = {
  PENDING: 'Belum Bayar',
  PAID: 'Lunas',
  WAIVED: 'Dibebaskan',
  BPJS_PENDING: 'Verifikasi BPJS',
}

const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  BPJS: 'BPJS',
  UMUM: 'Umum',
  ASURANSI_SWASTA: 'Asuransi Swasta',
}

function statusBadgeClass(status: BillStatus): string {
  switch (status) {
    case 'PAID':
    case 'WAIVED':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400'
    case 'BPJS_PENDING':
      return 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
    default:
      return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400'
  }
}

function paymentTypeBadgeClass(type: PaymentType): string {
  return type === 'BPJS'
    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
    : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
}

function isPaid(status: BillStatus): boolean {
  return status === 'PAID' || status === 'WAIVED'
}

function isUnpaid(status: BillStatus): boolean {
  return status === 'PENDING' || status === 'BPJS_PENDING'
}

function getDisplayAmount(bill: Bill): number {
  return bill.paymentType === 'BPJS' ? (bill.patientShare ?? 0) : bill.totalAmount
}

function formatBillDate(bill: Bill): string {
  const dateStr = bill.queue?.queueDate ?? bill.createdAt
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function MetaBadges({ bill }: { bill: Bill }) {
  return (
    <div className="flex flex-wrap gap-2">
      <span
        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${paymentTypeBadgeClass(bill.paymentType)}`}
      >
        {PAYMENT_TYPE_LABELS[bill.paymentType]}
      </span>
      <span
        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-wider uppercase ${statusBadgeClass(bill.status)}`}
      >
        {STATUS_LABELS[bill.status]}
      </span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-blue-700/80 dark:text-blue-300/70">{label}</dt>
      <dd className="text-right font-medium text-blue-900 dark:text-blue-200">{value}</dd>
    </div>
  )
}

function LineItemContent({ item }: { item: Bill['lineItems'][number] }) {
  return (
    <>
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-white">{item.description}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {item.quantity} × {formatRupiah(item.unitPrice)}
        </p>
      </div>
      <span className="text-sm font-bold text-zinc-900 dark:text-white">
        {formatRupiah(item.amount)}
      </span>
    </>
  )
}

function BillTotalSummary({ bill }: { bill: Bill }) {
  const displayAmount = getDisplayAmount(bill)
  return (
    <>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-zinc-800">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
          {bill.paymentType === 'BPJS' ? 'Estimasi bagian pasien' : 'Total'}
        </span>
        <span className="font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-white">
          {formatRupiah(displayAmount)}
        </span>
      </div>
      {bill.paymentType === 'BPJS' && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Total tagihan rumah sakit: {formatRupiah(bill.totalAmount)} (ditanggung BPJS)
        </p>
      )}
    </>
  )
}

function PaymentInstructionsBox() {
  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-4 dark:border-teal-900/50 dark:bg-teal-900/10">
      <h3 className="mb-1 text-sm font-bold text-teal-800 dark:text-teal-300">
        Cara Pembayaran
      </h3>
      <p className="text-sm text-teal-700/90 dark:text-teal-200/80">
        Silakan datang ke loket kasir dengan membawa bukti kunjungan. Setelah bayar, Anda dapat
        menekan tombol di bawah untuk mencatat konfirmasi.
      </p>
    </div>
  )
}

function BpjsInfoPanel({ bill }: { bill: Bill }) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 dark:border-blue-900/50 dark:bg-blue-900/10">
      <h3 className="mb-2 font-['Manrope'] text-sm font-extrabold text-blue-900 dark:text-blue-300">
        Informasi BPJS
      </h3>
      <p className="mb-3 text-sm leading-relaxed text-blue-800/90 dark:text-blue-200/80">
        Tagihan ini diverifikasi oleh administrasi rumah sakit. Peserta BPJS biasanya tidak
        membayar penuh di kasir — biaya ditanggung melalui klaim BPJS ke back-office rumah sakit.
      </p>
      <dl className="grid gap-2 text-sm">
        <DetailRow label="Status" value="Ditanggung BPJS" />
        {bill.bpjsNumber && <DetailRow label="No. Kartu BPJS" value={bill.bpjsNumber} />}
        <DetailRow
          label="No. SEP"
          value={bill.sepNumber ?? 'Menunggu penerbitan administrasi'}
        />
        {bill.patientShare != null && bill.patientShare > 0 && (
          <DetailRow
            label="Estimasi bagian pasien (copay)"
            value={formatRupiah(bill.patientShare)}
          />
        )}
      </dl>
    </div>
  )
}

function DetailPanelShell({
  onClose,
  title,
  children,
}: {
  onClose: () => void
  title: string
  children: ReactNode
}) {
  return (
    <div className="relative z-10 w-full max-w-lg">
      <div className="max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-[#1e1f20]">
        <DetailHeader onClose={onClose} title={title} />
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  )
}

function DetailHeader({ onClose, title }: { onClose: () => void; title: string }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase dark:text-slate-400">
          Detail Tagihan
        </p>
        <h2 className="font-['Manrope'] text-xl font-extrabold text-zinc-900 dark:text-white">
          {title}
        </h2>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Tutup
      </button>
    </div>
  )
}

function BillDetailOverlay({
  bill,
  onClose,
  onPay,
  isPaying,
}: {
  bill: Bill
  onClose: () => void
  onPay: () => void
  isPaying: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button type="button" aria-label="Tutup" className="absolute inset-0" onClick={onClose} />
      <DetailPanelShell onClose={onClose} title={bill.queue?.department?.name ?? 'Kunjungan'}>
        <MetaBadges bill={bill} />
        {bill.paymentType === 'BPJS' && <BpjsInfoPanel bill={bill} />}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#1e1f20]">
          <h3 className="mb-4 font-['Manrope'] text-sm font-extrabold text-zinc-900 dark:text-white">
            Rincian Tagihan
          </h3>
          <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
            {bill.lineItems.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                <LineItemContent item={item} />
              </li>
            ))}
          </ul>
          <BillTotalSummary bill={bill} />
        </div>

        {bill.notes && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm leading-relaxed text-slate-600 dark:border-zinc-800 dark:bg-[#131314] dark:text-slate-400">
            {bill.notes}
          </div>
        )}

        {bill.paymentType === 'UMUM' && !isPaid(bill.status) && <PaymentInstructionsBox />}

        {isUnpaid(bill.status) && (
          <button
            type="button"
            onClick={onPay}
            disabled={isPaying}
            className="w-full rounded-2xl bg-teal-600 px-6 py-3.5 text-sm font-black text-white transition-colors hover:bg-teal-700 disabled:opacity-60 dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            {isPaying
              ? 'Memproses...'
              : bill.paymentType === 'BPJS'
                ? 'Sudah selesai di kasir / verifikasi'
                : 'Sudah bayar di kasir'}
          </button>
        )}
      </DetailPanelShell>
    </div>
  )
}

export default function PatientBilling() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const {
    bills,
    selectedBill,
    isLoading,
    error,
    fetchPatientBills,
    fetchBill,
    payBill,
    clearSelectedBill,
  } = useBillingStore()
  const [filter, setFilter] = useState<BillFilter>('all')
  const [isPaying, setIsPaying] = useState(false)

  const patientId = user?.patient?.id

  useEffect(() => {
    if (patientId) {
      void fetchPatientBills(patientId)
    }
  }, [patientId, fetchPatientBills])

  const filteredBills = useMemo(() => {
    if (filter === 'unpaid') return bills.filter((b) => isUnpaid(b.status))
    if (filter === 'paid') return bills.filter((b) => isPaid(b.status))
    return bills
  }, [bills, filter])

  const handleOpenDetail = async (billId: string) => {
    await fetchBill(billId)
  }

  const handlePay = async () => {
    if (!selectedBill) return
    setIsPaying(true)
    try {
      await payBill(selectedBill.id, 'CASHIER')
    } finally {
      setIsPaying(false)
    }
  }

  const filterButtons: { key: BillFilter; label: string }[] = [
    { key: 'all', label: 'Semua' },
    { key: 'unpaid', label: 'Belum Bayar' },
    { key: 'paid', label: 'Lunas' },
  ]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
        Tagihan kunjungan yang sudah selesai. Peserta BPJS melihat status penanggungan dan
        verifikasi administrasi; pasien umum melihat rincian biaya untuk dibayar di kasir.
      </p>

      <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50/80 p-1 dark:border-zinc-800 dark:bg-[#131314]">
        {filterButtons.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
              filter === key
                ? 'bg-white text-teal-700 shadow-sm dark:bg-[#1e1f20] dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-xs font-bold tracking-widest text-teal-700 uppercase dark:text-teal-500">
          Memuat tagihan...
        </div>
      ) : filteredBills.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center dark:border-zinc-800 dark:bg-[#1e1f20]">
          <p className="font-medium text-slate-500 dark:text-slate-400">
            {filter === 'all'
              ? 'Belum ada tagihan dari kunjungan selesai.'
              : filter === 'unpaid'
                ? 'Tidak ada tagihan yang belum lunas.'
                : 'Tidak ada tagihan yang sudah lunas.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filteredBills.map((bill) => (
            <li
              key={bill.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-[#1e1f20]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="font-['Manrope'] text-lg font-extrabold text-zinc-900 dark:text-white">
                    {bill.queue?.department?.name ?? 'Kunjungan'}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {formatBillDate(bill)}
                    {bill.queue?.doctor?.user?.name && ` · ${bill.queue.doctor.user.name}`}
                  </p>
                  <MetaBadges bill={bill} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase dark:text-slate-400">
                    {bill.paymentType === 'BPJS' ? 'Bagian pasien' : 'Total'}
                  </p>
                  <p className="font-['Manrope'] text-xl font-extrabold text-zinc-900 dark:text-white">
                    {formatRupiah(getDisplayAmount(bill))}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleOpenDetail(bill.id)}
                  className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-black text-teal-700 transition-colors hover:bg-teal-100 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-400 dark:hover:bg-teal-500/20"
                >
                  Lihat Detail
                </button>
                {bill.queueId && (
                  <button
                    type="button"
                    onClick={() => navigate(`/portal/queues/${bill.queueId}`)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black text-slate-600 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Kunjungan
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedBill && (
        <BillDetailOverlay
          bill={selectedBill}
          onClose={clearSelectedBill}
          onPay={() => void handlePay()}
          isPaying={isPaying}
        />
      )}
    </div>
  )
}
