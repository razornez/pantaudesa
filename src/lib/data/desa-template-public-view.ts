import type {
  APBDesItem,
  AsetDesa,
  BumdesInfo,
  FasilitasDesa,
  LembagaDesa,
  OutputFisik,
  PerangkatDesa,
  ProfilDesa,
  RiwayatTahunan,
} from "@/lib/types";

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

export function readPublishedString(
  publishedValues: Record<string, unknown>,
  key: string,
): string | null {
  const input = publishedValues[key];
  return typeof input === "string" && input.trim().length > 0 ? input.trim() : null;
}

export function readPublishedNumber(
  publishedValues: Record<string, unknown>,
  key: string,
): number | null {
  const input = publishedValues[key];
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string" && input.trim().length > 0) {
    const parsed = Number(input);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function hasAnyPublishedValue(
  publishedValues: Record<string, unknown>,
  fieldKeys: string[],
): boolean {
  return fieldKeys.some((fieldKey) => {
    const value = publishedValues[fieldKey];
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });
}

export function toPublishedAsetDesaArray(
  input: unknown,
): AsetDesa[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(isRecord)
    .map((item) => {
      const nama = typeof item.nama === "string" ? item.nama.trim() : "";
      const lokasi = typeof item.lokasi === "string" ? item.lokasi.trim() : "";
      const jenis = typeof item.jenis === "string" ? item.jenis.trim() : "";
      const nilai = typeof item.nilai === "number" ? item.nilai : Number(item.nilai);
      const tahunBeli =
        typeof item.tahunBeli === "number" ? item.tahunBeli : Number(item.tahunBeli);
      const kondisi = typeof item.kondisi === "string" ? item.kondisi.trim() : "";

      if (
        !nama ||
        !lokasi ||
        !["tanah", "bangunan", "kendaraan", "peralatan", "infrastruktur", "lainnya"].includes(
          jenis,
        ) ||
        !Number.isFinite(nilai) ||
        !Number.isFinite(tahunBeli) ||
        !["baik", "sedang", "rusak"].includes(kondisi)
      ) {
        return null;
      }

      return {
        nama,
        lokasi,
        nilai,
        tahunBeli,
        jenis: jenis as AsetDesa["jenis"],
        kondisi: kondisi as AsetDesa["kondisi"],
      } satisfies AsetDesa;
    })
    .filter((item): item is AsetDesa => Boolean(item));
}

export function toPublishedFasilitasDesaArray(
  input: unknown,
): FasilitasDesa[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(isRecord)
    .map((item) => {
      const nama = typeof item.nama === "string" ? item.nama.trim() : "";
      const jenis = typeof item.jenis === "string" ? item.jenis.trim() : "";
      const jumlah = typeof item.jumlah === "number" ? item.jumlah : Number(item.jumlah);
      const kondisi = typeof item.kondisi === "string" ? item.kondisi.trim() : "";
      const ket = typeof item.ket === "string" && item.ket.trim() ? item.ket.trim() : undefined;

      if (
        !nama ||
        !["pendidikan", "kesehatan", "olahraga", "ibadah", "umum", "ekonomi"].includes(
          jenis,
        ) ||
        !Number.isFinite(jumlah) ||
        !["baik", "sedang", "rusak"].includes(kondisi)
      ) {
        return null;
      }

      return {
        nama,
        jenis: jenis as FasilitasDesa["jenis"],
        jumlah,
        kondisi: kondisi as FasilitasDesa["kondisi"],
        ...(ket ? { ket } : {}),
      } satisfies FasilitasDesa;
    })
    .filter((item): item is FasilitasDesa => Boolean(item));
}

export function toPublishedLembagaDesaArray(
  input: unknown,
): LembagaDesa[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(isRecord)
    .map((item) => {
      const nama = typeof item.nama === "string" ? item.nama.trim() : "";
      const jenis = typeof item.jenis === "string" ? item.jenis.trim() : "";
      const ketua = typeof item.ketua === "string" ? item.ketua.trim() : "";
      const anggota = typeof item.anggota === "number" ? item.anggota : Number(item.anggota);
      const tahunBerdiri =
        typeof item.tahunBerdiri === "number"
          ? item.tahunBerdiri
          : Number(item.tahunBerdiri);
      const aktif = typeof item.aktif === "boolean" ? item.aktif : null;
      const deskripsi =
        typeof item.deskripsi === "string" ? item.deskripsi.trim() : "";
      const program =
        typeof item.program === "string" && item.program.trim()
          ? item.program.trim()
          : undefined;

      if (
        !nama ||
        ![
          "pemerintahan",
          "keamanan",
          "pemberdayaan",
          "keagamaan",
          "ekonomi",
          "kesehatan",
          "pendidikan",
        ].includes(jenis) ||
        !ketua ||
        !Number.isFinite(anggota) ||
        !Number.isFinite(tahunBerdiri) ||
        aktif === null ||
        !deskripsi
      ) {
        return null;
      }

      return {
        nama,
        jenis: jenis as LembagaDesa["jenis"],
        ketua,
        anggota,
        tahunBerdiri,
        aktif,
        deskripsi,
        ...(program ? { program } : {}),
      } satisfies LembagaDesa;
    })
    .filter((item): item is LembagaDesa => Boolean(item));
}

export function toPublishedBumdesInfo(
  input: unknown,
): BumdesInfo | null {
  if (!isRecord(input)) return null;

  const nama = typeof input.nama === "string" ? input.nama.trim() : "";
  const bidangUsaha =
    typeof input.bidangUsaha === "string" ? input.bidangUsaha.trim() : "";
  const tahunBerdiri =
    typeof input.tahunBerdiri === "number"
      ? input.tahunBerdiri
      : Number(input.tahunBerdiri);
  const modal = typeof input.modal === "number" ? input.modal : Number(input.modal);
  const status = typeof input.status === "string" ? input.status.trim() : "";
  const deskripsi =
    typeof input.deskripsi === "string" ? input.deskripsi.trim() : "";
  const omsetPerTahun =
    typeof input.omsetPerTahun === "number"
      ? input.omsetPerTahun
      : Number(input.omsetPerTahun);

  if (
    !nama ||
    !bidangUsaha ||
    !Number.isFinite(tahunBerdiri) ||
    !Number.isFinite(modal) ||
    !["aktif", "tidak_aktif", "dalam_pembentukan"].includes(status) ||
    !deskripsi
  ) {
    return null;
  }

  return {
    nama,
    bidangUsaha,
    tahunBerdiri,
    modal,
    status: status as BumdesInfo["status"],
    deskripsi,
    ...(Number.isFinite(omsetPerTahun) ? { omsetPerTahun } : {}),
  } satisfies BumdesInfo;
}

export function toPublishedPerangkatDesaArray(
  input: unknown,
  kepalaDesa: string | null,
): PerangkatDesa[] {
  const perangkat = Array.isArray(input)
    ? input
        .filter(isRecord)
        .map((item) => {
          const jabatan = typeof item.jabatan === "string" ? item.jabatan.trim() : "";
          const nama = typeof item.nama === "string" ? item.nama.trim() : "";
          const periode =
            typeof item.periode === "string" && item.periode.trim()
              ? item.periode.trim()
              : undefined;
          const kontak =
            typeof item.kontak === "string" && item.kontak.trim()
              ? item.kontak.trim()
              : undefined;

          if (!jabatan || !nama) return null;
          return {
            jabatan,
            nama,
            ...(periode ? { periode } : {}),
            ...(kontak ? { kontak } : {}),
          } satisfies PerangkatDesa;
        })
        .filter((item): item is PerangkatDesa => Boolean(item))
    : [];

  if (!kepalaDesa) return perangkat;

  const kepalaDesaIndex = perangkat.findIndex((item) =>
    /kepala desa/i.test(item.jabatan),
  );

  if (kepalaDesaIndex >= 0) {
    const next = [...perangkat];
    next[kepalaDesaIndex] = {
      ...next[kepalaDesaIndex],
      nama: kepalaDesa,
    };
    return next;
  }

  return [{ jabatan: "Kepala Desa", nama: kepalaDesa }, ...perangkat];
}

export function toPublishedOutputFisikArray(
  input: unknown,
): OutputFisik[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(isRecord)
    .map((item) => {
      const label = typeof item.label === "string" ? item.label.trim() : "";
      const satuan = typeof item.satuan === "string" ? item.satuan.trim() : "";
      const target = typeof item.target === "number" ? item.target : Number(item.target);
      const realisasi =
        typeof item.realisasi === "number" ? item.realisasi : Number(item.realisasi);
      const persentase =
        typeof item.persentase === "number" ? item.persentase : Number(item.persentase);
      if (
        !label ||
        !satuan ||
        !Number.isFinite(target) ||
        !Number.isFinite(realisasi) ||
        !Number.isFinite(persentase)
      ) {
        return null;
      }
      return {
        label,
        satuan,
        target,
        realisasi,
        persentase,
      } satisfies OutputFisik;
    })
    .filter((item): item is OutputFisik => Boolean(item));
}

export function toPublishedRiwayatArray(
  input: unknown,
): RiwayatTahunan[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(isRecord)
    .map((item) => {
      const tahun = typeof item.tahun === "number" ? item.tahun : Number(item.tahun);
      const totalAnggaran =
        typeof item.totalAnggaran === "number"
          ? item.totalAnggaran
          : Number(item.totalAnggaran);
      const terealisasi =
        typeof item.terealisasi === "number" ? item.terealisasi : Number(item.terealisasi);
      const persentaseSerapan =
        typeof item.persentaseSerapan === "number"
          ? item.persentaseSerapan
          : Number(item.persentaseSerapan);
      if (
        !Number.isFinite(tahun) ||
        !Number.isFinite(totalAnggaran) ||
        !Number.isFinite(terealisasi) ||
        !Number.isFinite(persentaseSerapan)
      ) {
        return null;
      }
      return {
        tahun,
        totalAnggaran,
        terealisasi,
        persentaseSerapan,
      } satisfies RiwayatTahunan;
    })
    .filter((item): item is RiwayatTahunan => Boolean(item));
}

export function toPublishedApbdesItems(
  input: unknown,
): APBDesItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .filter(isRecord)
    .map((item) => {
      const kode = typeof item.kode === "string" ? item.kode.trim() : "";
      const bidang = typeof item.bidang === "string" ? item.bidang.trim() : "";
      const anggaran =
        typeof item.anggaran === "number" ? item.anggaran : Number(item.anggaran);
      const realisasi =
        typeof item.realisasi === "number" ? item.realisasi : Number(item.realisasi);
      const persentase =
        typeof item.persentase === "number" ? item.persentase : Number(item.persentase);
      if (
        !kode ||
        !bidang ||
        !Number.isFinite(anggaran) ||
        !Number.isFinite(realisasi) ||
        !Number.isFinite(persentase)
      ) {
        return null;
      }
      return {
        kode,
        bidang,
        anggaran,
        realisasi,
        persentase,
      } satisfies APBDesItem;
    })
    .filter((item): item is APBDesItem => Boolean(item));
}

export function buildPublishedProfilSection(
  publishedValues: Record<string, unknown>,
): ProfilDesa | null {
  const hasProfileData = hasAnyPublishedValue(publishedValues, [
    "teleponDesa",
    "emailDesa",
    "potensiUnggulan",
    "kepalaDesa",
    "perangkatDesa",
    "luasWilayah",
    "mataPencaharian",
    "luasSawah",
    "luasHutan",
    "fasilitasUmum",
    "asetDesa",
    "lembagaDesa",
    "bumdes",
    "jumlahDusun",
    "jumlahRt",
    "jumlahRw",
    "jumlahKK",
  ]);

  if (!hasProfileData) return null;

  return {
    website: readPublishedString(publishedValues, "websiteUrl") ?? undefined,
    email: readPublishedString(publishedValues, "emailDesa") ?? undefined,
    telepon: readPublishedString(publishedValues, "teleponDesa") ?? undefined,
    luasWilayah: readPublishedNumber(publishedValues, "luasWilayah") ?? 0,
    luasSawah: readPublishedNumber(publishedValues, "luasSawah") ?? undefined,
    luasHutan: readPublishedNumber(publishedValues, "luasHutan") ?? undefined,
    jumlahDusun: readPublishedNumber(publishedValues, "jumlahDusun") ?? 0,
    jumlahRt: readPublishedNumber(publishedValues, "jumlahRt") ?? 0,
    jumlahRw: readPublishedNumber(publishedValues, "jumlahRw") ?? 0,
    jumlahKk: readPublishedNumber(publishedValues, "jumlahKK") ?? 0,
    mataPencaharian:
      readPublishedString(publishedValues, "mataPencaharian") ?? "",
    potensiUnggulan:
      readPublishedString(publishedValues, "potensiUnggulan") ?? "",
    terakhirDiperbarui: new Date(0),
    aset: toPublishedAsetDesaArray(publishedValues.asetDesa),
    fasilitas: toPublishedFasilitasDesaArray(publishedValues.fasilitasUmum),
    lembaga: toPublishedLembagaDesaArray(publishedValues.lembagaDesa),
    perangkat: toPublishedPerangkatDesaArray(
      publishedValues.perangkatDesa,
      readPublishedString(publishedValues, "kepalaDesa"),
    ),
    bumdes: toPublishedBumdesInfo(publishedValues.bumdes) ?? undefined,
    historyBelanja: [],
    badge: {
      level: 3,
      label: "Data publik",
      deskripsi: "Section ini membaca field template aktif yang sudah terbit.",
      warna: "indigo",
      icon: "info",
    },
  };
}
