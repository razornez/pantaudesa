import DesaListClient from "@/components/desa/DesaListClient";
import { getDesaListResult } from "@/lib/data/desa-read";

export const dynamic = "force-dynamic";

interface Props {
  searchParams?: Promise<{ cari?: string }>;
}

export default async function DesaListPage({ searchParams }: Props) {
  const params = await searchParams;
  const result = await getDesaListResult();

  return (
    <DesaListClient
      desa={result.items}
      initialSearch={params?.cari ?? ""}
      readState={result.state}
      readMessage={result.message}
      dbHostAlias={result.dbHostAlias}
    />
  );
}
