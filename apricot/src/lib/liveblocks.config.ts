import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

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
} = createRoomContext<never, never, Liveblocks["UserMeta"]>(client);
