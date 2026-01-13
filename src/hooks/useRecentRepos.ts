import { useState, useCallback, useEffect } from "react"

interface RecentRepo {
  repoName: string
  branch?: string
  analyzedAt: string
}

const STORAGE_KEY = "repo-analyzer-recent"
const MAX_RECENT = 10

export function useRecentRepos() {
  const [recent, setRecent] = useState<RecentRepo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentRepo[]
    } catch {
      return []
    }
  })

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        try {
          setRecent(JSON.parse(e.newValue || "[]") as RecentRepo[])
        } catch {
          setRecent([])
        }
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const addRecent = useCallback((repoName: string, branch?: string) => {
    setRecent((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((r) => r.repoName !== repoName)
      // Add to front with current timestamp
      const updated = [
        { repoName, branch, analyzedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearRecent = useCallback(() => {
    setRecent([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { recent, addRecent, clearRecent }
}

export type { RecentRepo }
