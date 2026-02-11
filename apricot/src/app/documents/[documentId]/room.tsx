"use client";

import {
  RoomProvider as LiveblocksRoomProvider,
  getInitialDocumentStorage,
} from "@/lib/liveblocks.config";
import { ReactNode } from "react";

export function Room({
  documentId,
  children,
}: {
  documentId: string;
  children: ReactNode;
}) {
  return (
    <LiveblocksRoomProvider
      id={`document-${documentId}`}
      initialStorage={getInitialDocumentStorage}
    >
      {children}
    </LiveblocksRoomProvider>
  );
}
