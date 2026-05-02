import { describe, it, expect } from "vitest"
import { penaltyScore } from "../modules/penaltyScore"

// Baseline suppresses all penalties so tests isolate exactly one signal
const BASE = {
  contact: { phone: "512-555-0101" },
  googlePlace: { isOperational: true, reviewCount: 10 },
  hasWebsite: true,
}

describe("penaltyScore", () => {
  it("no disqualifiers → zero penalty", () => {
    const r = penaltyScore(BASE)
    expect(r.score).toBe(0)
    expect(r.warnings.length).toBe(0)
  })

  it("franchise → 30 penalty", () => {
    const r = penaltyScore({ ...BASE, business: { isFranchise: true } })
    expect(r.score).toBe(30)
    expect(r.warnings.some((w) => w.toLowerCase().includes("franchise"))).toBe(true)
  })

  it("chain (not franchise) → 20 penalty", () => {
    const r = penaltyScore({ ...BASE, business: { isChain: true, isFranchise: false } })
    expect(r.score).toBe(20)
  })

  it("more than 10 locations → 15 penalty", () => {
    const r = penaltyScore({ ...BASE, business: { numberOfLocations: 11 } })
    expect(r.score).toBe(15)
  })

  it("permanently closed → 50 penalty", () => {
    const r = penaltyScore({ ...BASE, googlePlace: { isOperational: false, reviewCount: 10 } })
    expect(r.score).toBe(50)
    expect(r.warnings.some((w) => w.toLowerCase().includes("closed"))).toBe(true)
  })

  it("modern site on locked platform → 15 penalty", () => {
    const r = penaltyScore({
      ...BASE,
      websiteAnalysis: { detectedPlatform: "squarespace", looksModern: true },
    })
    expect(r.score).toBe(15)
    expect(r.warnings.some((w) => w.toLowerCase().includes("locked platform"))).toBe(true)
  })

  it("non-modern site on locked platform → no penalty", () => {
    const r = penaltyScore({
      ...BASE,
      websiteAnalysis: { detectedPlatform: "wix", looksModern: false },
    })
    expect(r.score).toBe(0)
  })

  it("no contact methods → 15 penalty", () => {
    const r = penaltyScore({
      googlePlace: { isOperational: true, reviewCount: 10 },
      hasWebsite: true,
    })
    expect(r.score).toBe(15)
    expect(r.warnings.some((w) => w.toLowerCase().includes("no contact"))).toBe(true)
  })

  it("zero reviews + no website + no contact → extra 20 sparse penalty", () => {
    const r = penaltyScore({
      googlePlace: { reviewCount: 0 },
      hasWebsite: false,
    })
    // no contact (15) + sparse signals (20)
    expect(r.score).toBe(35)
  })

  it("low fit category → 25 penalty", () => {
    const r = penaltyScore({
      ...BASE,
      category: "software company",
    })
    expect(r.score).toBe(25)
  })

  it("multiple penalties accumulate", () => {
    const r = penaltyScore({
      business: { isFranchise: true },
      googlePlace: { isOperational: false },
      hasWebsite: true,
    })
    // franchise (30) + closed (50) + no contact (15)
    expect(r.score).toBe(95)
  })
})
