import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import { Desa, SortField, SortOrder } from "@/lib/types";
import { formatRupiah, getStatusColor, getStatusLabel, getSerapanColor } from "@/lib/utils";
import { TABLE_HEADERS } from "@/lib/copy";

interface Props {
  desa: Desa[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortHeader({ label, field, active, onSort }: {
  label: string; field: SortField; active: boolean; order: SortOrder; onSort: (f: SortField) => void;
}) {
  return (
    <button onClick={() => onSort(field)} className="flex items-center gap-1 hover:text-indigo-600 transition-colors">
      {label}
      <ArrowUpDown size={12} className={active ? "text-indigo-500" : "text-slate-300"} />
    </button>
  );
}

export default function DesaTable({ desa, sortField, sortOrder, onSort }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-xs font-medium text-slate-500">
              <th className="text-left px-4 py-3">
                <SortHeader label={TABLE_HEADERS.nama} field="nama" active={sortField === "nama"} order={sortOrder} onSort={onSort} />
              </th>
              <th className="text-left px-4 py-3 hidden md:table-cell">{TABLE_HEADERS.wilayah}</th>
              <th className="text-right px-4 py-3 hidden lg:table-cell">
                <SortHeader label={TABLE_HEADERS.anggaran} field="totalAnggaran" active={sortField === "totalAnggaran"} order={sortOrder} onSort={onSort} />
              </th>
              <th className="text-right px-4 py-3 hidden lg:table-cell">{TABLE_HEADERS.realisasi}</th>
              <th className="text-right px-4 py-3">
                <SortHeader label={TABLE_HEADERS.serapan} field="persentaseSerapan" active={sortField === "persentaseSerapan"} order={sortOrder} onSort={onSort} />
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {desa.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-4 py-3">
                  <Link href={`/desa/${d.id}`} className="block">
                    <p className="font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">{d.nama}</p>
                    <p className="text-xs text-slate-400 md:hidden">{d.kabupaten}</p>
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                  <p className="text-xs">{d.kecamatan}</p>
                  <p className="text-xs text-slate-400">{d.kabupaten}, {d.provinsi}</p>
                </td>
                <td className="px-4 py-3 text-right text-slate-700 hidden lg:table-cell">{formatRupiah(d.totalAnggaran)}</td>
                <td className="px-4 py-3 text-right text-slate-700 hidden lg:table-cell">{formatRupiah(d.terealisasi)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getStatusColor(d.status)}`}>
                      {getStatusLabel(d.status)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getSerapanColor(d.persentaseSerapan)}`} style={{ width: `${d.persentaseSerapan}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{d.persentaseSerapan}%</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Link href={`/desa/${d.id}`} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">
                    Lihat Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
