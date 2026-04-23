// src/components/AuthButton.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Properti untuk komponen AuthButton.
 */
interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
}

/**
 * Komponen tombol aksi utama (Call to Action) untuk autentikasi.
 * Memiliki warna gradien bawaan RS Ethereal dan penanganan interaksi saat memuat data.
 * * @component
 * @example
 * // Penggunaan dasar:
 * <AuthButton type="submit">Masuk ke Portal</AuthButton>
 * * // Penggunaan saat menunggu respons API:
 * <AuthButton isLoading={true}>Memverifikasi...</AuthButton>
 */

export default function AuthButton({ children, isLoading, className = '', ...props }: AuthButtonProps) {
  return (
    <button
      disabled={isLoading || props.disabled}
      // ARIA: Menginformasikan status tombol secara eksplisit
      aria-disabled={isLoading || props.disabled}
      aria-busy={isLoading}
      className={`w-full py-4 bg-gradient-to-r from-[#0d9488] to-[#2563eb] hover:opacity-90 transition-opacity rounded-xl text-white text-base font-bold shadow-lg shadow-teal-700/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg aria-hidden="true" className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        children
      )}
    </button>
  );
}