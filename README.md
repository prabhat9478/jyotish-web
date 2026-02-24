# JyotishAI Web Application

Next.js 15 frontend + BFF (Backend-for-Frontend) for the JyotishAI Vedic astrology platform.

## Tech Stack

- **Framework**: Next.js 15.1 (App Router)
- **Language**: TypeScript 5.7
- **UI**: Tailwind CSS 3.4 + Shadcn/UI components
- **Animations**: Framer Motion
- **3D Graphics**: React Three Fiber + Three.js
- **Charts**: D3.js
- **State**: Zustand
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL (with pgvector for RAG)
- **Queue**: BullMQ + Redis
- **LLM**: OpenRouter (Claude Sonnet 4.5, Gemini Flash)
- **Embeddings**: OpenAI text-embedding-3-small (via OpenRouter)

## Project Structure

```
web/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Auth pages (login, signup)
│   │   ├── (main)/              # Authenticated app pages
│   │   │   ├── dashboard/       # Family profiles list
│   │   │   ├── profile/[id]/    # Profile detail + chart
│   │   │   ├── transits/        # Current transits
│   │   │   └── settings/        # User preferences
│   │   └── api/v1/              # API routes
│   │       ├── profiles/        # CRUD profiles
│   │       ├── calculate/       # Birth chart calculation
│   │       ├── reports/generate # SSE streaming report generation
│   │       ├── chat/            # RAG chat SSE
│   │       ├── transits/        # Current planetary positions
│   │       └── alerts/          # Transit alerts
│   ├── components/
│   │   ├── layout/              # Sidebar, Header, ThemeProvider
│   │   ├── kundli/              # Birth chart SVG renderer
│   │   ├── dasha/               # Dasha timeline
│   │   ├── yoga/                # Yoga cards
│   │   ├── transit/             # Transit wheel
│   │   ├── solar-system/        # 3D solar system (R3F)
│   │   ├── chat/                # Chat interface
│   │   └── reports/             # Report viewer
│   └── lib/
│       ├── supabase/            # Supabase clients (SSR, browser)
│       ├── astro-client.ts      # HTTP client to astro-engine
│       ├── report-generator.ts  # OpenRouter streaming
│       ├── report-prompts/      # 9 report prompt templates
│       ├── rag/                 # RAG system (chunker, embedder, retriever, chat)
│       └── workers/             # BullMQ workers (PDF, alerts)
├── supabase/
│   └── migrations/              # 7 SQL migration files
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Environment Variables

Copy `.env.local` to `.env.local.example` for reference. Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://mzzqsjdcqhfpjhtlrejg.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key

# OpenRouter (LLM + Embeddings)
OPENROUTER_API_KEY=your_openrouter_key

# Astro Engine
ASTRO_ENGINE_URL=http://localhost:8000

# Redis (for BullMQ)
REDIS_URL=redis://localhost:6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

1. Run migrations in Supabase dashboard or via CLI:

```bash
# Apply all 7 migrations in order
supabase db push
```

Migrations:
1. `001_profiles.sql` - Family member profiles
2. `002_reports.sql` - Generated reports
3. `003_report_chunks.sql` - RAG embeddings (requires pgvector)
4. `004_chat.sql` - Chat sessions and messages
5. `005_alerts.sql` - Transit alerts
6. `006_preferences.sql` - User preferences
7. `007_hybrid_search_function.sql` - Hybrid search function

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Run report PDF generation worker (separate terminal)
npm run worker

# Run transit alert worker (separate terminal)
npm run alert-worker

# Build for production
npm run build

# Start production server
npm start
```

## Features Implemented

### ✅ Authentication
- Email + password signup/login
- Supabase Auth with SSR
- Protected routes via middleware

### ✅ Family Profiles
- CRUD operations for family members
- Birth data storage (date, time, place, coordinates)
- Relation tagging (self, spouse, parent, child, sibling)

### ✅ Birth Chart Calculation
- Integration with astro-engine (FastAPI Python microservice)
- Full chart data caching in database
- Type-safe HTTP client

### ✅ Report Generation
- 9 report types:
  1. In-Depth Horoscope
  2. Career & Business
  3. Wealth & Fortune
  4. Yearly Horoscope
  5. Jupiter Transit
  6. Saturn Transit (Sade Sati)
  7. Rahu-Ketu Transit
  8. Numerology
  9. Gem Recommendation
- Streaming SSE generation (watch report write in real-time)
- OpenRouter integration (Claude Sonnet 4.5 / Gemini Flash)
- Bilingual (English + Hindi)
- Auto-chunking and embedding for RAG
- Async PDF generation via BullMQ

### ✅ RAG Chat System
- Chat over birth chart + generated reports
- Hybrid search (vector similarity + full-text)
- Date-aware queries ("What's happening Feb 25-28?")
- SSE streaming responses
- Source citations
- Conversation history

### ✅ BullMQ Workers
- `report-worker.ts` - PDF generation (calls astro-engine)
- `alert-worker.ts` - Daily transit alerts

### ✅ Layout & Theme
- Celestial Dark theme
- Glassmorphism UI
- Sidebar navigation
- Header with notifications bell
- Responsive design

## API Routes

All routes under `/api/v1/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/profiles` | GET | List all profiles |
| `/profiles` | POST | Create profile |
| `/profiles/:id` | GET | Get profile |
| `/profiles/:id` | PATCH | Update profile |
| `/profiles/:id` | DELETE | Delete profile |
| `/calculate` | POST | Calculate birth chart |
| `/reports/generate` | POST | Generate report (SSE stream) |
| `/chat` | POST | RAG chat (SSE stream) |
| `/transits` | GET | Current planetary positions |
| `/alerts` | GET | List alerts |
| `/alerts` | PATCH | Update alert (mark read) |

## Next Steps

To complete the frontend:

1. **UI Components** (Team 3 task):
   - KundliChart.tsx (D3.js SVG)
   - DashaTimeline.tsx (D3.js)
   - YogaCard.tsx + YogaGrid.tsx
   - TransitWheel.tsx
   - SolarSystem3D.tsx (React Three Fiber)
   - ChatInterface.tsx
   - ReportViewer.tsx

2. **Integration**:
   - Wire components into pages
   - Connect to API routes
   - Test full flow

3. **Polish**:
   - Animations (Framer Motion)
   - Loading states
   - Error handling
   - Mobile responsiveness

## Notes

- React 18 used instead of React 19 for React Three Fiber compatibility
- All Supabase queries use RLS (Row Level Security)
- SSE streaming pattern copied from EAKC-MVP project
- BullMQ pattern copied from EAKC-MVP project
- Middleware handles auth session refresh

## References

- Architecture: `C:\Prabhat\Projects\JyotishAI\docs\ARCHITECTURE.md`
- Database Schema: `C:\Prabhat\Projects\JyotishAI\docs\DATABASE.md`
- Features: `C:\Prabhat\Projects\JyotishAI\docs\FEATURES.md`
- EAKC Reference: `C:\Prabhat\Projects\EAKC-MVP`
