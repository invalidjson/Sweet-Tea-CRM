import { describe, it, expect } from "vitest"
import { digitalPresenceScore } from "../modules/digitalPresenceScore"

describe("digitalPresenceScore", () => {
  it("no social or google data → score 35 with warnings", () => {
    const r = digitalPresenceScore({})
    // no social (20) + no google (15) = 35
    expect(r.score).toBe(35)
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it("no Facebook → adds 25", () => {
    const r = digitalPresenceScore({ social: { hasFacebook: false } })
    expect(r.score).toBeGreaterThanOrEqual(25)
    expect(r.reasons.some((s) => s.toLowerCase().includes("facebook"))).toBe(true)
  })

  it("no Instagram → adds 15", () => {
    const r = digitalPresenceScore({ social: { hasInstagram: false } })
    expect(r.score).toBeGreaterThanOrEqual(15)
    expect(r.reasons.some((s) => s.toLowerCase().includes("instagram"))).toBe(true)
  })

  it("dormant social (>90 days) → adds 20", () => {
    const stale = new Date(Date.now() - 100 * 86400000).toISOString()
    const r = digitalPresenceScore({ social: { lastPostDate: stale } })
    expect(r.score).toBeGreaterThanOrEqual(20)
    expect(r.reasons.some((s) => s.toLowerCase().includes("dormant"))).toBe(true)
  })

  it("infrequent social (31-90 days) → adds 10", () => {
    const recent = new Date(Date.now() - 45 * 86400000).toISOString()
    const r = digitalPresenceScore({ social: { lastPostDate: recent } })
    expect(r.reasons.some((s) => s.toLowerCase().includes("infrequent"))).toBe(true)
  })

  it("active social (<30 days) → subtracts 5", () => {
    const active = new Date(Date.now() - 10 * 86400000).toISOString()
    const base = digitalPresenceScore({ social: {} })
    const withActive = digitalPresenceScore({ social: { lastPostDate: active } })
    expect(withActive.score).toBeLessThan(base.score)
  })

  it("no photos on Google → adds 15", () => {
    const r = digitalPresenceScore({ googlePlace: { hasPhotos: false } })
    expect(r.score).toBeGreaterThanOrEqual(15)
    expect(r.reasons.some((s) => s.toLowerCase().includes("photos"))).toBe(true)
  })

  it("no business hours on Google → adds 10", () => {
    const r = digitalPresenceScore({ googlePlace: { hasBusinessHours: false } })
    expect(r.score).toBeGreaterThanOrEqual(10)
    expect(r.reasons.some((s) => s.toLowerCase().includes("hours"))).toBe(true)
  })

  it("very few reviews (<5) → adds 10", () => {
    const r = digitalPresenceScore({ googlePlace: { reviewCount: 3 } })
    expect(r.reasons.some((s) => s.toLowerCase().includes("few"))).toBe(true)
  })

  it("score never exceeds 100", () => {
    const r = digitalPresenceScore({
      social: { hasFacebook: false, hasInstagram: false },
      googlePlace: { hasPhotos: false, hasBusinessHours: false, reviewCount: 2 },
    })
    expect(r.score).toBeLessThanOrEqual(100)
  })
})
