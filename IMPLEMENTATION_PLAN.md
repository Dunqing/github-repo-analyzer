# Implementation Plan: New Features

This document outlines the implementation plan for features beyond the current roadmap.

---

## Priority Matrix

| Feature              | Value  | Effort | Priority |
| -------------------- | ------ | ------ | -------- |
| Download as JSON     | High   | Low    | P0       |
| Recent Repos         | High   | Low    | P0       |
| Open in GitHub       | Medium | Low    | P1       |
| Rate Limit Indicator | Medium | Low    | P1       |
| Keyboard Shortcuts   | Medium | Medium | P2       |
| Compare Branches     | High   | Medium | P2       |
| Dependency Detection | High   | Medium | P2       |

---

## Stage 1: Quick Wins (P0)

### 1.1 Download as JSON

**Goal**: Export analysis data as downloadable JSON file

**Files to modify**:

- `src/components/ExportButton.tsx` (new)
- `src/App.tsx` (add button)

**Implementation**:

```typescript
// ExportButton.tsx
interface ExportData {
  exportedAt: string
  repoName: string
  ref: string
  currentPath: string
  tree: FileNode
  stats: FileStats
}

function handleExport(result: AnalysisResult) {
  const data: ExportData = {
    exportedAt: new Date().toISOString(),
    repoName: result.repoName,
    ref: result.ref,
    currentPath: result.currentPath || "",
    tree: result.tree,
    stats: result.stats,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${result.repoName.replace("/", "-")}-analysis.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

**UI Location**: Add "Export" button next to Share button in card header

**Tests**:

- [ ] Downloads valid JSON file
- [ ] Filename includes repo name
- [ ] All data fields present

**Status**: Complete

---

### 1.2 Recent Repos Dropdown

**Goal**: Quick access to last 10 analyzed repositories

**Files to modify**:

- `src/hooks/useRecentRepos.ts` (new)
- `src/components/RecentReposDropdown.tsx` (new)
- `src/App.tsx` (integrate dropdown)

**Data Structure**:

```typescript
interface RecentRepo {
  repoName: string // "facebook/react"
  branch?: string // "main"
  analyzedAt: string // ISO timestamp
}

const STORAGE_KEY = "repo-analyzer-recent"
const MAX_RECENT = 10
```

**Implementation**:

```typescript
// useRecentRepos.ts
export function useRecentRepos() {
  const [recent, setRecent] = useState<RecentRepo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    } catch {
      return []
    }
  })

  const addRecent = useCallback((repo: RecentRepo) => {
    setRecent((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((r) => r.repoName !== repo.repoName)
      // Add to front, limit to MAX
      const updated = [repo, ...filtered].slice(0, MAX_RECENT)
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
```

**UI Design**:

- Clock icon button next to search input
- Dropdown shows recent repos with relative time ("2h ago")
- Click to auto-fill and analyze
- "Clear history" option at bottom

**Tests**:

- [ ] Persists across page refresh
- [ ] Max 10 items stored
- [ ] Duplicates are updated, not added
- [ ] Clear history works

**Status**: Complete

---

## Stage 2: Quick Enhancements (P1)

### 2.1 Open in GitHub Button

**Goal**: Quick link to view repo/current path on GitHub

**Files to modify**:

- `src/components/GitHubLink.tsx` (new)
- `src/App.tsx` (add button)

**Implementation**:

```typescript
interface GitHubLinkProps {
  repoName: string
  branch?: string
  path?: string
}

export function GitHubLink({ repoName, branch, path }: GitHubLinkProps) {
  const url = useMemo(() => {
    let base = `https://github.com/${repoName}`
    if (branch && path) {
      base += `/tree/${branch}/${path}`
    } else if (branch) {
      base += `/tree/${branch}`
    }
    return base
  }, [repoName, branch, path])

  return (
    <Button variant="outline" size="sm" asChild>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-3.5 w-3.5" />
        GitHub
      </a>
    </Button>
  )
}
```

**UI Location**: Next to Share button

**Tests**:

- [ ] Correct URL for root
- [ ] Correct URL with branch
- [ ] Correct URL with path
- [ ] Opens in new tab

**Status**: Complete

---

### 2.2 Rate Limit Indicator

**Goal**: Show remaining GitHub API calls

**Files to modify**:

- `src/hooks/useRepoAnalyzer.ts` (capture headers)
- `src/components/RateLimitIndicator.tsx` (new)
- `src/App.tsx` (display indicator)

**Data Structure**:

```typescript
interface RateLimitInfo {
  remaining: number
  limit: number
  resetAt: Date
}
```

**Implementation**:

```typescript
// Modify fetcher to capture rate limit headers
async function fetcher<T>(
  url: string,
  token?: string,
): Promise<{ data: T; rateLimit: RateLimitInfo }> {
  const response = await fetch(url, { headers })

  const rateLimit: RateLimitInfo = {
    remaining: parseInt(response.headers.get("X-RateLimit-Remaining") || "0"),
    limit: parseInt(response.headers.get("X-RateLimit-Limit") || "60"),
    resetAt: new Date(parseInt(response.headers.get("X-RateLimit-Reset") || "0") * 1000),
  }

  const data = await response.json()
  return { data, rateLimit }
}
```

**UI Design**:

- Small badge in footer or header
- Shows "45/60" format
- Yellow warning when < 10 remaining
- Red when exhausted
- Tooltip shows reset time

**Tests**:

- [ ] Displays correct count
- [ ] Updates after each request
- [ ] Warning states work
- [ ] Shows reset time on hover

**Status**: Complete

---

## Stage 3: Medium Features (P2)

### 3.1 Keyboard Shortcuts

**Goal**: Improve navigation efficiency with keyboard

**Files to modify**:

- `src/hooks/useKeyboardShortcuts.ts` (new)
- `src/App.tsx` (integrate)

**Shortcuts**:
| Key | Action |
|-----|--------|
| `Ctrl/Cmd + K` | Focus search input |
| `Escape` | Clear search / close dropdowns |
| `Ctrl/Cmd + Enter` | Analyze repo |
| `/` | Focus repo input |
| `Ctrl/Cmd + Shift + C` | Copy tree |

**Implementation**:

```typescript
export function useKeyboardShortcuts(handlers: {
  onFocusSearch?: () => void
  onFocusRepoInput?: () => void
  onAnalyze?: () => void
  onCopyTree?: () => void
  onClearSearch?: () => void
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey

      if (isMod && e.key === "k") {
        e.preventDefault()
        handlers.onFocusSearch?.()
      }

      if (e.key === "Escape") {
        handlers.onClearSearch?.()
      }

      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault()
        handlers.onFocusRepoInput?.()
      }

      if (isMod && e.key === "Enter") {
        e.preventDefault()
        handlers.onAnalyze?.()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handlers])
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName
  return tag === "INPUT" || tag === "TEXTAREA"
}
```

**UI**: Show shortcuts in tooltips and help text

**Tests**:

- [ ] All shortcuts work
- [ ] Don't interfere with typing
- [ ] Work across browsers

**Status**: Complete

---

### 3.2 Compare Branches

**Goal**: Compare file structure between two branches

**Files to modify**:

- `src/components/BranchCompare.tsx` (new)
- `src/hooks/useBranchCompare.ts` (new)
- `src/App.tsx` (add Compare tab)

**Data Structure**:

```typescript
interface BranchDiff {
  added: string[] // Files only in branch B
  removed: string[] // Files only in branch A
  common: string[] // Files in both
  stats: {
    addedCount: number
    removedCount: number
    commonCount: number
  }
}
```

**Implementation**:

```typescript
// useBranchCompare.ts
export function useBranchCompare(repoName: string, branchA: string, branchB: string) {
  // Fetch both trees
  const { data: treeA } = useSWR(/* branchA tree URL */)
  const { data: treeB } = useSWR(/* branchB tree URL */)

  const diff = useMemo(() => {
    if (!treeA || !treeB) return null

    const pathsA = new Set(treeA.tree.map((t) => t.path))
    const pathsB = new Set(treeB.tree.map((t) => t.path))

    return {
      added: [...pathsB].filter((p) => !pathsA.has(p)),
      removed: [...pathsA].filter((p) => !pathsB.has(p)),
      common: [...pathsA].filter((p) => pathsB.has(p)),
    }
  }, [treeA, treeB])

  return { diff, isLoading: !treeA || !treeB }
}
```

**UI Design**:

- "Compare" button that opens modal/drawer
- Two branch selectors side by side
- Three columns: Added (green), Removed (red), Common (gray)
- Summary stats at top

**Tests**:

- [ ] Correctly identifies added files
- [ ] Correctly identifies removed files
- [ ] Handles empty branches
- [ ] Performance with large repos

**Status**: Complete

---

### 3.3 Dependency Detection

**Goal**: Parse and display project dependencies

**Files to modify**:

- `src/lib/dependencyParser.ts` (new)
- `src/components/DependencyStats.tsx` (new)
- `src/hooks/useRepoAnalyzer.ts` (fetch dependency files)

**Supported Files**:
| File | Ecosystem |
|------|-----------|
| `package.json` | Node.js |
| `requirements.txt` | Python |
| `Cargo.toml` | Rust |
| `go.mod` | Go |
| `Gemfile` | Ruby |
| `pom.xml` | Java/Maven |
| `build.gradle` | Java/Gradle |
| `pubspec.yaml` | Dart/Flutter |

**Implementation**:

```typescript
// dependencyParser.ts
interface DependencyInfo {
  ecosystem: string
  file: string
  dependencies: { name: string; version?: string }[]
  devDependencies: { name: string; version?: string }[]
}

async function fetchDependencies(
  repoName: string,
  branch: string,
  token?: string,
): Promise<DependencyInfo[]> {
  const files = [
    { path: "package.json", parser: parsePackageJson },
    { path: "requirements.txt", parser: parseRequirements },
    { path: "Cargo.toml", parser: parseCargoToml },
    // ... more
  ]

  const results: DependencyInfo[] = []

  for (const { path, parser } of files) {
    try {
      const content = await fetchFileContent(repoName, branch, path, token)
      if (content) {
        results.push(parser(content))
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  return results
}

function parsePackageJson(content: string): DependencyInfo {
  const pkg = JSON.parse(content)
  return {
    ecosystem: "npm",
    file: "package.json",
    dependencies: Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
      name,
      version: version as string,
    })),
    devDependencies: Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
      name,
      version: version as string,
    })),
  }
}
```

**UI Design**:

- New "Dependencies" tab or section in Stats
- Group by ecosystem
- Show counts: "42 dependencies, 18 dev dependencies"
- Expandable list with versions

**Caveats**:

- Requires additional API calls to fetch file contents
- May hit rate limits for repos with many dependency files
- Consider caching aggressively

**Tests**:

- [ ] Parses package.json correctly
- [ ] Parses requirements.txt correctly
- [ ] Handles missing files gracefully
- [ ] Shows "No dependencies found" appropriately

**Status**: Complete

---

## Implementation Order

### Week 1: Quick Wins

1. **Day 1-2**: Export JSON (1.1)
2. **Day 3-4**: Recent Repos (1.2)
3. **Day 5**: Testing & Polish

### Week 2: Enhancements

1. **Day 1**: Open in GitHub (2.1)
2. **Day 2-3**: Rate Limit Indicator (2.2)
3. **Day 4-5**: Testing & Polish

### Week 3: Medium Features

1. **Day 1-2**: Keyboard Shortcuts (3.1)
2. **Day 3-5**: Compare Branches (3.2)

### Week 4: Dependency Detection

1. **Day 1-3**: Dependency Detection (3.3)
2. **Day 4-5**: Testing & Polish

---

## Testing Strategy

### Unit Tests

- Parser functions (dependency parsers)
- URL builders (GitHub links)
- Data transformations

### Integration Tests

- Recent repos persistence
- Keyboard shortcuts
- Export functionality

### Manual Testing Checklist

- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on mobile viewport
- [ ] Dark/light mode compatible
- [ ] No console errors
- [ ] Accessible (keyboard nav, screen reader)

---

## Notes

### API Considerations

- Dependency detection requires `GET /repos/{owner}/{repo}/contents/{path}`
- Each file fetch = 1 API call
- Consider batching or lazy loading

### Storage Limits

- localStorage: ~5MB
- Recent repos: negligible (~1KB for 10 repos)
- Consider cleanup for large cached data

### Browser Support

- Clipboard API: Modern browsers only
- Keyboard shortcuts: Test modifier keys across OS
- File download: Blob API widely supported
