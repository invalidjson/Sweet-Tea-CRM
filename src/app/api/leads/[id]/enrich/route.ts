import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { analyzeWebsite } from "@/lib/enrichment/websiteAnalysis"
import { analyzeCompetition } from "@/lib/enrichment/competitionAnalysis"
import { calculateCloseabilityScore } from "@/lib/scoring/calculateCloseabilityScore"
import { enrichWithApollo } from "@/lib/sources/apollo"

function extractDomain(website: string): string | null {
  try {
    return new URL(website).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/leads/[id]/enrich">
) {
  const { id } = await ctx.params

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (lead.enrichStatus === "DONE") {
    return NextResponse.json({ message: "Already enriched" })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  try {
    const [websiteAnalysis, apolloData] = await Promise.all([
      lead.website ? analyzeWebsite(lead.website) : Promise.resolve(undefined),
      lead.website ? enrichWithApollo(extractDomain(lead.website) ?? "") : Promise.resolve(null),
    ])

    const competition =
      lead.primaryCategory && lead.city && lead.state && apiKey
        ? await analyzeCompetition(
            lead.primaryCategory,
            lead.city,
            lead.state,
            {
              googlePlaceId: lead.googlePlaceId ?? undefined,
              reviewCount: lead.googleReviewCount ?? undefined,
              hasWebsite: lead.hasWebsite,
            },
            apiKey
          )
        : undefined

    const scored = calculateCloseabilityScore({
      businessName: lead.businessName,
      category: lead.primaryCategory ?? undefined,
      city: lead.city,
      state: lead.state,
      hasWebsite: lead.hasWebsite,
      websiteAnalysis,
      googlePlace: {
        rating: lead.googleRating ?? undefined,
        reviewCount: lead.googleReviewCount ?? undefined,
        hasPhotos: lead.googleHasPhotos ?? undefined,
        hasBusinessHours: lead.googleHasHours ?? undefined,
        hasPhone: !!lead.phone,
        isOperational: true,
      },
      contact: {
        phone: lead.phone ?? undefined,
        email: lead.email ?? undefined,
      },
      competition,
    })

    await prisma.lead.update({
      where: { id },
      data: {
        closeabilityScore: scored.totalScore,
        scoreGrade: scored.grade,
        scoreLabel: scored.label,
        scoreConfidence: scored.confidence,
        scoreBreakdown: scored.breakdown as unknown as never,
        scoreReasons: scored.reasons,
        scoreWarnings: scored.warnings,
        enrichStatus: "DONE",
        enrichedAt: new Date(),
        ...(apolloData?.apolloOrgId ? { apolloOrgId: apolloData.apolloOrgId } : {}),
        ...(apolloData?.linkedinUrl ? { linkedinUrl: apolloData.linkedinUrl } : {}),
        ...(apolloData?.employeeCount ? { employeeCount: apolloData.employeeCount } : {}),
      },
    })

    return NextResponse.json({ success: true, score: scored.totalScore })
  } catch (err) {
    await prisma.lead.update({
      where: { id },
      data: { enrichStatus: "FAILED" },
    })
    const msg = err instanceof Error ? err.message : "Enrichment failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
