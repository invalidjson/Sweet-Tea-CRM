import { cn } from "@/lib/utils"
import type { ScoreGrade, ScoreConfidence } from "@/types"

interface ScoreBadgeProps {
  score: number
  grade: ScoreGrade
  label?: string
  confidence?: ScoreConfidence
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
  className?: string
}

const gradeColors: Record<ScoreGrade, string> = {
  A: "bg-emerald-500 text-white",
  B: "bg-primary text-primary-foreground",
  C: "bg-amber-400 text-amber-950",
  D: "bg-orange-300 text-orange-950",
  F: "bg-muted text-muted-foreground",
}

const sizes = {
  sm: { badge: "h-6 w-6 text-[12px]", score: "text-xs", label: "text-[12px]" },
  md: { badge: "h-8 w-8 text-xs", score: "text-sm", label: "text-[13px]" },
  lg: { badge: "h-10 w-10 text-sm", score: "text-base", label: "text-xs" },
}

export function ScoreBadge({
  score,
  grade,
  label,
  confidence,
  size = "md",
  showLabel = false,
  className,
}: ScoreBadgeProps) {
  const sz = sizes[size]

  return (
    <div className={cn("flex flex-col items-center gap-0.5", className)}>
      <div
        className={cn(
          "flex items-center justify-center rounded font-mono font-bold uppercase tracking-wider",
          gradeColors[grade],
          sz.badge,
        )}
        title={`${score}/100 — ${label ?? grade}${confidence ? ` (${confidence} confidence)` : ""}`}
      >
        {grade}
      </div>
      {showLabel && label && (
        <span className={cn("text-muted-foreground uppercase tracking-wider leading-none", sz.label)}>
          {label}
        </span>
      )}
      {confidence === "low" && (
        <span className="text-[11px] text-muted-foreground uppercase tracking-wider leading-none opacity-60">
          low conf
        </span>
      )}
    </div>
  )
}

interface ScoreBarProps {
  score: number
  grade: ScoreGrade
  className?: string
}

export function ScoreBar({ score, grade, className }: ScoreBarProps) {
  const barColor: Record<ScoreGrade, string> = {
    A: "bg-emerald-500",
    B: "bg-primary",
    C: "bg-amber-400",
    D: "bg-orange-300",
    F: "bg-muted-foreground/30",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor[grade])}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="font-mono text-xs text-muted-foreground w-6 text-right">{score}</span>
    </div>
  )
}
