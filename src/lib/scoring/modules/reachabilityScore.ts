import type { LeadScoringInput, ScoreModuleResult } from "../types"

/**
 * Reachability Score — can we actually get in touch with this business?
 *
 * The best lead in the world is worth nothing if we can't reach them.
 * Phone is our primary channel for cold outreach to local businesses.
 * Email enables async follow-up. Contact forms are a fallback.
 */
export function reachabilityScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []
  let score = 0

  const contact = input.contact
  const google = input.googlePlace
  const wa = input.websiteAnalysis

  // Aggregate all available contact signals
  const hasPhone = !!(contact?.phone || google?.hasPhone)
  const hasEmail = !!contact?.email
  const hasContactForm = !!(contact?.contactPageUrl || wa?.hasContactForm)
  const isSmsCapable = !!contact?.smsCapable

  if (!hasPhone && !hasEmail && !hasContactForm) {
    warnings.push("No contact methods found — unreachable, cannot pursue")
    return { score: 0, reasons, warnings }
  }

  // Phone is by far the best channel: most local business owners answer calls
  if (hasPhone) {
    score += 50
    reasons.push("Has phone number — best channel for local business cold outreach")
  }

  // Email enables async outreach, written proposals, and follow-up sequences
  if (hasEmail) {
    score += 30
    reasons.push("Has email — enables cold email and async follow-up")
  }

  // Contact form is a fallback — we can reach them, but it's impersonal
  if (hasContactForm) {
    score += 15
    reasons.push("Has contact form — reachable via website if no direct contact")
  }

  // SMS-capable phone adds a fast, high-response-rate channel
  if (isSmsCapable) {
    score += 5
    reasons.push("SMS-capable — can use text outreach for quick follow-ups")
  }

  // Warn if stuck with phone only — limits follow-up strategy
  if (hasPhone && !hasEmail && !hasContactForm) {
    warnings.push("Phone only — limited to cold calls, no async follow-up path")
  }

  return {
    score: Math.min(100, score),
    reasons,
    warnings,
  }
}
