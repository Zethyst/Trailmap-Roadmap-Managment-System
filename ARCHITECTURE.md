# Trailmap — Architecture

Two-repo monorepo: `frontend/` (Next.js 16, Vercel) and `backend/` (Node.js + Express, Railway).
No Redis. No AWS. Full stack is Neon + Cloudinary + OpenAI via LangChain.

---

## Constraints & Replacements

| Dropped | Replaced by |
|---|---|
| Redis sessions | NextAuth JWT mode (stateless, httpOnly cookie) |
| Redis rate limiting | `SELECT COUNT(*) FROM ai_generations WHERE user_id = $1 AND created_at > NOW() - INTERVAL '1 day'` |
| Redis HTTP cache | Next.js `next/cache` (frontend) + ETag headers (backend) |
| AWS S3 | Cloudinary (image upload + transformation, generous free tier) |
| AWS RDS | Neon serverless Postgres |
| AWS compute | Vercel (frontend) + Railway (backend) |
| Drizzle ORM | Prisma ORM (type-safe client, schema-first, migrations via `prisma migrate`) |
| Resend (email) | Brevo (transactional email + magic links) |
| OpenRouter AI | OpenAI API via LangChain (swappable models, structured output) |

---

## Deployment Targets

| Layer | Service | Notes |
|---|---|---|
| Frontend | Vercel | Native Next.js, auto-deploy on push |
| Backend | Railway | Node.js, env vars via Railway dashboard |
| Database | Neon | Serverless Postgres, connection pooling built-in |
| Storage | Cloudinary | Image upload + CDN, free tier 25GB |
| AI | OpenAI via LangChain | GPT-4o-mini default, LangChain for chains + structured output |
| Email | Brevo | Transactional email + magic links |
| Auth | NextAuth v5 (in frontend) | JWT mode, Google + Brevo magic links |

---

## Folder Structure

```
trailmap/
├── frontend/               # Next.js 16 App Router
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                        # Landing + anonymous canvas
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── verify/page.tsx             # Magic link landing
│   │   ├── dashboard/
│   │   │   └── page.tsx                    # Roadmap list (auth required)
│   │   ├── roadmap/
│   │   │   └── [id]/
│   │   │       └── page.tsx                # Canvas editor
│   │   ├── r/
│   │   │   └── [slug]/
│   │   │       └── page.tsx                # Public read-only view
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/route.ts  # Auth.js handler
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── Canvas.tsx                  # React Flow root
│   │   │   ├── CanvasToolbar.tsx
│   │   │   └── MigrationBanner.tsx         # "Sign in to sync" nudge
│   │   ├── nodes/
│   │   │   ├── StepNode.tsx
│   │   │   ├── MilestoneNode.tsx
│   │   │   ├── NoteNode.tsx
│   │   │   └── GroupNode.tsx
│   │   ├── blocks/
│   │   │   ├── VideoBlock.tsx
│   │   │   ├── LinkBlock.tsx
│   │   │   ├── TextBlock.tsx               # Tiptap
│   │   │   ├── ImageBlock.tsx
│   │   │   └── ChecklistBlock.tsx
│   │   ├── ai/
│   │   │   ├── GenerateModal.tsx
│   │   │   └── SuggestPanel.tsx
│   │   └── ui/                             # shadcn/ui primitives
│   ├── lib/
│   │   ├── auth.ts                         # NextAuth config (Google + Brevo magic links)
│   │   ├── local-db.ts                     # Dexie schema + helpers (IndexedDB)
│   │   ├── api-client.ts                   # Typed fetch wrapper → backend
│   │   └── dag.ts                          # DAG cycle detection (DFS)
│   ├── store/
│   │   ├── canvas-store.ts                 # Zustand: nodes/edges/selection/history
│   │   └── ui-store.ts                     # Zustand: sidebar/modal state
│   ├── hooks/
│   │   ├── use-roadmap.ts                  # TanStack Query: fetch/mutate roadmap
│   │   ├── use-autosave.ts                 # Debounced 800ms → local or cloud
│   │   └── use-local-roadmaps.ts           # Read from Dexie
│   └── types/
│       └── index.ts                        # Shared domain types (mirrored in backend)
│
└── backend/                # Node.js + Express + TypeScript
    ├── src/
    │   ├── index.ts                        # Express app setup + listen
    │   ├── routes/
    │   │   ├── roadmaps.ts                 # CRUD + graph upsert + publish
    │   │   ├── progress.ts                 # Node completion per user
    │   │   ├── uploads.ts                  # Cloudinary signed upload + URL return
    │   │   ├── ai.ts                       # Generate / suggest / find-resources
    │   │   ├── youtube.ts                  # Metadata proxy (title/thumbnail)
    │   │   └── migrate.ts                  # Local→cloud import
    │   ├── db/
    │   │   └── migrations/                 # Prisma migrate output
    │   ├── middleware/
    │   │   ├── auth.ts                     # Verify NextAuth JWT (shared AUTH_SECRET)
    │   │   └── rate-limit.ts               # Postgres COUNT-based limiter
    │   └── services/
    │       ├── ai.ts                       # LangChain + OpenAI client + Zod output validation
    │       ├── cloudinary.ts               # Cloudinary SDK upload helpers
    │       └── youtube.ts                  # YouTube Data API v3
    ├── prisma/
    │   └── schema.prisma                   # Prisma schema (single source of truth)
    └── package.json
```

---

## Frontend Tech Stack

| Concern | Library | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Canvas | @xyflow/react (React Flow) | latest |
| Rich text | Tiptap | 2.x |
| Canvas state | Zustand | 5.x |
| Server state | TanStack Query | 5.x |
| Local persistence | Dexie.js (IndexedDB) | 4.x |
| Auth | NextAuth | 5.x |
| UI | shadcn/ui + Tailwind CSS v4 | — |
| HTTP client | native fetch (typed via api-client.ts) | — |

---

## Backend Tech Stack

| Concern | Library | Version |
|---|---|---|
| Runtime | Node.js | 20 LTS |
| Language | TypeScript | 5.x |
| HTTP | Express | 4.x |
| ORM | Prisma ORM | 5.x |
| DB driver | @prisma/adapter-neon + @neondatabase/serverless | — |
| Storage SDK | cloudinary | 2.x |
| Validation | Zod | 3.x |
| AI | LangChain + openai (OpenAI API) | latest |
| Env | dotenv | — |

---

## Auth Flow (no Redis, no sessions table)

```
Browser                      Frontend (Next.js)             Backend (Express)
  |                               |                               |
  |-- GET /api/auth/signin ------>|                               |
  |<-- Google OAuth redirect -----|                               |
  |-- Google callback ----------->|                               |
  |                       NextAuth signs JWT                      |
  |                       (AUTH_SECRET, 30d expiry)               |
  |<-- Set-Cookie: session-token (httpOnly, Secure) --------------|
  |                               |                               |
  |-- POST /api/ai/generate ------|-- Authorization: Bearer JWT ->|
  |                               |              auth.ts middleware|
  |                               |         verifyJwt(AUTH_SECRET)|
  |                               |                  ↓ req.user   |
  |                               |              route handler     |
```

- NextAuth configured in JWT mode (`session: { strategy: "jwt" }`)
- No `adapter` → no sessions table, no Redis
- Backend shares the same `AUTH_SECRET` env var to verify tokens
- Token contains `{ sub: userId, email, plan }` — enough for all backend decisions
- Google OAuth + Brevo magic links (email OTP) as providers

---

## API Contract (Backend REST)

### Roadmaps
```
GET    /api/roadmaps                 # List authenticated user's roadmaps
POST   /api/roadmaps                 # Create empty roadmap
GET    /api/roadmaps/:id             # Get full roadmap (auth check for private)
PATCH  /api/roadmaps/:id             # Update title/description/tags/visibility
DELETE /api/roadmaps/:id             # Delete
PATCH  /api/roadmaps/:id/graph       # Full graph upsert: { nodes[], edges[] }
```

### Public
```
GET    /api/r/:slug                  # Read-only roadmap by share slug (no auth)
```

### Progress
```
GET    /api/progress/:roadmapId      # Get all node statuses for authed user
POST   /api/progress                 # { nodeId, roadmapId, status: todo|in_progress|done }
```

### Migration (local → cloud)
```
POST   /api/roadmaps/import          # Bulk: { roadmaps: [...] } → returns { idMap }
```

### Uploads
```
POST   /api/uploads/presign          # { filename, contentType } → { presignedUrl, publicUrl }
```

### AI
```
POST   /api/ai/generate              # { goal, level, timeBudget?, formatPref? }
POST   /api/ai/suggest-next          # { nodeId, roadmapId }
POST   /api/ai/find-resources        # { nodeTitle, nodeDescription }
```

### YouTube
```
GET    /api/youtube/metadata?url=    # Proxies YouTube Data API, returns { title, thumbnail, duration }
```

---

## Data Model (Prisma schema — `backend/prisma/schema.prisma`)

```prisma
// prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String   @id @default(uuid())
  email       String   @unique
  name        String?
  avatarUrl   String?  @map("avatar_url")
  plan        Plan     @default(free)
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  roadmaps    Roadmap[]
  progress    NodeProgress[]
  follows     RoadmapFollow[]
  aiGenerations AiGeneration[]

  @@map("users")
}

enum Plan { free pro }

model Roadmap {
  id          String     @id @default(uuid())
  ownerId     String     @map("owner_id")
  title       String
  description String?
  visibility  Visibility @default(private)
  shareSlug   String?    @unique @map("share_slug")
  isTemplate  Boolean    @default(false) @map("is_template")
  forkedFrom  String?    @map("forked_from")
  tags        String[]
  coverUrl    String?    @map("cover_url")
  viewCount   Int        @default(0) @map("view_count")
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  owner       User       @relation(fields: [ownerId], references: [id])
  nodes       Node[]
  edges       Edge[]
  progress    NodeProgress[]
  follows     RoadmapFollow[]
  aiGenerations AiGeneration[]

  @@map("roadmaps")
}

enum Visibility { private unlisted public }

model Node {
  id         String   @id @default(uuid())
  roadmapId  String   @map("roadmap_id")
  type       NodeType
  positionX  Float    @map("position_x")
  positionY  Float    @map("position_y")
  width      Float?
  height     Float?
  parentId   String?  @map("parent_id")
  data       Json     // { title, blocks[], est_minutes, color }
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  roadmap    Roadmap  @relation(fields: [roadmapId], references: [id], onDelete: Cascade)
  parent     Node?    @relation("NodeChildren", fields: [parentId], references: [id])
  children   Node[]   @relation("NodeChildren")
  progress   NodeProgress[]

  @@map("nodes")
}

enum NodeType { step milestone group note }

model Edge {
  id           String  @id @default(uuid())
  roadmapId    String  @map("roadmap_id")
  sourceNodeId String  @map("source_node_id")
  targetNodeId String  @map("target_node_id")
  label        String?
  style        Json?

  roadmap      Roadmap @relation(fields: [roadmapId], references: [id], onDelete: Cascade)

  @@map("edges")
}

model NodeProgress {
  id          String          @id @default(uuid())
  userId      String          @map("user_id")
  nodeId      String          @map("node_id")
  roadmapId   String          @map("roadmap_id")
  status      ProgressStatus
  completedAt DateTime?       @map("completed_at")

  user    User    @relation(fields: [userId], references: [id])
  node    Node    @relation(fields: [nodeId], references: [id])
  roadmap Roadmap @relation(fields: [roadmapId], references: [id])

  @@unique([userId, nodeId])
  @@map("node_progress")
}

enum ProgressStatus { todo in_progress done }

model RoadmapFollow {
  userId    String   @map("user_id")
  roadmapId String   @map("roadmap_id")
  createdAt DateTime @default(now()) @map("created_at")

  user    User    @relation(fields: [userId], references: [id])
  roadmap Roadmap @relation(fields: [roadmapId], references: [id])

  @@id([userId, roadmapId])
  @@map("roadmap_follows")
}

// Rate limiting + caching + cost tracking
model AiGeneration {
  id         String   @id @default(uuid())
  userId     String?  @map("user_id")  // null = anonymous
  roadmapId  String?  @map("roadmap_id")
  kind       AiKind
  promptHash String   @map("prompt_hash")  // sha256 for cache lookup
  prompt     String
  response   Json     // cached output
  tokenIn    Int?     @map("token_in")
  tokenOut   Int?     @map("token_out")
  costUsd    Decimal? @map("cost_usd") @db.Decimal(10, 6)
  createdAt  DateTime @default(now()) @map("created_at")

  user    User?    @relation(fields: [userId], references: [id])
  roadmap Roadmap? @relation(fields: [roadmapId], references: [id])

  @@index([userId, createdAt])  // rate limit queries
  @@index([promptHash])         // cache lookup
  @@map("ai_generations")
}

enum AiKind { generate suggest_next find_resource summarize }
```

### Content Block Shape (inside `nodes.data.blocks[]`)

```json
{ "id": "blk_1", "type": "video",     "url": "...", "title": "...", "thumbnail": "...", "duration": "..." }
{ "id": "blk_2", "type": "text",      "html": "<p>...</p>" }
{ "id": "blk_3", "type": "link",      "url": "...", "title": "...", "favicon": "..." }
{ "id": "blk_4", "type": "image",     "url": "...", "alt": "..." }
{ "id": "blk_5", "type": "checklist", "items": [{ "id": "...", "text": "...", "done": false }] }
```

---

## Rate Limiting (no Redis)

All rate limits are enforced in `backend/src/middleware/rate-limit.ts` via a Postgres COUNT:

```sql
-- AI generation: 10/day free, 100/day pro
SELECT COUNT(*) FROM ai_generations
WHERE user_id = $1
  AND kind = $2
  AND created_at > NOW() - INTERVAL '1 day';
```

Index on `(user_id, created_at)` makes this a fast index-only scan even at scale.
For general API abuse, use Express `express-rate-limit` with an in-memory store (fine for single-instance v1).

---

## Local-first / Sync Strategy

### Anonymous (pre-login) — Dexie (IndexedDB)

```typescript
// lib/local-db.ts
const db = new Dexie("trailmap");
db.version(1).stores({
  roadmaps: "id, updatedAt",
  nodes:    "id, roadmapId",
  edges:    "id, roadmapId",
  blobs:    "id, roadmapId",   // image blobs before upload
});
```

- Autosave debounced 800ms after last canvas change (Zustand `subscribe`)
- Each local roadmap has a `localRoadmapId` (uuid) for stable identity
- Images stored as `Blob` in the `blobs` table (not base64 in nodes.data)

### Login Migration

1. Detect local roadmaps in Dexie
2. Show modal: "Save 2 local roadmap(s) to your account?"
3. Upload image blobs → R2 presigned URL, rewrite block `url` fields
4. `POST /api/roadmaps/import` with full graph JSON → server returns `{ idMap }`
5. Client replaces local IDs with canonical IDs, switches to cloud mode
6. Clear migrated Dexie entries; keep a `migrated: true` flag as safety net
7. If account already has roadmaps: import adds new ones, never overwrites

### Authenticated (post-login) — Postgres via backend

- Zustand store holds the live canvas state
- `use-autosave.ts`: debounced 800ms → `PATCH /api/roadmaps/:id/graph`
- v1: full-graph upsert (send all nodes + edges each save)
- TanStack Query caches the loaded roadmap; `refetchOnWindowFocus: true` for cross-tab/device sync
- Optimistic updates on the canvas; rollback on error

---

## AI Pipeline

```
Client → POST /api/ai/generate
             ↓
     rate-limit.ts (Postgres COUNT)
             ↓
     Check ai_generations for prompt_hash cache hit
             ↓ cache miss
     services/ai.ts → LangChain + OpenAI API
       - model: "gpt-4o-mini" (default)
       - LangChain ChatOpenAI + withStructuredOutput (Zod schema)
       - system prompt: strict JSON schema + no-URL guardrail
             ↓
     Zod validate response shape: { nodes[], edges[] }
             ↓
     Insert row into ai_generations (log + cache response)
             ↓
     Return nodes + edges to client
             ↓
Client materialises nodes on canvas (editable immediately)
```

**Guardrails**:
- AI never produces final URLs — only search query strings in blocks
- `POST /api/youtube/metadata?url=` fetches real metadata after user pastes a URL
- Any model-produced URL goes through a HEAD validation before render
- Output token cap: 2000 for generation, 500 for suggest-next

---

## Image Upload Flow

```
Client selects image
       ↓
POST /api/uploads/sign  { filename, contentType }
       ↓ backend generates Cloudinary signed upload params (expires 1hr)
       ↓ returns { signature, timestamp, cloudName, apiKey, folder }
Client POST → https://api.cloudinary.com/v1_1/<cloud>/image/upload (direct browser → Cloudinary)
       ↓
Client stores secure_url in node block: { type: "image", url: secure_url }
       ↓ autosave persists the URL to Postgres
```

Pre-login: image stored as Blob in Dexie. On migration, backend re-runs the Cloudinary sign + upload steps.

---

## Build Phases

### Phase 0 — Canvas MVP (local only)
- React Flow canvas: Step / Milestone / Note nodes, directional edges
- Content blocks: text (Tiptap), link, video (YouTube embed), image
- IndexedDB autosave via Dexie
- Undo/redo (Zustand history middleware)
- No backend, no auth, no AI
- Goal: validate the core creation feel

### Phase 1 — Accounts + AI + Cloud Sync
- Backend (Express + Neon + Drizzle) stood up
- Auth.js v5: Google + Resend magic links, JWT mode
- Local → cloud migration flow
- Cloud autosave (full-graph upsert)
- Dashboard: list / rename / delete / duplicate
- AI generate from goal (OpenRouter)
- Public share links (read-only `/r/:slug` page)
- Improve Note so that the resources are visible think of a good ui.(*)

### Phase 2 — Follow & Fork
- Progress tracking (mark step done, % complete)
- Fork a public roadmap
- Group/Section container nodes
- AI suggest-next and find-resources
- Export: PNG / PDF / JSON
- Checklist blocks, estimated time per step

### Phase 3 — Growth & Depth
- Template gallery / discovery
- YouTube playlist embeds
- Pro tier (Stripe)
- Auto-layout ("tidy up" graph)
- Yjs real-time collaboration (if demand warrants)

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=<random 32-byte hex>
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_API_URL=http://localhost:4000
DATABASE_URL=<neon connection string>
```

### Backend (`backend/.env`)
```
PORT=4000
AUTH_SECRET=<same value as frontend>
DATABASE_URL=<neon connection string>
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
OPENAI_API_KEY=
BREVO_API_KEY=
BREVO_FROM_EMAIL=noreply@trailmap.app
YOUTUBE_API_KEY=
```

---

## Cross-Cutting Decisions

**DAG validation** — run on every `PATCH /graph` save server-side (DFS cycle check). Also run client-side before allowing edge creation so the UI gives instant feedback.

**JSONB vs relational for node content** — `nodes.data` is JSONB. The parts we query/filter (owner, type, position, roadmap_id) are relational columns. Content blocks stay in JSONB for schema flexibility across block types.

**No sequence numbers on nodes/edges** — positions stored as floats (position_x, position_y). This keeps the model CRDT-friendly if Yjs is added in Phase 3.

**Mobile** — read-only viewer (`/r/:slug`) is responsive. Canvas editor is desktop-only in v1.

**Error boundary** — canvas wrapped in React error boundary; save failures surface as a toast, never silently drop data. Always keep the last known good local state in Dexie as a fallback.
