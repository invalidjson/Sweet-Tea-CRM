import { describe, it, expect } from "vitest"
import { competitionPressureScore } from "../modules/competitionPressureScore"

describe("competitionPressureScore", () => {
  it("no competition data → score 40 with warning", () => {
    const r = competitionPressureScore({})
    expect(r.score).toBe(40)
    expect(r.warnings.some((w) => w.toLowerCase().includes("no competition data"))).toBe(true)
  })

  it("10+ competitors → adds 30", () => {
    const r = competitionPressureScore({ competition: { nearbyCompetitorCount: 12 } })
    expect(r.score).toBe(70)
    expect(r.reasons.some((s) => s.includes("12"))).toBe(true)
  })

  it("5-9 competitors → adds 20", () => {
    const r = competitionPressureScore({ competition: { nearbyCompetitorCount: 7 } })
    expect(r.score).toBe(60)
  })

  it("2-4 competitors → adds 10", () => {
    const r = competitionPressureScore({ competition: { nearbyCompetitorCount: 3 } })
    expect(r.score).toBe(50)
  })

  it("3+ competitors with better websites → adds 30", () => {
    const r = competitionPressureScore({ competition: { competitorsWithBetterWebsites: 4 } })
    expect(r.score).toBe(70)
    expect(r.reasons.some((s) => s.toLowerCase().includes("better websites"))).toBe(true)
  })

  it("1-2 competitors with better websites → adds 15", () => {
    const r = competitionPressureScore({ competition: { competitorsWithBetterWebsites: 2 } })
    expect(r.score).toBe(55)
  })

  it("3+ competitors with more reviews → adds 20", () => {
    const r = competitionPressureScore({ competition: { competitorsWithMoreReviews: 5 } })
    expect(r.score).toBe(60)
  })

  it("combined high competition → high score capped at 100", () => {
    const r = competitionPressureScore({
      competition: {
        nearbyCompetitorCount: 15,
        competitorsWithBetterWebsites: 5,
        competitorsWithMoreReviews: 4,
      },
    })
    expect(r.score).toBeLessThanOrEqual(100)
    expect(r.score).toBeGreaterThanOrEqual(80)
  })
})
