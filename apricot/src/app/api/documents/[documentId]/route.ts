import { Liveblocks, LiveblocksError } from "@liveblocks/node";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY ?? "",
});

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: "Liveblocks secret key is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { documentId } = await params;
  if (!documentId?.trim()) {
    return new Response(JSON.stringify({ error: "Document ID required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const roomId = `document-${documentId}`;
  try {
    await liveblocks.deleteRoom(roomId);
  } catch (err) {
    // Best-effort: room may not exist (never opened) or Liveblocks may return 500.
    // Still return success so the client can clear local data and redirect.
    const status = err instanceof LiveblocksError ? err.status : 0;
    console.warn(
      `Liveblocks deleteRoom(${roomId}) failed (status ${status}), continuing with local cleanup:`,
      err instanceof Error ? err.message : err
    );
  }
  return new Response(null, { status: 204 });
}
