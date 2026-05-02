import { describe, it, expect } from "vitest"
import { websiteScore } from "../modules/websiteScore"

describe("websiteScore", () => {
  it("no website → score 100", () => {
    const r = websiteScore({ hasWebsite: false })
    expect(r.score).toBe(100)
    expect(r.reasons.some((s) => s.toLowerCase().includes("no website"))).toBe(true)
  })

  it("website unknown, no url, no analysis → score 50", () => {
    const r = websiteScore({})
    expect(r.score).toBe(50)
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it("has website but no analysis data → score 40", () => {
    const r = websiteScore({ hasWebsite: true })
    expect(r.score).toBe(40)
    expect(r.warnings.some((w) => w.toLowerCase().includes("quality data unavailable"))).toBe(true)
  })

  it("fully broken site → capped at 90", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: {
        hasHttps: false,
        isMobileFriendly: false,
        loadTimeMs: 6000,
        hasContactForm: false,
        hasClearCallToAction: false,
        hasOnlineBooking: false,
        hasBrokenLinks: true,
        looksModern: false,
      },
    })
    expect(r.score).toBe(90)
  })

  it("no HTTPS alone → adds 20 to base 10", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: { hasHttps: false },
    })
    expect(r.score).toBe(30)
    expect(r.reasons.some((s) => s.toLowerCase().includes("https"))).toBe(true)
  })

  it("not mobile friendly → adds 25", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: { isMobileFriendly: false },
    })
    expect(r.score).toBe(35)
  })

  it("load time > 5s → adds 25", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: { loadTimeMs: 5500 },
    })
    expect(r.score).toBe(35)
  })

  it("load time 3–5s → adds 15", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: { loadTimeMs: 4000 },
    })
    expect(r.score).toBe(25)
  })

  it("fast load time < 1.5s → subtracts 5", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: { loadTimeMs: 1000 },
    })
    expect(r.score).toBe(5)
  })

  it("modern design → subtracts 15", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: { looksModern: true },
    })
    expect(r.score).toBe(0)
  })

  it("squarespace modern site → warns and reduces score", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: { looksModern: true, detectedPlatform: "squarespace" },
    })
    expect(r.warnings.some((w) => w.toLowerCase().includes("squarespace"))).toBe(true)
    expect(r.score).toBeLessThan(10)
  })

  it("score never goes below 0", () => {
    const r = websiteScore({
      hasWebsite: true,
      websiteAnalysis: {
        isMobileFriendly: true,
        loadTimeMs: 800,
        looksModern: true,
        detectedPlatform: "squarespace",
      },
    })
    expect(r.score).toBeGreaterThanOrEqual(0)
  })
})
