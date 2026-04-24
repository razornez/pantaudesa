"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/",       label: "Beranda"     },
  { href: "/desa",   label: "Data Desa"   },
  { href: "/suara",  label: "Suara Warga" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuth();

  // Sembunyikan navbar default di halaman admin/desa-admin
  const isAdminPage = pathname.startsWith("/desa-admin") || pathname.startsWith("/admin") || pathname === "/login";
  if (isAdminPage) return null;

  const handleLogout = () => { logout(); router.push("/login"); };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
              <Image src={ASSETS.logo} alt="PantauDesa" width={32} height={32} className="w-full h-full object-cover" priority />
            </div>
            <span className="font-bold text-xl text-slate-800">
              Pantau<span className="text-indigo-600">Desa</span>
            </span>
          </Link>

          {/* Desktop nav */}
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

          {/* Right: auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href={user.role === "admin" ? "/admin" : "/desa-admin"}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors"
                >
                  <LayoutDashboard size={13} />
                  {user.role === "admin" ? "Admin" : "Dashboard Desa"}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Keluar"
                >
                  <LogOut size={15} />
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
              >
                Masuk Portal Desa
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
          <div className="mt-2 pt-2 border-t border-slate-100">
            {user ? (
              <>
                <Link
                  href={user.role === "admin" ? "/admin" : "/desa-admin"}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-indigo-600"
                >
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 w-full">
                  <LogOut size={14} /> Keluar
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-indigo-600">
                Masuk Portal Desa
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
