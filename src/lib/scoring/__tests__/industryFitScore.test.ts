import { describe, it, expect } from "vitest"
import { industryFitScore } from "../modules/industryFitScore"

describe("industryFitScore", () => {
  it("plumber → high fit score 90", () => {
    const r = industryFitScore({ category: "plumber" })
    expect(r.score).toBe(90)
    expect(r.reasons.length).toBeGreaterThan(0)
  })

  it("hvac → high fit score 90", () => {
    const r = industryFitScore({ category: "hvac" })
    expect(r.score).toBe(90)
  })

  it("dentist → high fit score 90", () => {
    const r = industryFitScore({ category: "dentist" })
    expect(r.score).toBe(90)
  })

  it("landscaping → high fit score 90", () => {
    const r = industryFitScore({ category: "landscaping" })
    expect(r.score).toBe(90)
  })

  it("software company → low fit score 10", () => {
    const r = industryFitScore({ category: "software company" })
    expect(r.score).toBe(10)
    expect(r.warnings.some((w) => w.toLowerCase().includes("poor fit"))).toBe(true)
  })

  it("marketing agency → low fit score 10", () => {
    const r = industryFitScore({ category: "marketing agency" })
    expect(r.score).toBe(10)
  })

  it("web design → low fit score 10", () => {
    const r = industryFitScore({ category: "web design" })
    expect(r.score).toBe(10)
  })

  it("retail shop → medium fit score 55", () => {
    const r = industryFitScore({ category: "retail" })
    expect(r.score).toBe(55)
  })

  it("gym → medium fit score 55", () => {
    const r = industryFitScore({ category: "gym fitness" })
    expect(r.score).toBe(55)
  })

  it("unknown category → neutral score 50 with warning", () => {
    const r = industryFitScore({ category: "zamboni repair" })
    expect(r.score).toBe(50)
    expect(r.warnings.some((w) => w.toLowerCase().includes("not recognized"))).toBe(true)
  })

  it("no category → neutral score 50 with warning", () => {
    const r = industryFitScore({})
    expect(r.score).toBe(50)
  })

  it("franchise → score 10 regardless of category", () => {
    const r = industryFitScore({ category: "hvac", business: { isFranchise: true } })
    expect(r.score).toBe(10)
    expect(r.warnings.some((w) => w.toLowerCase().includes("franchise"))).toBe(true)
  })

  it("chain business → score 20", () => {
    const r = industryFitScore({ category: "hvac", business: { isChain: true } })
    expect(r.score).toBe(20)
  })

  it("more than 5 locations → score 20", () => {
    const r = industryFitScore({ business: { numberOfLocations: 6 } })
    expect(r.score).toBe(20)
  })

  it("matches against business name if no category", () => {
    const r = industryFitScore({ businessName: "Joe's Plumbing & Drain" })
    expect(r.score).toBe(90)
  })
})
