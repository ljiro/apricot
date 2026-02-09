import { Room } from "./room";
import { DocumentShell } from "./document-shell";

interface DocumentIdPageProps {
  params: Promise<{ documentId: string }>;
  searchParams: Promise<{ template?: string }>;
}

const DocumentIdPage = async ({ params, searchParams }: DocumentIdPageProps) => {
  const { documentId } = await params;
  const { template } = await searchParams;

  return (
    <Room documentId={documentId}>
      <DocumentShell documentId={documentId} template={template} />
    </Room>
  );
};

export default DocumentIdPage;