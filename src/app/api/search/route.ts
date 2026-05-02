import { NextRequest, NextResponse } from "next/server"
import { calculateCloseabilityScore } from "@/lib/scoring/calculateCloseabilityScore"
import { searchApollo } from "@/lib/sources/apollo"
import { deduplicateResults } from "@/lib/deduplication"
import { prisma } from "@/lib/prisma"
import type { SearchResult } from "@/types"

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : digits
}

const PLACES_TEXT_SEARCH = "https://places.googleapis.com/v1/places:searchText"

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.rating",
  "places.userRatingCount",
  "places.types",
  "places.priceLevel",
  "places.currentOpeningHours",
  "places.photos",
  "places.businessStatus",
  "places.websiteUri",
  "places.nationalPhoneNumber",
].join(",")

const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
}

interface NewPlace {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  types?: string[]
  priceLevel?: string
  currentOpeningHours?: { openNow?: boolean }
  photos?: unknown[]
  businessStatus?: string
  websiteUri?: string
  nationalPhoneNumber?: string
}

interface NewPlacesResponse {
  places?: NewPlace[]
  nextPageToken?: string
}

function parseAddress(formatted: string): {
  address: string
  city: string
  state: string
  zip?: string
} {
  const parts = formatted
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "USA" && s !== "United States")

  if (parts.length >= 3) {
    const stateZip = parts[parts.length - 1]
    const city = parts[parts.length - 2]
    const address = parts.slice(0, parts.length - 2).join(", ")
    const [state, zip] = stateZip.split(" ")
    return { address, city, state, zip }
  }

  if (parts.length === 2) {
    const stateZip = parts[parts.length - 1]
    const [state, zip] = stateZip.split(" ")
    return { address: parts[0], city: parts[0], state, zip }
  }

  return { address: formatted, city: "", state: "" }
}

async function searchGoogle(
  businessType: string,
  city: string,
  state: string,
  apiKey: string,
  pageToken?: string
): Promise<{ results: SearchResult[]; nextPageToken: string | null }> {
  const raw = await fetch(PLACES_TEXT_SEARCH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${businessType} in ${city}, ${state}`,
      maxResultCount: 20,
      ...(pageToken ? { pageToken } : {}),
    }),
    cache: "no-store",
  })

  if (!raw.ok) {
    const err = await raw.json().catch(() => ({}))
    const msg = (err as { error?: { message?: string } })?.error?.message ?? raw.statusText
    throw new Error(`Places API error: ${msg}`)
  }

  const data: NewPlacesResponse = await raw.json()

  const results: SearchResult[] = (data.places ?? []).map((place) => {
    const { address, city: parsedCity, state: parsedState, zip } = parseAddress(place.formattedAddress ?? "")
    const website = place.websiteUri
    const phone = place.nationalPhoneNumber

    const isOperational =
      place.businessStatus !== "CLOSED_PERMANENTLY" &&
      place.businessStatus !== "CLOSED_TEMPORARILY"

    const category = place.types?.[0]?.replace(/_/g, " ") ?? ""
    const categories = place.types?.map((t) => t.replace(/_/g, " "))

    const scored = calculateCloseabilityScore({
      businessName: place.displayName?.text ?? "",
      category,
      categories,
      city: parsedCity,
      state: parsedState,
      hasWebsite: !!website,
      googlePlace: {
        rating: place.rating,
        reviewCount: place.userRatingCount,
        hasPhotos: (place.photos?.length ?? 0) > 0,
        hasBusinessHours: !!place.currentOpeningHours,
        hasPhone: !!phone,
        isOperational,
      },
      business: {
        priceLevel: place.priceLevel !== undefined ? PRICE_LEVEL_MAP[place.priceLevel] : undefined,
      },
    })

    return {
      externalId: place.id,
      source: "google" as const,
      businessName: place.displayName?.text ?? "",
      address,
      city: parsedCity,
      state: parsedState,
      zip,
      phone,
      website,
      hasWebsite: !!website,
      primaryCategory: category || undefined,
      googleRating: place.rating,
      googleReviewCount: place.userRatingCount,
      googleHasPhotos: (place.photos?.length ?? 0) > 0,
      googleHasHours: !!place.currentOpeningHours,
      closeabilityScore: scored.totalScore,
      scoreGrade: scored.grade,
      scoreLabel: scored.label,
      scoreConfidence: scored.confidence,
      scoreBreakdown: scored.breakdown,
      scoreReasons: scored.reasons,
      scoreWarnings: scored.warnings,
    }
  })

  return { results, nextPageToken: data.nextPageToken ?? null }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const businessType = searchParams.get("businessType")?.trim()
  const city = searchParams.get("city")?.trim()
  const state = searchParams.get("state")?.trim()
  const pageToken = searchParams.get("pageToken")?.trim() || undefined

  if (!businessType || !city || !state) {
    return NextResponse.json({ error: "Missing required params: businessType, city, state" }, { status: 400 })
  }

  const googleApiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!googleApiKey) {
    return NextResponse.json({ error: "GOOGLE_PLACES_API_KEY not configured" }, { status: 500 })
  }

  const [googleResult, apolloResult, dncLeads] = await Promise.allSettled([
    searchGoogle(businessType, city, state, googleApiKey, pageToken),
    searchApollo(businessType, city, state),
    prisma.lead.findMany({ where: { doNotCall: true }, select: { phone: true } }),
  ])

  if (googleResult.status === "rejected") {
    return NextResponse.json({ error: googleResult.reason?.message ?? "Search failed" }, { status: 502 })
  }

  const { results: googleResults, nextPageToken } = googleResult.value
  const apolloResults = apolloResult.status === "fulfilled" ? apolloResult.value : []

  const dncPhones = new Set(
    dncLeads.status === "fulfilled"
      ? dncLeads.value
          .map((l) => (l.phone ? normalizePhone(l.phone) : ""))
          .filter((p) => p.length === 10)
      : []
  )

  const merged = deduplicateResults(googleResults, apolloResults).filter(
    (r) => !r.phone || !dncPhones.has(normalizePhone(r.phone))
  )

  merged.sort((a, b) => (b.closeabilityScore ?? 0) - (a.closeabilityScore ?? 0))

  return NextResponse.json({
    results: merged,
    query: `${businessType} in ${city}, ${state}`,
    nextPageToken,
    sources: {
      google: googleResults.length,
      apollo: apolloResults.length,
      merged: merged.length,
    },
  })
}
