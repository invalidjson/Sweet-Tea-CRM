import type { SearchResult } from "@/types"

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : digits
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\b(the|a|an|llc|inc|co|corp|ltd|services|service)\b/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function fingerprint(result: SearchResult): string {
  if (result.phone) {
    const phone = normalizePhone(result.phone)
    if (phone.length === 10) return `phone:${phone}`
  }
  const name = normalizeName(result.businessName)
  const city = result.city.toLowerCase().trim()
  return `name:${name}|city:${city}`
}

function mergeResults(google: SearchResult, apollo: SearchResult): SearchResult {
  return {
    ...google,
    source: "merged",
    apolloOrgId: apollo.apolloOrgId,
    linkedinUrl: apollo.linkedinUrl,
    employeeCount: apollo.employeeCount,
    website: google.website ?? apollo.website,
    hasWebsite: google.hasWebsite || apollo.hasWebsite,
    phone: google.phone ?? apollo.phone,
    zip: google.zip ?? apollo.zip,
  }
}

export function deduplicateResults(
  primary: SearchResult[],
  secondary: SearchResult[]
): SearchResult[] {
  const fpMap = new Map<string, SearchResult>()

  for (const result of primary) {
    fpMap.set(fingerprint(result), { ...result, source: result.source ?? "google" })
  }

  for (const apolloResult of secondary) {
    const fp = fingerprint(apolloResult)
    const existing = fpMap.get(fp)
    if (existing) {
      fpMap.set(fp, mergeResults(existing, apolloResult))
    } else {
      fpMap.set(fp, apolloResult)
    }
  }

  return Array.from(fpMap.values())
}
