import { Check } from "lucide-react";
import type { AdminClaimActiveClaim, AdminClaimActiveMember } from "@/lib/data/admin-claim-read";

type StepState = "done" | "active" | "upcoming";

export default function AdminClaimTimeline({
  claim,
  member,
}: {
  claim: AdminClaimActiveClaim | null;
  member: AdminClaimActiveMember | null;
}) {
  const hasClaim         = Boolean(claim);
  const hasMethod        = Boolean(claim?.method);
  const hasVerifiedToken = Boolean(claim?.hasActiveToken || claim?.verifiedAt || member);
  const isLimited       = member?.status === "LIMITED";
  const isVerified       = member?.status === "VERIFIED";

  const steps: Array<{
    num: number;
    state: StepState;
    title: string;
    note: string;
  }> = [
    {
      num: 1,
      state: hasClaim ? "done" : "active",
      title: "Klaim diajukan",
      note: hasClaim ? "Klaim sudah tercatat di sistem." : "Pilih desa dan kirim klaim untuk memulai.",
    },
    {
      num: 2,
      state: !hasClaim ? "upcoming" : hasMethod ? "done" : "active",
      title: hasMethod && claim?.method === "WEBSITE_TOKEN" ? "Metode: Website" : "Metode: Email",
      note: !hasClaim ? "Tunggu klaim tercatat lebih dulu." : !hasMethod ? "Pilih metode verifikasi dan ikuti instruksinya." : claim?.method === "WEBSITE_TOKEN" ? "Token website sudah dipilih." : "Email verifikasi sudah dipilih.",
    },
    {
      num: 3,
      state: !hasMethod ? "upcoming" : hasVerifiedToken ? "done" : "active",
      title: claim?.method === "WEBSITE_TOKEN" ? "Token dicek di website" : "Email diverifikasi",
      note: !hasMethod ? "Selesaikan langkah 2 lebih dulu." : !hasVerifiedToken ? "Verifikasi masih menunggu. Cek email atau pasang token di website." : "Verifikasi berhasil. Status segera diperbarui.",
    },
    {
      num: 4,
      state: !hasVerifiedToken ? "upcoming" : isLimited || isVerified ? "done" : "active",
      title: isVerified ? "Admin VERIFIED aktif" : "Admin LIMITED aktif",
      note: !hasVerifiedToken ? "Selesaikan verifikasi lebih dulu." : isVerified ? "Kamu admin terverifikasi. Bisa mengundang admin lain." : "Akses admin terbatas aktif. Selesaikan verifikasi untuk naik ke VERIFIED.",
    },
  ];

  const activeStepIndex = steps.findIndex((s) => s.state === "active");

  const stateStyles: Record<StepState, {
    dot: string; line: string; card: string;
    title: string; note: string; badge: string;
  }> = {
    done: {
      dot: "bg-emerald-500 text-white ring-emerald-100",
      line: "bg-emerald-400",
      card: "border-emerald-100 bg-emerald-50",
      title: "text-emerald-800 font-bold",
      note: "text-emerald-600",
      badge: "bg-emerald-500 text-white",
    },
    active: {
      dot: "bg-indigo-600 text-white ring-indigo-100",
      line: "bg-slate-200",
      card: "border-indigo-100 bg-indigo-50",
      title: "text-indigo-800 font-bold",
      note: "text-indigo-600",
      badge: "bg-indigo-600 text-white",
    },
    upcoming: {
      dot: "bg-slate-200 text-slate-400 ring-slate-50",
      line: "bg-slate-100",
      card: "border-slate-100 bg-slate-50",
      title: "text-slate-400 font-semibold",
      note: "text-slate-400",
      badge: "bg-slate-200 text-slate-400",
    },
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-black text-slate-900">Progress Klaim Admin</p>
        {activeStepIndex >= 0 ? (
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
            Langkah {activeStepIndex + 1} aktif
          </span>
        ) : steps.every((s) => s.state === "done") ? (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
            ✓ Selesai
          </span>
        ) : null}
      </div>

      <div className="relative">
        {steps.map((step, i) => {
          const s = stateStyles[step.state];
          const isLast = i === steps.length - 1;

          return (
            <div key={step.num} className="relative flex gap-4">
              {/* Left: dot + connector */}
              <div className="flex flex-col items-center">
                <div className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ring-4 ${s.dot}`}>
                  {step.state === "done" ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-black">{step.num}</span>
                  )}
                </div>
                {!isLast && <div className={`w-0.5 min-h-6 flex-1 ${s.line}`} />}
              </div>

              {/* Right: step card */}
              <div className={`mb-4 flex-1 rounded-xl border p-3 ${s.card}`}>
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className={`text-xs ${s.title}`}>{step.title}</p>
                  <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${s.badge}`}>
                    {step.state === "done" ? "✓" : step.num}
                  </span>
                </div>
                <p className={`text-[10px] leading-relaxed ${s.note}`}>{step.note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
