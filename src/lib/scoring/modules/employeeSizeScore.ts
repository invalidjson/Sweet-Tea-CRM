import type { LeadScoringInput, ScoreModuleResult } from "../types"

// Sweet spot: 10–150 employees.
// Big enough to have real operational complexity, small enough to lack an in-house dev team.

export function employeeSizeScore(input: LeadScoringInput): ScoreModuleResult {
  const reasons: string[] = []
  const warnings: string[] = []

  const employees = input.employeeCount

  if (employees === undefined || employees === null) {
    warnings.push("Employee count unknown — size fit unverified")
    return { score: 50, reasons, warnings }
  }

  if (employees < 5) {
    warnings.push("Very small team — may lack budget for custom software")
    return { score: 15, reasons, warnings }
  }
  if (employees < 10) {
    warnings.push("Small team — borderline size for custom software investment")
    return { score: 35, reasons, warnings }
  }
  if (employees <= 50) {
    reasons.push(`${employees} employees — strong fit for custom internal tools without in-house dev`)
    return { score: 85, reasons, warnings }
  }
  if (employees <= 150) {
    reasons.push(`${employees} employees — solid fit: enough complexity, unlikely to have dedicated dev team`)
    return { score: 90, reasons, warnings }
  }
  if (employees <= 300) {
    warnings.push(`${employees} employees — may already have IT staff or use enterprise software`)
    return { score: 55, reasons, warnings }
  }
  if (employees <= 500) {
    warnings.push(`${employees} employees — likely has in-house IT or dev capacity`)
    return { score: 25, reasons, warnings }
  }

  warnings.push(`${employees} employees — likely has dedicated dev team`)
  return { score: 10, reasons, warnings }
}
