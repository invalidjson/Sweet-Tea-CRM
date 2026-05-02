import { describe, it, expect } from "vitest"
import { reachabilityScore } from "../modules/reachabilityScore"

describe("reachabilityScore", () => {
  it("no contact methods at all → score 0 with warning", () => {
    const r = reachabilityScore({})
    expect(r.score).toBe(0)
    expect(r.warnings.some((w) => w.toLowerCase().includes("unreachable"))).toBe(true)
  })

  it("phone via contact → score 50", () => {
    const r = reachabilityScore({ contact: { phone: "512-555-0101" } })
    expect(r.score).toBe(50)
    expect(r.reasons.some((s) => s.toLowerCase().includes("phone"))).toBe(true)
  })

  it("phone via googlePlace.hasPhone → score 50", () => {
    const r = reachabilityScore({ googlePlace: { hasPhone: true } })
    expect(r.score).toBe(50)
  })

  it("email only → score 30", () => {
    const r = reachabilityScore({ contact: { email: "info@example.com" } })
    expect(r.score).toBe(30)
  })

  it("contact form only → score 15", () => {
    const r = reachabilityScore({ contact: { contactPageUrl: "https://example.com/contact" } })
    expect(r.score).toBe(15)
  })

  it("phone + email → score 80", () => {
    const r = reachabilityScore({
      contact: { phone: "512-555-0101", email: "info@example.com" },
    })
    expect(r.score).toBe(80)
  })

  it("phone + email + contact form → score 95", () => {
    const r = reachabilityScore({
      contact: {
        phone: "512-555-0101",
        email: "info@example.com",
        contactPageUrl: "https://example.com/contact",
      },
    })
    expect(r.score).toBe(95)
  })

  it("all channels including SMS → score 100", () => {
    const r = reachabilityScore({
      contact: {
        phone: "512-555-0101",
        email: "info@example.com",
        contactPageUrl: "https://example.com/contact",
        smsCapable: true,
      },
    })
    expect(r.score).toBe(100)
  })

  it("phone only → warns about limited follow-up", () => {
    const r = reachabilityScore({ contact: { phone: "512-555-0101" } })
    expect(r.warnings.some((w) => w.toLowerCase().includes("phone only"))).toBe(true)
  })

  it("contact form from websiteAnalysis counts as reachable", () => {
    const r = reachabilityScore({ websiteAnalysis: { hasContactForm: true } })
    expect(r.score).toBeGreaterThan(0)
  })

  it("score never exceeds 100", () => {
    const r = reachabilityScore({
      contact: { phone: "512-555-0101", email: "a@b.com", contactPageUrl: "x", smsCapable: true },
      googlePlace: { hasPhone: true },
      websiteAnalysis: { hasContactForm: true },
    })
    expect(r.score).toBeLessThanOrEqual(100)
  })
})
