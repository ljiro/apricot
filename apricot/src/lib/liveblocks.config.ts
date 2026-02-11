import { createClient, LiveList, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

export type SuggestionItem = {
  id: string;
  from: number;
  to: number;
  originalText: string;
  suggestedContent: string;
};

export type HighlightRange = { from: number; to: number };

/** Root storage shape for document room (suggestions + highlight visible to all users) */
export type DocumentRoomStorage = {
  suggestions: LiveList<LiveObject<SuggestionItem>>;
  highlightRange: LiveObject<HighlightRange>;
};

declare global {
  interface Liveblocks {
    UserMeta: {
      id: string;
      info: {
        name: string;
        color: string;
        avatar?: string;
      };
    };
    Storage: DocumentRoomStorage;
  }
}

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

export const {
  RoomProvider,
  useRoom,
  useSelf,
  useOthers,
  useStatus,
  useMutation,
  useStorage,
} = createRoomContext<never, DocumentRoomStorage, Liveblocks["UserMeta"]>(client);

export function getInitialDocumentStorage(_roomId?: string): DocumentRoomStorage {
  return {
    suggestions: new LiveList([]),
    highlightRange: new LiveObject({ from: -1, to: -1 }),
  };
}
