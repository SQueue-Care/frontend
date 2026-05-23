// src/components/ui/CustomAlert.tsx
import { Transition } from '@headlessui/react'
import { Fragment, useEffect } from 'react'
import { useAlertStore } from '../../store/alertStore'

export default function CustomAlert() {
  const { isOpen, message, type, hideAlert } = useAlertStore()

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        hideAlert()
      }, 4500)
      return () => clearTimeout(timer)
    }
  }, [isOpen, hideAlert])

  // PERHATIKAN: TIDAK ADA LAGI "if (!isOpen) return null;" DI SINI.
  // Biarkan <Transition> yang mengurus kapan komponen harus hilang dari layar.

  const getAlertConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: (
            <svg
              className="h-5 w-5 text-teal-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ),
          title: 'Berhasil',
        }
      case 'error':
        return {
          icon: (
            <svg
              className="h-5 w-5 text-rose-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ),
          title: 'Kesalahan Sistem',
        }
      case 'warning':
        return {
          icon: (
            <svg
              className="h-5 w-5 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          title: 'Peringatan',
        }
      default:
        return {
          icon: (
            <svg
              className="h-5 w-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          title: 'Informasi',
        }
    }
  }

  const config = getAlertConfig()

  return (
    <Transition
      show={isOpen}
      appear
      as={Fragment}
      enter="transform transition-all duration-500 ease-out"
      enterFrom="opacity-0 -translate-y-[150%]"
      enterTo="opacity-100 translate-y-0"
      leave="transform transition-all duration-700 ease-in"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-[150%]"
    >
      <div className="pointer-events-auto fixed top-6 left-1/2 z-300 w-[90%] max-w-sm -translate-x-1/2">
        <div className="flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md dark:border-zinc-800 dark:bg-[#1e1f20]/95">
          <div className="mt-0.5 shrink-0">{config.icon}</div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-extrabold tracking-tight text-zinc-950 dark:text-zinc-100">
              {config.title}
            </h4>
            <p className="mt-1 text-xs leading-relaxed font-medium wrap-break-word whitespace-pre-wrap text-slate-600 dark:text-zinc-400">
              {message}
            </p>
          </div>
          <button
            onClick={hideAlert}
            className="-mr-1 shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors outline-none hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300"
            title="Tutup"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  )
}
