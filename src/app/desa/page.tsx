import DesaListClient from "@/components/desa/DesaListClient";
import { getDesaListWithFallback } from "@/lib/data/desa-read";

interface Props {
  searchParams?: Promise<{ cari?: string }>;
}

export default async function DesaListPage({ searchParams }: Props) {
  const params = await searchParams;
  const desa = await getDesaListWithFallback();

  return <DesaListClient desa={desa} initialSearch={params?.cari ?? ""} />;
}
