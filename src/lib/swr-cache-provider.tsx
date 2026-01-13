import type { ReactNode } from "react"

import { SWRConfig } from "swr"

const CACHE_KEY = "repo-analyzer-swr-cache"
const CACHE_VERSION = 1
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

interface CacheEntry {
  data: unknown
  timestamp: number
}

interface StoredCache {
  version: number
  entries: Record<string, CacheEntry>
}

function loadStoredCache(): StoredCache {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (!stored) return { version: CACHE_VERSION, entries: {} }

    const parsed: StoredCache = JSON.parse(stored)

    // Version mismatch - clear cache
    if (parsed.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_KEY)
      return { version: CACHE_VERSION, entries: {} }
    }

    // Filter out expired entries
    const now = Date.now()
    const validEntries: Record<string, CacheEntry> = {}
    for (const [key, entry] of Object.entries(parsed.entries)) {
      if (now - entry.timestamp <= CACHE_TTL) {
        validEntries[key] = entry
      }
    }

    return { version: CACHE_VERSION, entries: validEntries }
  } catch {
    return { version: CACHE_VERSION, entries: {} }
  }
}

function saveStoredCache(entries: Record<string, CacheEntry>): void {
  try {
    const stored: StoredCache = {
      version: CACHE_VERSION,
      entries,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(stored))
  } catch {
    // localStorage might be full or disabled
  }
}

// Get the timestamp for a specific cache key
export function getCacheTimestamp(key: string): Date | null {
  try {
    const stored = localStorage.getItem(CACHE_KEY)
    if (!stored) return null

    const parsed: StoredCache = JSON.parse(stored)
    const entry = parsed.entries[key]

    if (entry) {
      return new Date(entry.timestamp)
    }
    return null
  } catch {
    return null
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Ignore errors
  }
}

// Create a localStorage-backed Map for SWR cache
function createLocalStorageCache() {
  const stored = loadStoredCache()
  const entries = stored.entries

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = new Map<string, any>()

  // Load from localStorage
  for (const [key, entry] of Object.entries(entries)) {
    map.set(key, entry.data)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cache: Map<string, any> = {
    get: (key: string) => map.get(key),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set: (key: string, value: any) => {
      map.set(key, value)
      // Only persist GitHub API responses
      if (key.startsWith("https://api.github.com/")) {
        entries[key] = { data: value, timestamp: Date.now() }
        saveStoredCache(entries)
      }
      return map
    },
    delete: (key: string) => {
      const result = map.delete(key)
      if (key in entries) {
        delete entries[key]
        saveStoredCache(entries)
      }
      return result
    },
    keys: () => map.keys(),
    has: (key: string) => map.has(key),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forEach: (fn: (value: any, key: string, m: Map<string, any>) => void) => map.forEach(fn),
    get size() {
      return map.size
    },
    clear: () => {
      map.clear()
      clearCache()
    },
    entries: () => map.entries(),
    values: () => map.values(),
    [Symbol.iterator]: () => map[Symbol.iterator](),
    [Symbol.toStringTag]: "Map",
  }

  return () => cache
}

interface SWRCacheProviderProps {
  children: ReactNode
}

export function SWRCacheProvider({ children }: SWRCacheProviderProps) {
  return <SWRConfig value={{ provider: createLocalStorageCache() }}>{children}</SWRConfig>
}
