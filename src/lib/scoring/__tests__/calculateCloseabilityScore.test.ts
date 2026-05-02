import { describe, it, expect } from "vitest"
import { calculateCloseabilityScore } from "../calculateCloseabilityScore"

describe("calculateCloseabilityScore", () => {
  it("no website + phone + decent reviews → high score (A or B)", () => {
    const result = calculateCloseabilityScore({
      businessName: "Peak Plumbing Co.",
      category: "plumber",
      hasWebsite: false,
      googlePlace: {
        rating: 4.6,
        reviewCount: 87,
        hasPhone: true,
        hasBusinessHours: true,
        hasPhotos: true,
        isOperational: true,
      },
      contact: { phone: "512-555-0101" },
    })

    expect(result.totalScore).toBeGreaterThanOrEqual(65)
    expect(["A", "B"]).toContain(result.grade)
    expect(result.warnings.some((w) => w.toLowerCase().includes("franchise"))).toBe(false)
  })

  it("modern website + strong profile + franchise → low score (D or F)", () => {
    const result = calculateCloseabilityScore({
      businessName: "FreshCuts Barber",
      category: "barber",
      hasWebsite: true,
      websiteUrl: "https://freshcuts.com",
      websiteAnalysis: {
        hasHttps: true,
        isMobileFriendly: true,
        loadTimeMs: 900,
        hasContactForm: true,
        hasClearCallToAction: true,
        hasOnlineBooking: true,
        looksModern: true,
        detectedPlatform: "squarespace",
      },
      googlePlace: {
        rating: 4.4,
        reviewCount: 210,
        hasPhone: true,
        hasBusinessHours: true,
        hasPhotos: true,
        isOperational: true,
      },
      contact: { phone: "512-555-0202", email: "hello@freshcuts.com" },
      business: { isFranchise: true, numberOfLocations: 35 },
    })

    expect(result.totalScore).toBeLessThan(45)
    expect(["D", "F"]).toContain(result.grade)
    expect(result.warnings.some((w) => w.toLowerCase().includes("franchise"))).toBe(true)
  })

  it("bad site but no phone or email → medium/low score with unreachable warning", () => {
    const result = calculateCloseabilityScore({
      businessName: "Metro Glass & Mirror",
      category: "glass",
      hasWebsite: true,
      websiteUrl: "http://metroglass.net",
      websiteAnalysis: {
        hasHttps: false,
        isMobileFriendly: false,
        loadTimeMs: 5800,
        hasContactForm: false,
        hasClearCallToAction: false,
        hasBrokenLinks: true,
        looksModern: false,
      },
      googlePlace: {
        rating: 4.1,
        reviewCount: 22,
        hasPhone: false,
        hasBusinessHours: false,
        hasPhotos: false,
        isOperational: true,
      },
      contact: {},
      social: { hasFacebook: false, hasInstagram: false },
    })

    expect(result.totalScore).toBeLessThan(65)
    expect(result.warnings.some((w) => w.toLowerCase().includes("unreachable") || w.toLowerCase().includes("no contact"))).toBe(true)
  })

  it("active home service company with outdated site → high score (A or B)", () => {
    const result = calculateCloseabilityScore({
      businessName: "Lone Star HVAC & Cooling",
      category: "hvac",
      hasWebsite: true,
      websiteUrl: "http://lonestarHVAC.com",
      websiteAnalysis: {
        hasHttps: false,
        isMobileFriendly: false,
        loadTimeMs: 4200,
        hasContactForm: false,
        hasClearCallToAction: false,
        looksModern: false,
      },
      googlePlace: {
        rating: 4.7,
        reviewCount: 143,
        hasPhone: true,
        hasBusinessHours: true,
        hasPhotos: true,
        isOperational: true,
      },
      contact: { phone: "512-555-0303", email: "info@lonestarHVAC.com" },
      social: {
        hasFacebook: true,
        hasInstagram: false,
        lastPostDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      competition: {
        nearbyCompetitorCount: 8,
        competitorsWithBetterWebsites: 5,
        competitorsWithMoreReviews: 2,
      },
    })

    expect(result.totalScore).toBeGreaterThanOrEqual(65)
    expect(["A", "B"]).toContain(result.grade)
  })

  it("sparse data lead → low confidence", () => {
    const result = calculateCloseabilityScore({
      businessName: "Sunrise Yoga Studio",
      category: "yoga",
    })

    expect(result.confidence).toBe("low")
    expect(result.totalScore).toBeLessThan(80)
  })
})
