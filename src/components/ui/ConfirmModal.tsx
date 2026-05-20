// src/components/ui/ConfirmModal.tsx
import React from 'react';
import { createPortal } from 'react-dom'; // INJEKSI MUTLAK: Import React Portal

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
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
  type = 'danger'
}: ConfirmModalProps) {
  // Jika tidak open, jangan render apa-apa
  if (!isOpen) return null;

  const themes = {
    danger: {
      iconBg: 'bg-rose-100',
      iconText: 'text-rose-600',
      buttonBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20',
      iconPath: <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    },
    warning: {
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      buttonBg: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
      iconPath: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
    info: {
      iconBg: 'bg-teal-100',
      iconText: 'text-teal-600',
      buttonBg: 'bg-teal-600 hover:bg-teal-700 shadow-teal-500/20',
      iconPath: <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    }
  };

  const currentTheme = themes[type];

  // EKSEKUSI PORTAL: Merender UI langsung ke document.body
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      
      {/* Latar Belakang Glassmorphism (Sekarang akan menutupi segalanya) */}
      <div 
        className="absolute inset-0 bg-white/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={!isLoading ? onCancel : undefined}
      />

      <div className="relative bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
        <div className="p-6 md:p-8 text-center">
          
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner ${currentTheme.iconBg} ${currentTheme.iconText}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {currentTheme.iconPath}
            </svg>
          </div>
          
          <h3 className="text-xl font-black text-zinc-900 tracking-tight mb-2 font-['Manrope']">{title}</h3>
          <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full px-4 py-3.5 text-white font-black rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed outline-none flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] ${currentTheme.buttonBg}`}
            >
              {isLoading ? (
                 <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg> Memproses...</>
              ) : confirmText}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="w-full px-4 py-3.5 text-slate-500 font-extrabold hover:bg-slate-100 rounded-xl transition-all active:scale-95 outline-none uppercase tracking-widest text-[10px]"
            >
              {cancelText}
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body // Target penempelan mutlak
  );
}