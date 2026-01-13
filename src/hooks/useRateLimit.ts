import useSWR from "swr"

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

async function fetcher(url: string, token?: string): Promise<GitHubRateLimitResponse> {
  const headers: HeadersInit = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })
  if (!response.ok) {
    throw new Error("Failed to fetch rate limit")
  }
  return response.json() as Promise<GitHubRateLimitResponse>
}

export function useRateLimit(token?: string) {
  const { data, error, isLoading, mutate } = useSWR<GitHubRateLimitResponse>(
    "https://api.github.com/rate_limit",
    (url) => fetcher(url, token),
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
