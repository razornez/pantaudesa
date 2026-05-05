import SuaraWargaPageClient from "@/components/suara/SuaraWargaPageClient";
import { getAllVoicesFromDb } from "@/lib/data/voice-read";
import { perfLog, perfStart } from "@/lib/perf";

export default async function SuaraWargaPage() {
  const voicesTimer = perfStart();
  const voices = await getAllVoicesFromDb();
  perfLog("public.suara-warga", "getAllVoicesFromDb()", voicesTimer);

  return <SuaraWargaPageClient initialVoices={voices} />;
}
