"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, LayoutDashboard, Bell } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { useAuth } from "@/lib/auth-context";
import { getUnreadCount } from "@/lib/user-profile";
import { getAvatarBg, getInitial } from "@/lib/citizen-voice";

const navLinks = [
  { href: "/",      label: "Beranda"     },
  { href: "/desa",  label: "Data Desa"   },
  { href: "/suara", label: "Suara Warga" },
];

// ─── Avatar mini ──────────────────────────────────────────────────────────────

function NavAvatar({ nama, avatarUrl }: { nama: string; avatarUrl?: string }) {
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={nama} className="w-7 h-7 rounded-full object-cover" />
    );
  }
  return (
    <div className={`w-7 h-7 rounded-full ${getAvatarBg(nama)} flex items-center justify-center text-white text-xs font-black`}>
      {getInitial(nama)}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname        = usePathname();
  const router          = useRouter();
  const { user, logout } = useAuth();

  const isHidden = pathname.startsWith("/desa-admin") || pathname.startsWith("/admin") || pathname === "/login";
  if (isHidden) return null;

  const handleLogout = () => { logout(); router.push("/"); };

  const unread = user?.role === "warga" ? getUnreadCount(user.nama) : 0;

  // Right-side content per role
  const renderRight = () => {
    if (!user) {
      return (
        <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm">
          Masuk
        </Link>
      );
    }

    if (user.role === "warga") {
      return (
        <div className="flex items-center gap-1.5">
          {/* Notif bell */}
          <Link href="/profil/saya?tab=notifikasi" className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <Bell size={16} className="text-slate-500" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-600 rounded-full text-white text-[8px] font-black flex items-center justify-center">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          {/* Avatar dropdown */}
          <Link href="/profil/saya" className="flex items-center gap-2 hover:bg-slate-50 px-2 py-1.5 rounded-xl transition-colors">
            <NavAvatar nama={user.nama} avatarUrl={user.avatarUrl} />
            <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate hidden sm:block">
              {user.nama.split(" ")[0]}
            </span>
          </Link>
          <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors" title="Keluar">
            <LogOut size={14} />
          </button>
        </div>
      );
    }

    // desa / admin
    return (
      <div className="flex items-center gap-2">
        <Link
          href={user.role === "admin" ? "/admin" : "/desa-admin"}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors"
        >
          <LayoutDashboard size={13} />
          {user.role === "admin" ? "Admin" : "Dashboard"}
        </Link>
        <button onClick={handleLogout} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors">
          <LogOut size={14} />
        </button>
      </div>
    );
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm">
              <Image src={ASSETS.logo} alt="PantauDesa" width={28} height={28} className="w-full h-full object-cover" priority />
            </div>
            <span className="font-bold text-lg text-slate-800">Pantau<span className="text-indigo-600">Desa</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center">{renderRight()}</div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pb-4 pt-2">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.href ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-100">
            {!user && (
              <Link href="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm font-semibold text-indigo-600">
                Masuk
              </Link>
            )}
            {user?.role === "warga" && (
              <>
                <Link href="/profil/saya" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700">
                  <NavAvatar nama={user.nama} avatarUrl={user.avatarUrl} /> Profil Saya
                  {unread > 0 && <span className="ml-auto bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{unread}</span>}
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 w-full">
                  <LogOut size={14} /> Keluar
                </button>
              </>
            )}
            {(user?.role === "desa" || user?.role === "admin") && (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/desa-admin"} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-indigo-600">
                  <LayoutDashboard size={14} /> Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2.5 text-sm text-rose-600 w-full">
                  <LogOut size={14} /> Keluar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
