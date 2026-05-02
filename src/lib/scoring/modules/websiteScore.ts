import type { LeadScoringInput, ScoreModuleResult } from "../types"

/**
 * Website Score — measures how much pain a business has with their current
 * web presence. Higher score = more pain = more likely to buy from us.
 *
 * We sell websites. A business with no site or a broken/outdated one is our
 * ideal customer. A modern, fast, well-designed site means low urgency.
 */
export function websiteScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []

  // No website at all = maximum pain — they have zero online presence
  if (input.hasWebsite === false) {
    reasons.push("No website — immediate need for web presence")
    return { score: 100, reasons, warnings }
  }

  // No website data whatsoever — can't score
  if (input.hasWebsite === undefined && !input.websiteUrl && !input.websiteAnalysis) {
    warnings.push("No website data — cannot assess web presence")
    return { score: 50, reasons, warnings }
  }

  // hasWebsite true but no analysis data — conservatively assume mediocre
  if (!input.websiteAnalysis) {
    warnings.push("Website exists but quality data unavailable — estimating conservatively")
    return { score: 40, reasons, warnings }
  }

  // Website exists — score the quality (pain)
  // Start low: having any site is a partial win for them
  let score = 10
  const wa = input.websiteAnalysis!

  // No HTTPS: browsers show "Not Secure" warnings; Google SEO penalty
  if (wa.hasHttps === false) {
    score += 20
    reasons.push("No HTTPS — browsers show security warnings, hurts SEO and trust")
  }

  // Not mobile-friendly: 60%+ of traffic is mobile; Google mobile-first indexing
  if (wa.isMobileFriendly === false) {
    score += 25
    reasons.push("Not mobile-friendly — majority of local searches happen on phones")
  } else if (wa.isMobileFriendly === true) {
    score -= 5
  }

  // Load time: >3s causes significant bounce rate; Google ranks slow sites lower
  if (wa.loadTimeMs !== undefined) {
    if (wa.loadTimeMs > 5000) {
      score += 25
      reasons.push(`Very slow load time (${(wa.loadTimeMs / 1000).toFixed(1)}s) — most visitors leave before it loads`)
    } else if (wa.loadTimeMs > 3000) {
      score += 15
      reasons.push(`Slow load time (${(wa.loadTimeMs / 1000).toFixed(1)}s) — above 3s bounce threshold`)
    } else if (wa.loadTimeMs < 1500) {
      score -= 5
    }
  }

  // No contact form: visitors can't convert; leads are lost
  if (wa.hasContactForm === false) {
    score += 10
    reasons.push("No contact form — visitors have no way to reach out on-site")
  }

  // No clear CTA: visitors don't know what action to take
  if (wa.hasClearCallToAction === false) {
    score += 10
    reasons.push("No clear call-to-action — site doesn't guide visitors toward conversion")
  }

  // No online booking: service businesses lose jobs to competitors who have it
  if (wa.hasOnlineBooking === false) {
    score += 5
    reasons.push("No online booking — service business missing appointment automation")
  }

  // Broken links: unprofessional, signals neglect, hurts SEO
  if (wa.hasBrokenLinks === true) {
    score += 15
    reasons.push("Broken links found — site is neglected, hurts credibility and SEO")
  }

  // Outdated design: poor first impression; customers judge quality by website
  if (wa.looksModern === false) {
    score += 20
    reasons.push("Outdated design — poor first impression, customers may go to competitor")
  } else if (wa.looksModern === true) {
    // Modern design = less urgent need for redesign
    score -= 15
  }

  // Modern DIY platforms are often recently updated/locked — harder for us to displace
  const modernPlatforms = ["squarespace", "wix", "webflow", "framer"]
  if (wa.detectedPlatform) {
    const platform = wa.detectedPlatform.toLowerCase()
    if (modernPlatforms.some((p) => platform.includes(p))) {
      score -= 10
      warnings.push(`Built on ${wa.detectedPlatform} — may be recently refreshed or locked to platform`)
    }
  }

  // Cap at 90: a business with a site (even a bad one) is a harder sell than
  // one with nothing — they think they're "covered"
  return {
    score: Math.max(0, Math.min(90, score)),
    reasons,
    warnings,
  }
}
