import { Liveblocks } from "@liveblocks/node";
import { NextRequest } from "next/server";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY ?? "",
});

export async function POST(request: NextRequest) {
  if (!process.env.LIVEBLOCKS_SECRET_KEY) {
    return new Response(
      JSON.stringify({ error: "Liveblocks secret key is not configured." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const body = await request.json();
  const { room } = body as { room?: string };

  // For demo: create an anonymous user per session. Replace with your auth (e.g. getSession).
  const userId = `user-${Math.random().toString(36).slice(2, 10)}`;
  const colors = ["#D583F0", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"];
  const names = ["Anonymous", "Guest", "Editor", "Viewer", "Collaborator"];
  const user = {
    id: userId,
    info: {
      name: names[Math.floor(Math.random() * names.length)] + " " + userId.slice(-4),
      color: colors[Math.floor(Math.random() * colors.length)],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${userId}`,
    },
  };

  const session = liveblocks.prepareSession(user.id, {
    userInfo: user.info,
  });

  if (room) {
    session.allow(room, session.FULL_ACCESS);
  } else {
    session.allow("*", session.FULL_ACCESS);
  }

  const { body: authBody, status } = await session.authorize();
  return new Response(authBody, { status });
}
