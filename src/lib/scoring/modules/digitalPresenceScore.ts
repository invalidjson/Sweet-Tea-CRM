import type { LeadScoringInput, ScoreModuleResult } from "../types"

/**
 * Digital Presence Score — measures gaps in a business's online footprint
 * beyond just the website. Higher score = more opportunity for us to add value.
 *
 * Missing social media, incomplete Google profiles, and stale content are all
 * gaps we can help fill with our services.
 */
export function digitalPresenceScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []
  let score = 0

  const social = input.social
  const google = input.googlePlace

  // ── Social media presence ─────────────────────────────────────────────────

  if (social) {
    // Facebook is still the dominant local business discovery platform
    if (social.hasFacebook === false) {
      score += 25
      reasons.push("No Facebook presence — missing primary local social channel")
    } else if (social.hasFacebook === true) {
      score += 5 // present but check activity below
    }

    // Instagram matters especially for visual local businesses
    if (social.hasInstagram === false) {
      score += 15
      reasons.push("No Instagram — missing visual marketing channel")
    } else if (social.hasInstagram === true) {
      score += 5
    }

    // Stale social = set up and abandoned (extremely common with small biz owners)
    if (social.lastPostDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(social.lastPostDate).getTime()) / 86400000
      )
      if (daysSince > 90) {
        score += 20
        reasons.push(`Social media dormant — last post ${daysSince} days ago`)
      } else if (daysSince > 30) {
        score += 10
        reasons.push(`Social media infrequent — last post ${daysSince} days ago`)
      } else {
        // Active social = less gap for us to fill
        score -= 5
      }
    }
  } else {
    // No social data at all — assume partial presence
    score += 20
    warnings.push("No social media data available — assuming gaps in presence")
  }

  // ── Google Business Profile quality ───────────────────────────────────────

  if (google) {
    // No photos = unprofessional, low-trust Google listing
    if (google.hasPhotos === false) {
      score += 15
      reasons.push("No photos on Google listing — looks unprofessional to searchers")
    }

    // No business hours = frustrates customers; Google shows "hours unknown"
    if (google.hasBusinessHours === false) {
      score += 10
      reasons.push("No business hours listed — customers don't know when to call")
    }

    // Very few reviews = low social proof, incomplete profile
    if ((google.reviewCount ?? 0) < 5) {
      score += 10
      reasons.push("Very few Google reviews — weak social proof signals")
    }
  } else {
    score += 15
    warnings.push("No Google profile data available")
  }

  return {
    score: Math.min(100, score),
    reasons,
    warnings,
  }
}
