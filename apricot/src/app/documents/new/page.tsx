import { redirect } from "next/navigation";

function generateDocumentId() {
  return Math.random().toString(36).slice(2, 12);
}

interface NewDocumentPageProps {
  searchParams: Promise<{ template?: string }>;
}

export default async function NewDocumentPage({ searchParams }: NewDocumentPageProps) {
  const id = generateDocumentId();
  const { template } = await searchParams;
  const query = template ? `?template=${encodeURIComponent(template)}` : "";
  redirect(`/documents/${id}${query}`);
}
