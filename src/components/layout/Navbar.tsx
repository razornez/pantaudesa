"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, BarChart3 } from "lucide-react";

const navLinks = [
  { href: "/", label: "Beranda" },
  { href: "/desa", label: "Data Desa" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md group-hover:bg-indigo-500 transition-colors">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl text-slate-800">
              Pantau<span className="text-indigo-600">Desa</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
