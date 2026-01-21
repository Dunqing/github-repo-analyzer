import useSWR from "swr"

import { githubFetcher } from "@/lib/github-api"

export interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: Date
}

interface GitHubRateLimitResponse {
  resources: {
    core: {
      limit: number
      remaining: number
      reset: number
    }
  }
}

export function useRateLimit(token?: string) {
  const { data, error, isLoading, mutate } = useSWR<GitHubRateLimitResponse>(
    "https://api.github.com/rate_limit",
    (url) => githubFetcher(url, token),
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
      dedupingInterval: 10000, // Don't fetch more than once per 10 seconds
    },
  )

  const rateLimit: RateLimitInfo | null = data
    ? {
        remaining: data.resources.core.remaining,
        limit: data.resources.core.limit,
        resetAt: new Date(data.resources.core.reset * 1000),
      }
    : null

  return {
    rateLimit,
    isLoading,
    error,
    refresh: () => mutate(),
  }
}
