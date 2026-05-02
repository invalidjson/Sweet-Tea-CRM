import type { LeadScoringInput, ScoreModuleResult } from "../types"

/**
 * Activity Score — measures how alive and active the business is.
 * Higher score = business is active, reachable, and worth pursuing.
 *
 * We want businesses in the sweet spot: established enough to afford us and
 * motivated to improve, but not so large they already have digital resources.
 * The ideal lead has 10–200 reviews and a 3.5–4.8 rating.
 */
export function activityScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []
  const google = input.googlePlace

  if (!google) {
    warnings.push("No Google profile data — activity level unknown")
    return { score: 30, reasons, warnings }
  }

  // Closed/not operational = skip entirely; can't pay us
  if (google.isOperational === false) {
    warnings.push("Business appears permanently closed or not operational")
    return { score: 0, reasons, warnings }
  }

  // ── Review count: best proxy for customer volume and business health ───────
  const reviewCount = google.reviewCount ?? 0
  let score: number

  if (reviewCount === 0) {
    score = 20
    warnings.push("Zero reviews — may be new, inactive, or unclaimed Google profile")
  } else if (reviewCount < 10) {
    score = 40
    reasons.push(`${reviewCount} reviews — early-stage business, establishing presence`)
  } else if (reviewCount < 50) {
    score = 70
    reasons.push(`${reviewCount} reviews — active local business in ideal target range`)
  } else if (reviewCount < 200) {
    score = 85
    reasons.push(`${reviewCount} reviews — well-established, high-value target`)
  } else if (reviewCount < 500) {
    score = 70
    reasons.push(`${reviewCount} reviews — established, may have more digital resources`)
  } else {
    score = 55
    reasons.push(`${reviewCount}+ reviews — very established, may already have marketing team`)
  }

  // ── Rating: signals business quality and customer satisfaction ────────────
  if (google.rating !== undefined) {
    const r = google.rating
    if (r < 3.0) {
      score -= 20
      warnings.push(`Low rating (${r}★) — operational problems may make this a harder sale`)
    } else if (r < 3.5) {
      score -= 10
      warnings.push(`Below-average rating (${r}★) — worth noting before outreach`)
    } else if (r >= 4.0 && r <= 4.8) {
      // Sweet spot: good business that cares about reputation
      score += 15
      reasons.push(`Good rating (${r}★) — quality business, motivated to maintain reputation`)
    } else if (r > 4.8) {
      score += 5
      // Very high ratings may indicate a small review sample or managed reviews
    }
    // 3.5–4.0: neutral, no adjustment
  }

  // Listed business hours = professional enough to maintain their profile
  if (google.hasBusinessHours === true) {
    score += 10
    reasons.push("Business hours listed — active Google profile")
  }

  // Has photos = invested some effort in digital presence
  if (google.hasPhotos === true) {
    score += 5
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
    warnings,
  }
}
