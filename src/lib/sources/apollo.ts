import type { SearchResult } from "@/types"
import { calculateCloseabilityScore } from "@/lib/scoring/calculateCloseabilityScore"

const APOLLO_SEARCH = "https://api.apollo.io/api/v1/mixed_companies/search"
const APOLLO_ENRICH = "https://api.apollo.io/v1/organizations/enrich"

interface ApolloOrg {
  id?: string
  name?: string
  website_url?: string
  phone?: string
  primary_phone?: { number?: string; sanitized_number?: string }
  linkedin_url?: string
  city?: string
  state?: string
  country?: string
  zip_code?: string
  raw_address?: string
  street_address?: string
  industry?: string
  estimated_num_employees?: number
  founded_year?: number
  short_description?: string
  seo_description?: string
  logo_url?: string
  primary_domain?: string
}

interface ApolloSearchResponse {
  organizations?: ApolloOrg[]
  pagination?: { page: number; per_page: number; total_entries: number; total_pages: number }
}

export async function searchApollo(
  term: string,
  city: string,
  state: string
): Promise<SearchResult[]> {
  const apiKey = process.env.APOLLO_API_KEY
  if (!apiKey) return []

  let raw: Response
  try {
    raw = await fetch(APOLLO_SEARCH, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
      body: JSON.stringify({
        q_organization_name: term,
        organization_locations: [`${city}, ${state}, United States`],
        per_page: 25,
        page: 1,
      }),
      cache: "no-store",
    })
  } catch {
    return []
  }

  if (!raw.ok) return []

  const data: ApolloSearchResponse = await raw.json()

  return (data.organizations ?? [])
    .filter((org) => org.id && org.name)
    .map((org) => {
      const website = org.website_url || undefined
      const phone =
        org.primary_phone?.sanitized_number ??
        org.primary_phone?.number ??
        org.phone ??
        undefined

      const scored = calculateCloseabilityScore({
        businessName: org.name!,
        category: org.industry ?? "",
        city: org.city ?? city,
        state: org.state ?? state,
        hasWebsite: !!website,
        googlePlace: {
          hasPhone: !!phone,
          isOperational: true,
        },
      })

      return {
        externalId: `apollo_${org.id}`,
        source: "apollo" as const,
        apolloOrgId: org.id,
        linkedinUrl: org.linkedin_url ?? undefined,
        employeeCount: org.estimated_num_employees,
        businessName: org.name!,
        address: org.raw_address ?? org.street_address ?? "",
        city: org.city ?? city,
        state: org.state ?? state,
        zip: org.zip_code ?? undefined,
        phone,
        website,
        hasWebsite: !!website,
        primaryCategory: org.industry ?? undefined,
        closeabilityScore: scored.totalScore,
        scoreGrade: scored.grade,
        scoreLabel: scored.label,
        scoreConfidence: scored.confidence,
        scoreBreakdown: scored.breakdown,
        scoreReasons: scored.reasons,
        scoreWarnings: scored.warnings,
      }
    })
}

export interface ApolloOrgData {
  apolloOrgId?: string
  linkedinUrl?: string
  employeeCount?: number
  foundedYear?: number
  description?: string
}

export async function enrichWithApollo(domain: string): Promise<ApolloOrgData | null> {
  const apiKey = process.env.APOLLO_API_KEY
  if (!apiKey || !domain) return null

  try {
    const url = new URL(APOLLO_ENRICH)
    url.searchParams.set("domain", domain)

    const raw = await fetch(url, {
      headers: {
        "x-api-key": apiKey,
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    })
    if (!raw.ok) return null

    const data = await raw.json()
    const org = data?.organization
    if (!org) return null

    return {
      apolloOrgId: org.id ?? undefined,
      linkedinUrl: org.linkedin_url ?? undefined,
      employeeCount: org.estimated_num_employees ?? undefined,
      foundedYear: org.founded_year ?? undefined,
      description: org.short_description ?? org.seo_description ?? undefined,
    }
  } catch {
    return null
  }
}
