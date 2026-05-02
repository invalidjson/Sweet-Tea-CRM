"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
    if (totalPages <= 7) return i + 1
    if (currentPage <= 4) return i + 1
    if (currentPage >= totalPages - 3) return totalPages - 6 + i
    return currentPage - 3 + i
  })

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 rounded-sm font-mono text-[12px]"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={12} />
      </Button>

      {pages[0] > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-sm font-mono text-[12px]"
            onClick={() => onPageChange(1)}
          >
            1
          </Button>
          {pages[0] > 2 && (
            <span className="text-[12px] font-mono text-muted-foreground px-1">…</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "ghost"}
          size="sm"
          className="h-7 w-7 p-0 rounded-sm font-mono text-[12px]"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="text-[12px] font-mono text-muted-foreground px-1">…</span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-sm font-mono text-[12px]"
            onClick={() => onPageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0 rounded-sm font-mono text-[12px]"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={12} />
      </Button>

      <span className="text-[12px] font-mono text-muted-foreground ml-2">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  )
}
