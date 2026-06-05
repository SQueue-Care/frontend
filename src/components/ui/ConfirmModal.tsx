// src/components/ui/ConfirmModal.tsx
import { createPortal } from 'react-dom' 

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  onConfirm,
  onCancel,
  isLoading = false,
  type = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null

  const themes = {
    danger: {
      iconBg: 'bg-rose-100 dark:bg-rose-500/20',
      iconText: 'text-rose-600 dark:text-rose-400',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 dark:bg-rose-600/90 dark:hover:bg-rose-600',
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      ),
    },
    warning: {
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
      iconText: 'text-amber-600 dark:text-amber-400',
      buttonBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 dark:bg-amber-600/90 dark:hover:bg-amber-600',
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    info: {
      iconBg: 'bg-teal-100 dark:bg-teal-500/20',
      iconText: 'text-teal-600 dark:text-teal-400',
      buttonBg: 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20 dark:bg-teal-600/90 dark:hover:bg-teal-600',
      iconPath: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
  }

  const currentTheme = themes[type]

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center px-4">
      <div
        className="animate-in fade-in absolute inset-0 bg-white/40 backdrop-blur-sm transition-opacity duration-300 dark:bg-[#131314]/80"
        onClick={!isLoading ? onCancel : undefined}
      />

      <div className="animate-in zoom-in-95 relative w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] duration-300 dark:border-zinc-800 dark:bg-[#1e1f20]">
        <div className="p-6 text-center md:p-8">
          <div
            className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full shadow-inner ${currentTheme.iconBg} ${currentTheme.iconText}`}
          >
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              {currentTheme.iconPath}
            </svg>
          </div>

          <h3 className="mb-2 font-['Manrope'] text-xl tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
          <p className="mb-8 text-sm leading-relaxed font-medium text-slate-500 dark:text-zinc-400">{message}</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-[10px] tracking-widest text-white uppercase shadow-lg transition-all outline-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${currentTheme.buttonBg}`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"></circle>
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      className="opacity-75"
                    ></path>
                  </svg>{' '}
                  Memproses...
                </>
              ) : (
                confirmText
              )}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="w-full rounded-xl px-4 py-3.5 text-[10px] tracking-widest text-slate-500 uppercase transition-all outline-none hover:bg-slate-100 active:scale-95 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body 
  )
}
