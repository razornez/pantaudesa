import { Zap } from "lucide-react";

type Fact = {
  angka: string;
  judul: string;
  body: string;
  provinsi: string;
  warna: "indigo" | "emerald" | "amber" | "rose" | "sky";
};

const FACTS: Fact[] = [
  {
    angka: "100%",
    judul: "Jawa Barat punya kelengkapan data yang nyaris sempurna",
    body: "Dari 3.581 desa di Jabar, hampir semua field penting sudah terisi di atas 99%: data penduduk, luas wilayah, dana desa, koordinat, topografi, sampai kategori IDM. Datanya ada di sumber resmi, tinggal dikumpulkan.",
    provinsi: "Jawa Barat",
    warna: "emerald",
  },
  {
    angka: "7.810",
    judul: "Jawa Tengah punya lebih banyak desa dari Papua dan Jabar digabung",
    body: "Jateng punya 7.810 desa, lebih banyak dari Papua (7.181) dan Jabar (3.581) dijumlah sekalipun. Dana desanya 100% tercatat dan data penduduk sudah lengkap, tapi koordinat peta baru tersedia untuk 42% desa.",
    provinsi: "Jawa Tengah",
    warna: "indigo",
  },
  {
    angka: "226",
    judul: "Yahukimo punya 226 titik peta meski hanya bisa dicapai lewat udara",
    body: "Yahukimo tidak punya jalan raya. Satu-satunya akses ke sana adalah pesawat. Tapi sukarelawan OpenStreetMap tetap memetakan 226 desa di sana, lebih banyak dari banyak kabupaten di Jawa.",
    provinsi: "Papua Pegunungan",
    warna: "sky",
  },
  {
    angka: "5.000+",
    judul: "Empat provinsi Papua yang lahir 2022 masih tidak terdeteksi DJPK",
    body: "Papua Selatan, Papua Tengah, Papua Pegunungan, dan Papua Barat Daya sudah berdiri 3 tahun. Tapi sistem dana desa nasional (DJPK) belum pernah diperbarui untuk mereka. Dananya sudah mengalir, tapi pencatatannya belum mengikuti.",
    provinsi: "Papua",
    warna: "amber",
  },
  {
    angka: "40",
    judul: "Nduga, kawasan konflik aktif, sudah ada 40 desa di OpenStreetMap",
    body: "Nduga adalah kabupaten paling sulit dijangkau di Indonesia. Tapi 40 desanya sudah ada di OpenStreetMap, kemungkinan dari pemetaan kemanusiaan untuk keperluan bantuan darurat.",
    provinsi: "Papua Pegunungan",
    warna: "rose",
  },
  {
    angka: "8%",
    judul: "Hanya 8% desa Jabar yang punya portal desa digital",
    body: "Meski Jabar adalah provinsi dengan data paling lengkap di PantauDesa, hanya sekitar 300 dari 3.581 desa yang mempublikasikan data lewat portal desa digital (OpenSID). Transparansi online masih sangat terbatas.",
    provinsi: "Jawa Barat",
    warna: "indigo",
  },
  {
    angka: "0",
    judul: "Jakarta tidak punya satu pun desa dan tidak masuk sistem dana desa",
    body: "DKI Jakarta tidak punya desa. Semua wilayahnya adalah kelurahan, bukan desa. Itu artinya Jakarta tidak pernah dapat dana desa, tidak masuk penilaian IDM, dan sampai hari ini tidak terdeteksi oleh PantauDesa.",
    provinsi: "DKI Jakarta",
    warna: "rose",
  },
  {
    angka: "2%",
    judul: "Yogyakarta, kota pelajar, hampir tidak punya portal desa digital sama sekali",
    body: "Dari 392 desa di DI Yogyakarta, hanya 6 yang punya portal desa digital (OpenSID). Kota Yogyakarta sendiri tidak punya desa — semua wilayahnya adalah kelurahan, persis seperti Jakarta. Kota pendidikan ternama Indonesia ternyata tidak lebih terhubung secara digital daripada desa-desa di pedalaman.",
    provinsi: "DI Yogyakarta",
    warna: "indigo",
  },
  {
    angka: "636",
    judul: "Bali yang terkenal sedunia hanya punya 636 desa, lebih sedikit dari satu kabupaten Jawa",
    body: "Buleleng saja punya 129 desa. Satu kabupaten di Jawa Tengah bisa menandingi seluruh Bali. Bali kecil, banyak wilayahnya kelurahan bukan desa, dan program dana desa tidak menjangkau kawasan urban. Popularitas global tidak berarti banyak desa.",
    provinsi: "Bali",
    warna: "amber",
  },
  {
    angka: "73%",
    judul: "Bali punya coverage peta tertinggi setelah Jawa Barat karena pariwisata",
    body: "Dari 636 desa di Bali, 73% sudah punya koordinat di OpenStreetMap. Ini jauh di atas rata-rata nasional. Efeknya nyata: wisatawan dan relawan internasional yang mapping destinasi wisata secara tidak langsung membantu transparansi data desa.",
    provinsi: "Bali",
    warna: "emerald",
  },
  {
    angka: "96",
    judul: "Bangli, kabupaten tanpa pantai, punya portal desa digital terbanyak di Bali",
    body: "Badung punya Kuta dan Seminyak. Gianyar punya Ubud. Tapi Bangli, kabupaten pegunungan yang paling sedikit dikunjungi turis, justru punya 96 desa yang aktif di OpenSID. Lebih banyak dari semua kabupaten lain di Bali digabung.",
    provinsi: "Bali",
    warna: "sky",
  },
  {
    angka: "7.725",
    judul: "Jawa Timur punya lebih banyak desa dari seluruh pulau Sumatera",
    body: "7.725 desa tersebar di 29 kabupaten dan 9 kota di Jawa Timur. Ini menjadikannya provinsi dengan desa terbanyak di seluruh Jawa. Dana desanya sudah hampir 100% tercatat, tapi 42% desa masih belum punya koordinat GPS yang akurat.",
    provinsi: "Jawa Timur",
    warna: "indigo",
  },
  {
    angka: "462",
    judul: "Lamongan punya lebih banyak desa dari seluruh Provinsi DI Yogyakarta",
    body: "Kabupaten Lamongan di Jawa Timur punya 462 desa. Seluruh Provinsi DI Yogyakarta dengan 5 kabupaten/kota hanya punya 392 desa. Satu kabupaten menandingi satu provinsi penuh.",
    provinsi: "Jawa Timur",
    warna: "amber",
  },
  {
    angka: "67 pulau",
    judul: "Sumenep punya desa di 67 pulau berbeda, sebagian hanya bisa dicapai perahu",
    body: "Kabupaten Sumenep mencakup daratan Madura dan 67 pulau yang tersebar di Laut Jawa dan Flores. Ada desa yang kepala desanya harus naik perahu berhari-hari untuk melapor ke kabupaten. Data mereka hampir tidak pernah muncul di sistem nasional.",
    provinsi: "Jawa Timur",
    warna: "sky",
  },
  {
    angka: "223",
    judul: "Dua kabupaten Toraja punya 223 desa yang hidup di luar logika birokrasi biasa",
    body: "Tana Toraja dan Toraja Utara punya 223 desa dengan sistem adat yang kuat. Dana desanya 100% tercatat di sistem nasional. Tapi ritual pemakaman Rambu Solo mereka bisa menghabiskan ratusan juta rupiah, jauh melampaui anggaran resmi desa. Uang itu mengalir di luar sistem mana pun.",
    provinsi: "Sulawesi Selatan",
    warna: "amber",
  },
  {
    angka: "207",
    judul: "Luwu punya 207 desa, dari pesisir teluk sampai kaki Gunung Latimojong",
    body: "Kabupaten Luwu adalah salah satu kabupaten terluas di Sulawesi Selatan, membentang dari pantai Teluk Bone sampai lereng pegunungan Latimojong. Dengan 207 desa, variasi geografisnya ekstrem. Desa di pesisir dan desa di pegunungan berada dalam satu kabupaten tapi dengan akses dan kondisi yang sama sekali berbeda.",
    provinsi: "Sulawesi Selatan",
    warna: "emerald",
  },
  {
    angka: "69%",
    judul: "Hampir 70% desa NTT tidak terdeteksi di sistem dana desa nasional",
    body: "Dari 3.185 desa di Nusa Tenggara Timur, hanya 31% yang masuk catatan DJPK Kemenkeu. Sisanya tidak terlacak — bukan karena tidak ada, tapi karena sistem pencatatan pusat belum menjangkau pulau-pulau kecil yang tersebar dari Timor sampai Sumba dan Flores.",
    provinsi: "Nusa Tenggara Timur",
    warna: "rose",
  },
  {
    angka: "112",
    judul: "Rote Ndao, pulau paling selatan Indonesia, punya 112 desa yang nyaris tak terlihat di data nasional",
    body: "Rote Ndao adalah pulau berpenghuni paling selatan di Indonesia. Dari 112 desanya, hampir tidak ada yang muncul di OpenStreetMap — OSM coverage NTT hanya 20%, terendah dari semua provinsi yang sudah kami data. Desa-desa ini ada, hidup, dan punya warga — tapi secara digital hampir tidak eksis.",
    provinsi: "Nusa Tenggara Timur",
    warna: "amber",
  },
];

const colorMap = {
  indigo: {
    card: "border-indigo-100 bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-700",
    angka: "text-indigo-700",
    dot: "bg-indigo-400",
  },
  emerald: {
    card: "border-emerald-100 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    angka: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  amber: {
    card: "border-amber-100 bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
    angka: "text-amber-700",
    dot: "bg-amber-400",
  },
  rose: {
    card: "border-rose-100 bg-rose-50",
    badge: "bg-rose-100 text-rose-700",
    angka: "text-rose-700",
    dot: "bg-rose-400",
  },
  sky: {
    card: "border-sky-100 bg-sky-50",
    badge: "bg-sky-100 text-sky-700",
    angka: "text-sky-700",
    dot: "bg-sky-400",
  },
};

export default function SurprisingFactsSection() {
  return (
    <section>
      <div className="mb-4 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 flex items-center gap-1.5">
          <Zap size={12} />
          Fakta mengejutkan dari data
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-800">
          Yang kami temukan saat mengumpulkan data 27.000+ desa
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Dari Jawa Barat sampai Papua, data pemerintah selalu menyimpan sesuatu yang tidak terduga.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FACTS.map((fact) => {
          const c = colorMap[fact.warna];
          return (
            <div
              key={fact.judul}
              className={`rounded-2xl border p-4 flex flex-col gap-2 ${c.card}`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className={`text-2xl font-black leading-none ${c.angka}`}>{fact.angka}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${c.badge}`}>
                  {fact.provinsi}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 leading-snug">{fact.judul}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{fact.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
