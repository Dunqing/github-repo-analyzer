import { Activity } from "lucide-react"

import type { RateLimitInfo } from "@/hooks/useRateLimit"

import { Badge } from "@/components/ui/badge"

interface RateLimitIndicatorProps {
  rateLimit: RateLimitInfo | null
  isLoading?: boolean
}

function formatResetTime(resetAt: Date): string {
  const now = new Date()
  const diffMs = resetAt.getTime() - now.getTime()
  const diffMins = Math.ceil(diffMs / 60000)

  if (diffMins <= 0) return "resetting..."
  if (diffMins === 1) return "resets in 1m"
  if (diffMins < 60) return `resets in ${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  const remainingMins = diffMins % 60
  return `resets in ${diffHours}h ${remainingMins}m`
}

export function RateLimitIndicator({ rateLimit, isLoading }: RateLimitIndicatorProps) {
  if (isLoading || !rateLimit) {
    return null
  }

  const isLow = rateLimit.remaining < 10
  const isExhausted = rateLimit.remaining === 0

  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
  if (isExhausted) {
    variant = "destructive"
  } else if (isLow) {
    variant = "outline"
  }

  return (
    <Badge
      variant={variant}
      className={`gap-1 font-mono text-xs ${isLow && !isExhausted ? "border-yellow-500 text-yellow-600 dark:text-yellow-500" : ""}`}
      title={`GitHub API rate limit: ${rateLimit.remaining}/${rateLimit.limit} remaining. ${formatResetTime(rateLimit.resetAt)}`}
    >
      <Activity className="h-3 w-3" />
      {rateLimit.remaining}/{rateLimit.limit}
      {(isLow || isExhausted) && (
        <span className="ml-1 text-[10px] text-muted-foreground">
          ({formatResetTime(rateLimit.resetAt)})
        </span>
      )}
    </Badge>
  )
}
