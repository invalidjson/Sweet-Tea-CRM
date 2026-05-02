const PLACES_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText"
const FIELD_MASK = "places.id,places.rating,places.userRatingCount,places.websiteUri"

interface CompPlace {
  id: string
  rating?: number
  userRatingCount?: number
  websiteUri?: string
}

export interface CompetitionResult {
  nearbyCompetitorCount: number
  competitorsWithMoreReviews: number
  competitorsWithBetterWebsites: number
}

export async function analyzeCompetition(
  businessType: string,
  city: string,
  state: string,
  thisBusiness: {
    googlePlaceId?: string
    reviewCount?: number
    hasWebsite?: boolean
  },
  apiKey: string
): Promise<CompetitionResult> {
  const empty = { nearbyCompetitorCount: 0, competitorsWithMoreReviews: 0, competitorsWithBetterWebsites: 0 }

  try {
    const res = await fetch(PLACES_TEXT_SEARCH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: `${businessType} in ${city}, ${state}`,
        maxResultCount: 20,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) return empty

    const data = await res.json()
    const all: CompPlace[] = data.places ?? []

    // Exclude this business from competitor list
    const competitors = all.filter((p) => p.id !== thisBusiness.googlePlaceId)

    const withMoreReviews = competitors.filter(
      (p) => (p.userRatingCount ?? 0) > (thisBusiness.reviewCount ?? 0)
    ).length

    // Count competitors that have a website; subtract 1 if we also have one (fair comparison)
    const competitorWebsiteCount = competitors.filter((p) => !!p.websiteUri).length
    const withBetterWebsites = thisBusiness.hasWebsite
      ? Math.max(0, competitorWebsiteCount - 1)
      : competitorWebsiteCount

    return {
      nearbyCompetitorCount: competitors.length,
      competitorsWithMoreReviews: withMoreReviews,
      competitorsWithBetterWebsites: withBetterWebsites,
    }
  } catch {
    return empty
  }
}
