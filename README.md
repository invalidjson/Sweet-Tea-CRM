# CRM — AI-Powered Agency Lead Tool

[![Tests](https://github.com/invalidjson/Sweet-Tea-CRM/actions/workflows/test.yml/badge.svg)](https://github.com/invalidjson/Sweet-Tea-CRM/actions/workflows/test.yml)

Web agency CRM for finding and scoring local businesses that need web work. Searches Google Places + Apollo.io, scores leads by closeability (0–100), and manages your outreach pipeline.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **PostgreSQL** + **Prisma 7**
- **Tailwind CSS v4** + **shadcn/ui**
- **Vitest** for unit tests

## Getting Started

### Prerequisites

- Node 20+
- PostgreSQL running locally

### Setup

```bash
npm install
```

Copy `.env` and fill in your keys:

```bash
DATABASE_URL="postgresql://user@localhost:5432/mydb"
GOOGLE_PLACES_API_KEY="..."
APOLLO_API_KEY="..."
```

Push the schema and generate the Prisma client:

```bash
npx prisma db push
npx prisma generate
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing

```bash
npm test
```

## Key Features

- **Multi-source search** — Google Places + Apollo.io, deduplicated by phone/name fingerprint
- **Closeability scoring** — 8-module weighted score (website quality, reviews, reachability, competition pressure, etc.)
- **Lead enrichment** — website crawler (CMS detection, PageSpeed, CTAs) + Apollo.io org data
- **Do Not Call list** — flag leads DNC, auto-filtered from all future searches
- **Pipeline management** — status tracking, contact events, notes, follow-up scheduling
