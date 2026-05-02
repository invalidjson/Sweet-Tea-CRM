import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function serializeLead(lead: Record<string, unknown>) {
  return {
    ...lead,
    createdAt: (lead.createdAt as Date).toISOString(),
    updatedAt: (lead.updatedAt as Date).toISOString(),
    enrichedAt: lead.enrichedAt ? (lead.enrichedAt as Date).toISOString() : null,
    lastContactedAt: lead.lastContactedAt ? (lead.lastContactedAt as Date).toISOString() : null,
    nextFollowUpAt: lead.nextFollowUpAt ? (lead.nextFollowUpAt as Date).toISOString() : null,
    contactEvents: ((lead.contactEvents as Array<Record<string, unknown>>) ?? []).map((e) => ({
      ...e,
      createdAt: (e.createdAt as Date).toISOString(),
    })),
    notes: ((lead.notes as Array<Record<string, unknown>>) ?? []).map((n) => ({
      ...n,
      createdAt: (n.createdAt as Date).toISOString(),
      updatedAt: (n.updatedAt as Date).toISOString(),
    })),
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/leads/[id]">
) {
  const { id } = await ctx.params
  const body = await req.json()

  const allowedFields = ["status", "nextFollowUpAt", "doNotCall"] as const
  type AllowedField = (typeof allowedFields)[number]
  const update: Partial<Record<AllowedField, unknown>> = {}

  for (const field of allowedFields) {
    if (field in body) update[field] = body[field]
  }

  if ("doNotCall" in body && body.doNotCall === true) {
    update.doNotCall = true
    ;(update as Record<string, unknown>).doNotCallAt = new Date()
    ;(update as Record<string, unknown>).status = "NOT_INTERESTED"
  }

  const lead = await prisma.lead.update({ where: { id }, data: update as never })
  return NextResponse.json({ id: lead.id })
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/leads/[id]">
) {
  const { id } = await ctx.params

  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { contactEvents: true, notes: true },
  })

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({ lead: serializeLead(lead as unknown as Record<string, unknown>) })
}
