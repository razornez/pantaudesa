import { describe, expect, it } from "vitest";
import {
  buildPublishedProfilSection,
  toPublishedPerangkatDesaArray,
} from "@/lib/data/desa-template-public-view";

describe("desa template public view", () => {
  it("does not invent profile values when no published profile field exists", () => {
    expect(buildPublishedProfilSection({})).toBeNull();
  });

  it("uses published profile values exactly as provided by template data", () => {
    const profil = buildPublishedProfilSection({
      jumlahDusun: 4,
      jumlahRt: 11,
      jumlahRw: 5,
      jumlahKK: 987,
      teleponDesa: "022-87991234",
      emailDesa: "halo@batukarut.desa.id",
      potensiUnggulan: "Kopi rakyat dan wisata sungai.",
      luasWilayah: 12.4,
      mataPencaharian: "Pertanian dan jasa lokal",
      luasSawah: 186,
      luasHutan: 94,
    });

    expect(profil).not.toBeNull();
    expect(profil?.luasWilayah).toBe(12.4);
    expect(profil?.mataPencaharian).toBe("Pertanian dan jasa lokal");
    expect(profil?.luasSawah).toBe(186);
    expect(profil?.luasHutan).toBe(94);
    expect(profil?.potensiUnggulan).toBe("Kopi rakyat dan wisata sungai.");
  });

  it("treats perangkat desa as part of the published profile component", () => {
    const profil = buildPublishedProfilSection({
      kepalaDesa: "Bapak Asep",
      perangkatDesa: [
        { jabatan: "Sekretaris Desa", nama: "Ibu Sari" },
        { jabatan: "Kaur Keuangan", nama: "Pak Rudi" },
      ],
    });

    expect(profil).not.toBeNull();
    expect(profil?.perangkat).toEqual([
      { jabatan: "Kepala Desa", nama: "Bapak Asep" },
      { jabatan: "Sekretaris Desa", nama: "Ibu Sari" },
      { jabatan: "Kaur Keuangan", nama: "Pak Rudi" },
    ]);
  });

  it("merges kepala desa into published perangkat array without creating static filler", () => {
    const perangkat = toPublishedPerangkatDesaArray(
      [
        { jabatan: "Sekretaris Desa", nama: "Nana" },
        { jabatan: "Kaur Keuangan", nama: "Yudi" },
      ],
      "Bapak Asep",
    );

    expect(perangkat[0]).toMatchObject({
      jabatan: "Kepala Desa",
      nama: "Bapak Asep",
    });
    expect(perangkat).toHaveLength(3);
  });
});
