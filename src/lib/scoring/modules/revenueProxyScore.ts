import type { LeadScoringInput, ScoreModuleResult } from "../types"

/**
 * Revenue Proxy Score — estimates whether this business can afford $100–200/month.
 *
 * We can't see their books, so we use public proxies:
 * review volume (customer throughput), price level, and number of locations.
 * One new customer per month typically pays for our service fee many times over
 * for most local trades — the bar to afford us is not high.
 */
export function revenueProxyScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []

  // Most operating local businesses can afford $100–200/month — optimistic baseline
  let score = 40

  const google = input.googlePlace
  const biz = input.business

  // ── Review count as customer volume proxy ─────────────────────────────────
  // Only adjust when we actually have review data — undefined means unknown, not zero
  const reviewCount = google?.reviewCount

  if (reviewCount !== undefined) {
    if (reviewCount >= 100) {
      score += 30
      reasons.push(`${reviewCount} reviews — strong customer volume indicates healthy revenue`)
    } else if (reviewCount >= 30) {
      score += 20
      reasons.push(`${reviewCount} reviews — decent customer base`)
    } else if (reviewCount >= 10) {
      score += 10
      reasons.push(`${reviewCount} reviews — moderate activity, likely covering basics`)
    } else if (reviewCount === 0) {
      score -= 10
      warnings.push("No reviews — revenue level very unclear, proceed cautiously")
    }
  }

  // ── Google price level: $ to $$$$ scale ───────────────────────────────────
  // Higher price = higher margins = more comfortable with a monthly fee
  if (biz?.priceLevel !== undefined) {
    if (biz.priceLevel >= 3) {
      score += 20
      reasons.push("Higher-priced business — strong margin, comfortable with service fees")
    } else if (biz.priceLevel === 2) {
      score += 10
      reasons.push("Mid-range pricing — can likely absorb a monthly fee")
    } else {
      // Budget businesses are more price-sensitive
      score -= 5
      warnings.push("Budget/low-price-point business — may be resistant to recurring fee")
    }
  }

  // ── Multi-location = more revenue, but also more resources (ambiguous) ────
  const locations = biz?.numberOfLocations ?? 1
  if (locations > 1 && locations <= 5) {
    score += 10
    reasons.push(`${locations} locations — multi-location revenue, affordable monthly fee`)
  } else if (locations > 5) {
    // Large chain territory — they have money but also have alternatives
    score -= 10
    warnings.push("Many locations — higher revenue but likely has in-house digital resources")
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasons,
    warnings,
  }
}
