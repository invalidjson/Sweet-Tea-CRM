import { describe, it, expect } from "vitest"
import { activityScore } from "../modules/activityScore"

describe("activityScore", () => {
  it("no google data → score 30 with warning", () => {
    const r = activityScore({})
    expect(r.score).toBe(30)
    expect(r.warnings.length).toBeGreaterThan(0)
  })

  it("closed business → score 0", () => {
    const r = activityScore({ googlePlace: { isOperational: false } })
    expect(r.score).toBe(0)
    expect(r.warnings.some((w) => w.toLowerCase().includes("closed"))).toBe(true)
  })

  it("0 reviews → score 20 with warning", () => {
    const r = activityScore({ googlePlace: { reviewCount: 0, isOperational: true } })
    expect(r.score).toBe(20)
    expect(r.warnings.some((w) => w.toLowerCase().includes("zero reviews"))).toBe(true)
  })

  it("3 reviews → score 40", () => {
    const r = activityScore({ googlePlace: { reviewCount: 3, isOperational: true } })
    expect(r.score).toBe(40)
  })

  it("34 reviews → score 70", () => {
    const r = activityScore({ googlePlace: { reviewCount: 34, isOperational: true } })
    expect(r.score).toBe(70)
  })

  it("100 reviews → score 85", () => {
    const r = activityScore({ googlePlace: { reviewCount: 100, isOperational: true } })
    expect(r.score).toBe(85)
  })

  it("300 reviews → score 70 (established, may have resources)", () => {
    const r = activityScore({ googlePlace: { reviewCount: 300, isOperational: true } })
    expect(r.score).toBe(70)
  })

  it("600 reviews → score 55 (very established)", () => {
    const r = activityScore({ googlePlace: { reviewCount: 600, isOperational: true } })
    expect(r.score).toBe(55)
  })

  it("good rating 4.5 → adds 15", () => {
    const r = activityScore({ googlePlace: { reviewCount: 34, rating: 4.5, isOperational: true } })
    expect(r.score).toBe(85)
    expect(r.reasons.some((s) => s.includes("4.5"))).toBe(true)
  })

  it("low rating 2.8 → subtracts 20", () => {
    const r = activityScore({ googlePlace: { reviewCount: 34, rating: 2.8, isOperational: true } })
    expect(r.score).toBe(50)
    expect(r.warnings.some((w) => w.includes("2.8"))).toBe(true)
  })

  it("below average rating 3.3 → subtracts 10", () => {
    const r = activityScore({ googlePlace: { reviewCount: 34, rating: 3.3, isOperational: true } })
    expect(r.score).toBe(60)
  })

  it("has business hours → adds 10", () => {
    const r = activityScore({ googlePlace: { reviewCount: 34, hasBusinessHours: true, isOperational: true } })
    expect(r.score).toBe(80)
  })

  it("has photos → adds 5", () => {
    const r = activityScore({ googlePlace: { reviewCount: 34, hasPhotos: true, isOperational: true } })
    expect(r.score).toBe(75)
  })

  it("score never exceeds 100", () => {
    const r = activityScore({
      googlePlace: {
        reviewCount: 100,
        rating: 4.7,
        hasBusinessHours: true,
        hasPhotos: true,
        isOperational: true,
      },
    })
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.score).toBeGreaterThanOrEqual(0)
  })
})
