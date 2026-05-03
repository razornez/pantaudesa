"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminDesaTab } from "@/lib/admin-claim/profile-tabs";

export default function AdminDesaTabNav({ tabs }: { tabs: AdminDesaTab[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin Desa tabs"
      className="border-t border-slate-100 overflow-x-auto"
    >
      <div className="max-w-5xl mx-auto px-4 flex items-center gap-1 min-w-max">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                active
                  ? "text-indigo-700"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
