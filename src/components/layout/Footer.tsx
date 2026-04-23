import { BarChart3 } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-500 flex items-center justify-center">
              <BarChart3 size={15} className="text-white" />
            </div>
            <span className="font-semibold text-white text-sm">
              Pantau<span className="text-indigo-400">Desa</span>
            </span>
          </div>
          <p className="text-xs text-center">
            Platform transparansi anggaran dan penyerapan dana desa Indonesia &mdash; Data bersifat ilustrasi.
          </p>
          <p className="text-xs">&copy; 2024 PantauDesa</p>
        </div>
      </div>
    </footer>
  );
}
