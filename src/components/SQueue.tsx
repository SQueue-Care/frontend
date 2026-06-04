export default function SQueueLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Definisi Pemotongan Ruang Negatif secara Matematis */}
      <defs>
        <mask id="squeue-cutout">
          {/* Area putih: Bagian yang akan dirender / terlihat */}
          <rect width="100" height="100" fill="white" />
          
          {/* Jarum jam: Hitam berarti akan melubangi bentuk jam menjadi transparan */}
          <path d="M42 42 L42 18 M42 42 L58 58" stroke="black" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="42" cy="42" r="3.5" fill="black" />
          
          {/* Pemotongan asimetris untuk memisahkan jam dan palang medis (Padding 4px) */}
          <rect x="51" y="59" width="38" height="22" rx="4" fill="black" />
          <rect x="59" y="51" width="22" height="38" rx="4" fill="black" />
        </mask>
      </defs>

      {/* Bentuk 1: Siluet Jam yang dipotong oleh mask di atas */}
      <circle cx="42" cy="42" r="38" className="fill-teal-600 dark:fill-teal-400" mask="url(#squeue-cutout)" />

      {/* Bentuk 2: Siluet Palang Medis di Kanan Bawah */}
      <rect x="55" y="65" width="30" height="10" rx="2.5" className="fill-teal-600 dark:fill-teal-400" />
      <rect x="65" y="55" width="10" height="30" rx="2.5" className="fill-teal-600 dark:fill-teal-400" />
    </svg>
  );
}