import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { SearchResult } from "@/types"

function serializeLead(lead: Record<string, unknown>) {
  return {
    ...lead,
    createdAt: (lead.createdAt as Date).toISOString(),
    updatedAt: (lead.updatedAt as Date).toISOString(),
    enrichedAt: lead.enrichedAt ? (lead.enrichedAt as Date).toISOString() : null,
    lastContactedAt: lead.lastContactedAt ? (lead.lastContactedAt as Date).toISOString() : null,
    nextFollowUpAt: lead.nextFollowUpAt ? (lead.nextFollowUpAt as Date).toISOString() : null,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status") ?? undefined
  const noWebsite = searchParams.get("noWebsite") === "1"

  const leads = await prisma.lead.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(noWebsite ? { hasWebsite: false } : {}),
    },
    include: { contactEvents: true, notes: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ leads: leads.map(serializeLead) })
}

export async function POST(request: NextRequest) {
  const body: SearchResult = await request.json()

  const commonCreate = {
    businessName: body.businessName,
    address: body.address,
    city: body.city,
    state: body.state,
    zip: body.zip,
    phone: body.phone,
    email: body.email,
    website: body.website,
    hasWebsite: body.hasWebsite,
    primaryCategory: body.primaryCategory,
    googleRating: body.googleRating,
    googleReviewCount: body.googleReviewCount,
    googleHasPhotos: body.googleHasPhotos,
    googleHasHours: body.googleHasHours,
    apolloOrgId: body.apolloOrgId,
    linkedinUrl: body.linkedinUrl,
    employeeCount: body.employeeCount,
    closeabilityScore: body.closeabilityScore,
    scoreGrade: body.scoreGrade,
    scoreLabel: body.scoreLabel,
    scoreConfidence: body.scoreConfidence,
    scoreBreakdown: body.scoreBreakdown ? (body.scoreBreakdown as unknown as never) : undefined,
    scoreReasons: body.scoreReasons ?? [],
    scoreWarnings: body.scoreWarnings ?? [],
    status: "NEW" as const,
    enrichStatus: "PENDING" as const,
  }

  let lead
  if (body.source === "apollo" && body.apolloOrgId) {
    lead = await prisma.lead.upsert({
      where: { apolloOrgId: body.apolloOrgId },
      update: {},
      create: commonCreate,
    })
  } else {
    lead = await prisma.lead.upsert({
      where: { googlePlaceId: body.externalId },
      update: {},
      create: { googlePlaceId: body.externalId, ...commonCreate },
    })
  }

  return NextResponse.json({ id: lead.id }, { status: 201 })
}
