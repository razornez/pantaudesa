import type { AdminClaimActiveClaim, AdminClaimActiveMember } from "@/lib/data/admin-claim-read";

function itemClass(active: boolean) {
  return active
    ? "border-indigo-200 bg-indigo-50 text-indigo-800"
    : "border-slate-200 bg-white text-slate-500";
}

export default function AdminClaimTimeline({
  claim,
  member,
}: {
  claim: AdminClaimActiveClaim | null;
  member: AdminClaimActiveMember | null;
}) {
  const items = [
    { key: "created", label: "Klaim dibuat", active: Boolean(claim) },
    { key: "method", label: claim?.method === "WEBSITE_TOKEN" ? "Metode website dipilih" : "Metode email dipilih", active: Boolean(claim?.method) },
    {
      key: "verification",
      label: claim?.method === "WEBSITE_TOKEN" ? "Token website diproses" : "Email verifikasi dikirim",
      active: Boolean(claim?.hasActiveToken || member || claim?.verifiedAt),
    },
    {
      key: "limited",
      label: "Admin terbatas aktif",
      active: member?.status === "LIMITED" || member?.status === "VERIFIED",
    },
    {
      key: "verified",
      label: "Admin terverifikasi",
      active: member?.status === "VERIFIED",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-black text-slate-900">Progress klaim aktif</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.key} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${itemClass(item.active)}`}>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
