import type { LeadScoringInput } from "./types"

export function grade(score: number): { grade: "A" | "B" | "C" | "D" | "F"; label: string } {
  if (score >= 80) return { grade: "A", label: "Hot lead" }
  if (score >= 65) return { grade: "B", label: "Strong lead" }
  if (score >= 45) return { grade: "C", label: "Possible lead" }
  if (score >= 25) return { grade: "D", label: "Weak lead" }
  return { grade: "F", label: "Poor fit" }
}

export function confidence(input: LeadScoringInput): "low" | "medium" | "high" {
  const hasWebsiteData = input.hasWebsite !== undefined || !!input.websiteAnalysis
  const hasGoogleData = !!input.googlePlace
  const hasContactData = !!input.contact

  if (hasWebsiteData && hasGoogleData && hasContactData) return "high"
  if (hasGoogleData && (hasWebsiteData || hasContactData)) return "medium"
  return "low"
}
