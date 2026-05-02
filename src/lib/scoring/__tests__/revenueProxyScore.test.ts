import { describe, it, expect } from "vitest"
import { revenueProxyScore } from "../modules/revenueProxyScore"

describe("revenueProxyScore", () => {
  it("no data → baseline score 40", () => {
    const r = revenueProxyScore({})
    expect(r.score).toBe(40)
  })

  it("100+ reviews → adds 30", () => {
    const r = revenueProxyScore({ googlePlace: { reviewCount: 150 } })
    expect(r.score).toBe(70)
    expect(r.reasons.some((s) => s.includes("150"))).toBe(true)
  })

  it("30-99 reviews → adds 20", () => {
    const r = revenueProxyScore({ googlePlace: { reviewCount: 45 } })
    expect(r.score).toBe(60)
  })

  it("10-29 reviews → adds 10", () => {
    const r = revenueProxyScore({ googlePlace: { reviewCount: 15 } })
    expect(r.score).toBe(50)
  })

  it("0 reviews → subtracts 10", () => {
    const r = revenueProxyScore({ googlePlace: { reviewCount: 0 } })
    expect(r.score).toBe(30)
    expect(r.warnings.some((w) => w.toLowerCase().includes("revenue level"))).toBe(true)
  })

  it("high price level (3+) → adds 20", () => {
    const r = revenueProxyScore({ business: { priceLevel: 3 } })
    expect(r.score).toBe(60)
    expect(r.reasons.some((s) => s.toLowerCase().includes("margin"))).toBe(true)
  })

  it("mid price level (2) → adds 10", () => {
    const r = revenueProxyScore({ business: { priceLevel: 2 } })
    expect(r.score).toBe(50)
  })

  it("low price level (1) → subtracts 5", () => {
    const r = revenueProxyScore({ business: { priceLevel: 1 } })
    expect(r.score).toBe(35)
    expect(r.warnings.some((w) => w.toLowerCase().includes("budget"))).toBe(true)
  })

  it("2-5 locations → adds 10", () => {
    const r = revenueProxyScore({ business: { numberOfLocations: 3 } })
    expect(r.score).toBe(50)
  })

  it("more than 5 locations → subtracts 10", () => {
    const r = revenueProxyScore({ business: { numberOfLocations: 8 } })
    expect(r.score).toBe(30)
  })

  it("score stays within 0–100", () => {
    const r = revenueProxyScore({
      googlePlace: { reviewCount: 500 },
      business: { priceLevel: 4, numberOfLocations: 3 },
    })
    expect(r.score).toBeGreaterThanOrEqual(0)
    expect(r.score).toBeLessThanOrEqual(100)
  })
})
