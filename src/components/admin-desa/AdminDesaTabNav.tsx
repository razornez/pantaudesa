"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminDesaTab } from "@/lib/admin-claim/profile-tabs";

export default function AdminDesaTabNav({ tabs }: { tabs: AdminDesaTab[] }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin Desa tabs"
      className="overflow-x-auto no-scrollbar"
      style={{ borderTop: "1px solid var(--hair)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
        <div className="inline-flex sm:flex min-w-max sm:min-w-0 items-center gap-2 rounded-[1.35rem] bg-white/80 p-1.5 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06),0_18px_38px_-28px_rgba(15,23,42,0.28)]">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={`relative px-4 py-3 text-sm font-semibold whitespace-nowrap t-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 rounded-2xl ${
                active
                  ? "text-[#1E1B4B] bg-white shadow-[0_14px_24px_-20px_rgba(30,27,75,0.6),inset_0_0_0_1px_rgba(79,70,229,0.14)]"
                  : "text-slate-500 hover:text-slate-900 hover:bg-white/70"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
              {active && (
                <span
                  className="absolute bottom-1 left-4 right-4 h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, #4F46E5, #1E1B4B)" }}
                />
              )}
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}
