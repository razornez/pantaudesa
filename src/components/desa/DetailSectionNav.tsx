import { BadgeCheck } from "lucide-react";

export interface DetailSectionNavItem {
  href: string;
  label: string;
}

export default function DetailSectionNav({
  sections,
}: {
  sections: DetailSectionNavItem[];
}) {
  if (sections.length === 0) return null;

  return (
    <nav
      aria-label="Navigasi bagian detail desa"
      className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm"
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {sections.map((section) => (
          <a
            key={section.href}
            href={section.href}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <BadgeCheck size={14} aria-hidden />
            {section.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
