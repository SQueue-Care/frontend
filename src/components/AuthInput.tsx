// src/components/AuthInput.tsx
import { type InputHTMLAttributes } from "react";

/**
 * Properti untuk komponen AuthInput.
 */
interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Komponen input teks standar untuk alur autentikasi RS Ethereal.
 * Sudah terintegrasi dengan gaya Tailwind dan standar Aksesibilitas (ARIA) untuk pembaca layar.
 * * @component
 * @example
 * // Penggunaan normal:
 * <AuthInput label="NIK" placeholder="Masukkan 16 digit angka" />
 * * // Penggunaan dengan state eror:
 * <AuthInput label="Kata Sandi" type="password" error="Kata sandi minimal 8 karakter" />
 */

export default function AuthInput({ label, error, id, ...props }: AuthInputProps) {
  // Menghasilkan ID unik secara otomatis jika parent tidak mengirimkan props 'id'
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-2">
      {/* Menghubungkan label dengan input menggunakan htmlFor */}
      {label && (
        <label htmlFor={inputId} className="text-zinc-700 text-sm font-semibold">
          {label}
        </label>
      )}
      <input
        id={inputId}
        // ARIA: Memberitahu Screen Reader jika input ini sedang bermasalah
        aria-invalid={!!error}
        // ARIA: Memaksa Screen Reader membacakan pesan eror setelah membacakan input
        aria-describedby={error ? errorId : undefined}
        className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-zinc-900 text-sm focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
          error
            ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
            : 'border-slate-200 focus:ring-teal-500/50 focus:border-teal-500'
        }`}
        {...props}
      />
      {error && (
        // aria-live="polite" membuat Screen Reader membacakan pesan ini saat muncul tanpa memotong suara yang sedang berjalan
        <span id={errorId} aria-live="polite" className="text-red-500 text-xs font-medium">
          {error}
        </span>
      )}
    </div>
  );
}