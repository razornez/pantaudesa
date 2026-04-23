import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-5">
        <span className="text-2xl font-bold text-indigo-600">404</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">
        Halaman yang Anda cari tidak tersedia atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors text-sm"
      >
        <Home size={16} />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
