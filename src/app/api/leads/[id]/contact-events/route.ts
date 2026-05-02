import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const { type, notes, outcome, nextFollowUpAt } = await request.json()

  if (!type) {
    return NextResponse.json({ error: "Type required" }, { status: 400 })
  }

  const event = await prisma.contactEvent.create({
    data: {
      leadId: id,
      type,
      notes: notes?.trim() || null,
      outcome: outcome?.trim() || null,
    },
  })

  await prisma.lead.update({
    where: { id },
    data: {
      lastContactedAt: new Date(),
      status: "CONTACTED",
      ...(nextFollowUpAt ? { nextFollowUpAt: new Date(nextFollowUpAt) } : {}),
    },
  })

  return NextResponse.json(
    {
      event: {
        ...event,
        createdAt: event.createdAt.toISOString(),
      },
    },
    { status: 201 }
  )
}
