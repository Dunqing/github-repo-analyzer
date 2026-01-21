// GitHub API utilities and shared configuration

const TOKEN_STORAGE_KEY = "repo-analyzer-token"

/**
 * Get the stored GitHub token from localStorage
 */
export function getStoredToken(): string {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || ""
  } catch {
    return ""
  }
}

/**
 * Store or remove the GitHub token in localStorage
 */
export function storeToken(token: string): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch {
    // localStorage might be disabled
  }
}

/**
 * Shared fetcher for GitHub API requests with authentication support
 */
export async function githubFetcher<T>(url: string, token?: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(url, { headers })
  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    throw new Error(errorData?.message || `Request failed: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Fetch from GitHub API, returning null on error instead of throwing
 * Useful for optional/parallel fetches where failure is acceptable
 */
export async function githubFetcherSafe<T>(url: string, token?: string): Promise<T | null> {
  try {
    return await githubFetcher<T>(url, token)
  } catch {
    return null
  }
}

/**
 * Shared SWR configuration for GitHub API requests
 */
export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60 * 60 * 1000, // 1 hour
}
