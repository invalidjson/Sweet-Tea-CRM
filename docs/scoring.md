# Closeability Scoring Algorithm

The scoring system answers a single question: **how likely is a local business to need and buy a website from us?**

Every lead gets a score from 0–100 and a letter grade (A–F). The score is computed from seven weighted modules, with a penalty system that can subtract for hard disqualifiers.

---

## Grade Thresholds

| Grade | Range | Label |
|---|---|---|
| A | 80–100 | Hot lead |
| B | 65–79 | Strong lead |
| C | 45–64 | Possible lead |
| D | 25–44 | Weak lead |
| F | 0–24 | Poor fit |

---

## Score Formula

```
totalScore = clamp(weightedSum − penalties, 0, 100)

weightedSum =
  websiteScore        × 0.30
  digitalPresence     × 0.20
  activityScore       × 0.15
  industryFitScore    × 0.10
  revenueProxyScore   × 0.10
  reachabilityScore   × 0.10
  competitionPressure × 0.05
```

---

## System Overview

```mermaid
flowchart TD
    Input["LeadScoringInput\n(business data)"]

    Input --> W["websiteScore()\n30%"]
    Input --> D["digitalPresenceScore()\n20%"]
    Input --> A["activityScore()\n15%"]
    Input --> I["industryFitScore()\n10%"]
    Input --> R["revenueProxyScore()\n10%"]
    Input --> Re["reachabilityScore()\n10%"]
    Input --> C["competitionPressureScore()\n5%"]
    Input --> P["penaltyScore()\n−subtracted"]

    W & D & A & I & R & Re & C --> Sum["Weighted Sum\n0–100"]
    P --> Penalty["Penalty\n0–N"]

    Sum --> Calc["clamp(sum − penalty, 0, 100)\nround to integer"]
    Penalty --> Calc

    Calc --> Grade["Grade A–F\nLabel\nConfidence"]
    Calc --> Breakdown["Breakdown object\nper-module scores"]
    Calc --> Reasons["reasons[]\nwarnings[]"]
```

---

## Module Details

### 1. Website Score (30%)

> Higher score = more pain = more likely to buy.

```mermaid
flowchart TD
    Start(["hasWebsite?"])

    Start -->|"false"| NoSite["Score: 100\n'No website — immediate need'"]
    Start -->|"undefined + no URL + no analysis"| NoData["Score: 50\n'No website data'"]
    Start -->|"true but no analysis"| NoAnalysis["Score: 40\n'Quality data unavailable'"]
    Start -->|"true + analysis"| Analyze["Start at 10\nEvaluate signals"]

    Analyze --> HTTPS{{"hasHttps === false?"}}
    HTTPS -->|yes| H["+20"]
    HTTPS --> Mobile{{"isMobileFriendly === false?"}}
    Mobile -->|yes| M["+25"]
    Mobile -->|true| Mf["−5"]
    Mobile --> Load{{"loadTimeMs?"}}
    Load -->|">5000ms"| Ls["+25"]
    Load -->|">3000ms"| Lm["+15"]
    Load -->|"<1500ms"| Lf["−5"]
    Load --> Form{{"hasContactForm === false?"}}
    Form -->|yes| F["+10"]
    Form --> CTA{{"hasClearCallToAction === false?"}}
    CTA -->|yes| CT["+10"]
    CTA --> Book{{"hasOnlineBooking === false?"}}
    Book -->|yes| B["+5"]
    Book --> Broken{{"hasBrokenLinks?"}}
    Broken -->|yes| Br["+15"]
    Broken --> Modern{{"looksModern?"}}
    Modern -->|false| Mo["+20"]
    Modern -->|true| Mf2["−15"]
    Modern --> Platform{{"locked platform\n(wix/squarespace/\nwebflow/framer)?"}}
    Platform -->|yes| Pl["−10 + warning"]
    Platform --> Cap["cap at 90"]
```

**Key insight:** A business with a site (even a terrible one) is capped at 90 because they believe they're "covered." No website is the maximum pain signal (100).

---

### 2. Digital Presence Score (20%)

> Missing from the internet in ways the business owner probably doesn't realize.

Starts at 0. Pain signals add points; more pain = higher score.

| Signal | Points |
|---|---|
| No Facebook | +25 |
| No Instagram | +15 |
| Last social post >90 days ago | +20 |
| Last social post >30 days ago | +10 |
| No Google photos | +15 |
| No business hours on Google | +10 |
| Fewer than 5 reviews | +10 |
| No social data at all | +20 (with warning) |

---

### 3. Activity Score (15%)

> Is this a living business with real customers?

```mermaid
flowchart TD
    Op{{"isOperational === false?"}}
    Op -->|yes| Dead["Score: 0\n'Permanently closed'"]
    Op -->|no/unknown| Reviews["Check review count"]

    Reviews --> R0{{"0 reviews"}}
    Reviews --> R9{{"1–9 reviews"}}
    Reviews --> R49{{"10–49 reviews"}}
    Reviews --> R199{{"50–199 reviews"}}
    Reviews --> R499{{"200–499 reviews"}}
    Reviews --> R500{{"500+ reviews"}}

    R0 --> S20["Base: 20"]
    R9 --> S40["Base: 40"]
    R49 --> S70["Base: 70"]
    R199 --> S85["Base: 85"]
    R499 --> S70b["Base: 70\n(might be chain)"]
    R500 --> S55["Base: 55\n(likely corporate)"]

    S20 & S40 & S70 & S85 & S70b & S55 --> Rating["Apply rating modifier"]

    Rating --> RLow{{"rating < 3.0?"}}
    RLow -->|yes| RL["−20"]
    Rating --> RMed{{"rating < 3.5?"}}
    RMed -->|yes| RM["−10"]
    Rating --> RHigh{{"4.0–4.8?"}}
    RHigh -->|yes| RH["+15"]

    Rating --> Hours{{"hasBusinessHours?"}}
    Hours -->|yes| HY["+10"]
    Rating --> Photos{{"hasPhotos?"}}
    Photos -->|yes| PY["+5"]
```

**Why the curve:** 200–500 reviews suggests a restaurant or chain doing volume. 50–200 is the sweet spot for a thriving local service business.

---

### 4. Industry Fit Score (10%)

> Do businesses in this category regularly buy websites from agencies like ours?

```mermaid
flowchart LR
    Cat["Search string\n(category + name)"]

    Cat --> Low{{"Matches LOW_FIT?\n(software, hospital,\ngovernment, bank...)"}}
    Low -->|yes| LS["Score: 10\n'Poor fit for our offer'"]

    Cat --> High{{"Matches HIGH_FIT?\n(hvac, plumber, roofer,\nsalon, dentist, attorney...)"}}
    High -->|yes| HS["Score: 90\n'Strong fit'"]

    Cat --> Med{{"Matches MEDIUM_FIT?\n(retail, gym, realtor,\ninsurance agent...)"}}
    Med -->|yes| MS["Score: 55\n'Moderate fit'"]

    Cat --> Unknown["Score: 50\n'Unknown category'"]

    Franchise{{"isFranchise?"}} -->|yes| FS["Score: 10\n'Local can't approve'"]
    Chain{{"isChain?"}} -->|yes| CS["Score: 20\n'Centralized marketing'"]
    Locs{{"locations > 5?"}} -->|yes| LocS["Score: 20\n'Has in-house team'"]
```

---

### 5. Revenue Proxy Score (10%)

> Can this business afford $100–200/month?

Base: **40** (most operating local businesses can afford it).

| Signal | Effect |
|---|---|
| 100+ reviews | +30 |
| 30+ reviews | +20 |
| 10+ reviews | +10 |
| 0 reviews | −10 |
| Price level 3+ ($$$$) | +20 |
| Price level 2 ($$$) | +10 |
| Price level 1 ($$) | −5 |
| 2–5 locations | +10 |
| 6+ locations | −10 |

---

### 6. Reachability Score (10%)

> Can we actually contact this business?

```mermaid
flowchart TD
    Any{{"Any contact\nmethod at all?"}}
    Any -->|no| Zero["Score: 0\n'Unreachable'"]
    Any -->|yes| Build["Start at 0"]

    Build --> Ph{{"hasPhone?"}}
    Ph -->|yes| P["+50\n'Best channel for cold outreach'"]

    Build --> Em{{"hasEmail?"}}
    Em -->|yes| E["+30\n'Async follow-up'"]

    Build --> CF{{"hasContactForm?"}}
    CF -->|yes| C["+15\n'Fallback channel'"]

    Build --> SMS{{"smsCapable?"}}
    SMS -->|yes| S["+5\n'Text outreach'"]

    P & E & C & S --> Cap["cap at 100"]

    Ph -->|"phone only\n(no email, no form)"| Warn["Warning:\n'Limited to cold calls'"]
```

**Data sources for hasPhone:** `contact.phone` OR `googlePlace.hasPhone` — either one counts.

---

### 7. Competition Pressure Score (5%)

> How much pain is the business already feeling from competitors?

Base: **40** (every local market has some competition).

| Signal | Points |
|---|---|
| 10+ nearby competitors | +30 |
| 5–9 nearby competitors | +20 |
| 2–4 nearby competitors | +10 |
| 3+ competitors with better websites | +30 |
| 1–2 competitors with better websites | +15 |
| 3+ competitors with more reviews | +20 |
| 1–2 competitors with more reviews | +10 |

Capped at 100.

---

### 8. Penalty Score (subtracted from weighted total)

> Hard disqualifiers that override positive signals.

```mermaid
flowchart TD
    Input["Input signals"]

    Input --> Fr{{"isFranchise?"}}
    Fr -->|yes| FrP["+30 penalty\nFranchise — local can't approve"]

    Input --> Ch{{"isChain AND\nnot franchise?"}}
    Ch -->|yes| ChP["+20 penalty\nCorporate digital team"]

    Input --> Loc{{"locations > 10?"}}
    Loc -->|yes| LocP["+15 penalty\nEnterprise scale"]

    Input --> Cl{{"isOperational === false?"}}
    Cl -->|yes| ClP["+50 penalty\nPermanently closed"]

    Input --> Plat{{"Modern locked platform\nAND looksModern?"}}
    Plat -->|yes| PlatP["+15 penalty\nLow switch probability"]

    Input --> Con{{"No contact\nmethods?"}}
    Con -->|yes| ConP["+15 penalty\nUnreachable"]

    Input --> Dead{{"0 reviews AND\nno website AND\nno contact?"}}
    Dead -->|yes| DeadP["+20 penalty\nProbably not operating"]

    Input --> Ind{{"Low-fit industry\nkeyword match?"}}
    Ind -->|yes| IndP["+25 penalty\nWrong buyer profile"]

    FrP & ChP & LocP & ClP & PlatP & ConP & DeadP & IndP --> Total["Sum of penalties\n(subtracted from weighted total)"]
```

---

## Confidence Level

```mermaid
flowchart LR
    WD{{"Website data\nAND Google data\nAND contact data?"}}
    WD -->|yes| H["high"]

    GD{{"Google data AND\n(website OR contact)?"}}
    GD -->|yes| M["medium"]

    Else["Everything else"] --> L["low"]
```

**Low confidence** means the score is based on very limited signals. A low-confidence A is less reliable than a high-confidence B.

---

## Example Scores

| Business | Key Signals | Score | Grade |
|---|---|---|---|
| Peak Plumbing Co. | No website, phone, 87 reviews, 4.6★, HVAC/plumbing fit | ~85 | A |
| FreshCuts Barber (franchise) | Modern Squarespace site, 210 reviews — but franchise | ~20 | F |
| Lone Star HVAC | Outdated HTTP site, phone+email, 143 reviews, 8 competitors | ~78 | B |
| Metro Glass (no contacts) | Bad site, no phone, no email, no contact form | ~35 | D |
| Sunrise Yoga Studio | Category only, no other data | ~45 | C |

---

## TypeScript Interfaces

```typescript
// Input
interface LeadScoringInput {
  businessName?: string
  category?: string
  categories?: string[]
  hasWebsite?: boolean
  websiteUrl?: string
  websiteAnalysis?: {
    hasHttps?: boolean
    isMobileFriendly?: boolean
    loadTimeMs?: number
    hasContactForm?: boolean
    hasClearCallToAction?: boolean
    hasOnlineBooking?: boolean
    hasBrokenLinks?: boolean
    looksModern?: boolean
    detectedPlatform?: string
  }
  googlePlace?: {
    rating?: number
    reviewCount?: number
    hasPhone?: boolean
    hasBusinessHours?: boolean
    hasPhotos?: boolean
    isOperational?: boolean
  }
  contact?: {
    phone?: string
    email?: string
    contactPageUrl?: string
    smsCapable?: boolean
  }
  social?: {
    hasFacebook?: boolean
    hasInstagram?: boolean
    lastPostDate?: string
  }
  business?: {
    isFranchise?: boolean
    isChain?: boolean
    numberOfLocations?: number
    priceLevel?: number
  }
  competition?: {
    nearbyCompetitorCount?: number
    competitorsWithBetterWebsites?: number
    competitorsWithMoreReviews?: number
  }
}

// Output
interface CloseabilityScoreResult {
  totalScore: number                   // 0–100
  grade: "A" | "B" | "C" | "D" | "F"
  label: string                        // "Hot lead", "Strong lead", etc.
  confidence: "low" | "medium" | "high"
  breakdown: {
    website: number
    digitalPresence: number
    activity: number
    industryFit: number
    revenueProxy: number
    reachability: number
    competitionPressure: number
    penalties: number
  }
  reasons: string[]   // positive signals
  warnings: string[]  // negative signals + disqualifiers
}
```

---

## File Map

```
src/lib/scoring/
├── types.ts                          # LeadScoringInput, CloseabilityScoreResult
├── calculateCloseabilityScore.ts     # Orchestrator — weights, penalty, grade, confidence
├── mockLeads.ts                      # 5 pre-scored example leads
├── __tests__/
│   └── calculateCloseabilityScore.test.ts  # 5 vitest scenarios
└── modules/
    ├── websiteScore.ts
    ├── digitalPresenceScore.ts
    ├── activityScore.ts
    ├── industryFitScore.ts
    ├── revenueProxyScore.ts
    ├── reachabilityScore.ts
    ├── competitionPressureScore.ts
    └── penaltyScore.ts
```

Each module exports a single function `(input: LeadScoringInput): ScoreModuleResult` where `ScoreModuleResult = { score: number; reasons: string[]; warnings: string[] }`.
