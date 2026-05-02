# Sweet Tea CRM

![Sweet Tea CRM](public/sweet-tea-crm.png)

<img width="1528" height="1064" alt="Screenshot 2026-05-02 at 6 05 01 PM" src="https://github.com/user-attachments/assets/e9bbb15e-3724-4017-aaa5-29779c49ce8d" />
<img width="1270" height="1060" alt="Screenshot 2026-05-02 at 6 05 46 PM" src="https://github.com/user-attachments/assets/ab2e1654-cc9e-4dad-80af-e5b24fe70bba" />
<img width="1520" height="1067" alt="Screenshot 2026-05-02 at 6 06 00 PM" src="https://github.com/user-attachments/assets/22e56dd0-9bb8-4379-b85d-68ad4779fbf9" />
<img width="1264" height="1069" alt="Screenshot 2026-05-02 at 6 06 11 PM" src="https://github.com/user-attachments/assets/3079db65-7db1-4f90-ae14-7015882f4194" />



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
