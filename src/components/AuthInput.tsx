// src/components/AuthInput.tsx
import { type InputHTMLAttributes } from "react";

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function AuthInput({label, error, ...props}: AuthInputProps) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-zinc-700 text-sm font-semibold">{label}</label>
            <input className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl text-zinc-900 text-sm focus:outline-none focus:ring-2transition-all placeholder:text-slate-400 ${
                error
                    ?'border-red-500 focus:ring-red-500/50 focus:border-red-500' 
                    : 'border-slate-200 focus:ring-teal-500/50 focus:border-teal-500'
            }`} 
            {...props}
            />
            {error && <span className="text-red-500 text-xs font-medium">{error}</span>}
        </div>
    );
}