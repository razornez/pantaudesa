import { ImageResponse } from "next/og";
import { getDesaByIdOrSlugWithFallback } from "@/lib/data/desa-read";

export const runtime = "nodejs";
export const alt = "PantauDesa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const desa = await getDesaByIdOrSlugWithFallback(id).catch(() => null);

  const nama = desa?.nama ?? "Detail Desa";
  const kabupaten = desa?.kabupaten ?? "";
  const provinsi = desa?.provinsi ?? "";
  const kategori = desa?.kategori ?? "";

  const kategoriColor =
    kategori === "Mandiri" ? "#10b981"
    : kategori === "Maju" ? "#6366f1"
    : kategori === "Berkembang" ? "#f59e0b"
    : "#64748b";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1e3a5f 100%)",
          padding: "56px 72px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* background glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 500,
            height: 500,
            background: "radial-gradient(circle at 70% 20%, rgba(99,102,241,0.2) 0%, transparent 65%)",
          }}
        />

        {/* top: logo + tagline */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 800,
              color: "white",
            }}
          >
            P
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.01em" }}>
            Pantau<span style={{ color: "#818cf8" }}>Desa</span>
          </span>
          <span style={{ fontSize: 14, color: "#475569", marginLeft: 8 }}>pantaudesa.id</span>
        </div>

        {/* center: desa name */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {kategori ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 16,
                fontWeight: 600,
                color: kategoriColor,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: kategoriColor,
                }}
              />
              Desa {kategori}
            </div>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 600, color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Data Desa
            </div>
          )}
          <div
            style={{
              fontSize: nama.length > 20 ? 64 : 80,
              fontWeight: 800,
              color: "#f1f5f9",
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
            }}
          >
            {nama}
          </div>
          <div style={{ fontSize: 26, color: "#94a3b8", fontWeight: 400 }}>
            {[kabupaten, provinsi].filter(Boolean).join(" · ")}
          </div>
        </div>

        {/* bottom: cta */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 18, color: "#64748b" }}>
            Dana desa, anggaran, transparansi — semua di PantauDesa
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#818cf8",
              background: "rgba(99,102,241,0.15)",
              padding: "10px 20px",
              borderRadius: 8,
              border: "1px solid rgba(99,102,241,0.3)",
            }}
          >
            Lihat data desa →
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
