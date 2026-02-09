# Apricot

A **live document editor** that multiple users can use at the same time. Built with Next.js, TipTap, and [Liveblocks](https://liveblocks.io) for real-time collaboration.

## Features

- **Real-time collaboration** — Changes sync instantly across all users in the same document
- **Presence** — See who else is in the document (avatars in the toolbar)
- **Collaborative cursors** — Other users’ cursors and names appear in the editor
- **Rich text** — Bold, italic, underline, tables, task lists, images
- **Per-document rooms** — Each document has its own room; share the URL to collaborate

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure Liveblocks**

   - Sign up at [liveblocks.io](https://liveblocks.io) and create a project
   - Copy your **Secret Key** from [Dashboard → API Keys](https://liveblocks.io/dashboard/apikeys)
   - Create a `.env.local` file in the project root:

   ```
   LIVEBLOCKS_SECRET_KEY=sk_...
   ```

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use “New document” or go to `/documents` to create a document, then share the link so others can edit with you.

## Project structure

- `src/app/documents/` — Documents list and “new document” redirect
- `src/app/documents/[documentId]/` — Editor page: `Room` (Liveblocks), `Editor` (TipTap + Yjs), `Toolbar`, `PresenceAvatars`
- `src/app/api/liveblocks-auth/` — Liveblocks auth endpoint (issues session tokens)
- `src/lib/liveblocks.config.ts` — Liveblocks client and room context

## Tech stack

- **Next.js 15** (App Router)
- **TipTap** — Rich text editor (tables, tasks, images, etc.)
- **Yjs** + **Liveblocks Yjs** — CRDT sync and persistence
- **Liveblocks** — Real-time backend (rooms, presence, auth)
- **Zustand** — Editor instance store for the toolbar
