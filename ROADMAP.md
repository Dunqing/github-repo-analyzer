# Roadmap

Planned features for GitHub Repo Analyzer.

---

## Development Guidelines

### One Commit, One Feature

Each feature should be implemented in a single, atomic commit:

- **Scope**: One feature = one commit. No mixing unrelated changes.
- **Message**: Clear commit message describing what the feature does.
- **Testable**: Each commit should leave the app in a working state.
- **Reviewable**: Small, focused changes are easier to review and revert if needed.

Example:

```
feat: add branch selector dropdown

- Add branch selector component with shadcn Select
- Fetch branches via GitHub API
- Update useRepoAnalyzer to accept branch parameter
```

---

## Phase 1: Core Enhancements

### 1.1 Branch/Tag Selector

**Priority**: High

Allow users to analyze specific branches or tags instead of just the default branch.

**Design**:

- Add a Select dropdown next to the analyze button (appears after first analysis)
- Show branches and tags in separate groups
- Default selection: repository's default branch

**Implementation**:

- Fetch branches: `GET /repos/{owner}/{repo}/branches`
- Fetch tags: `GET /repos/{owner}/{repo}/tags`
- Update tree fetch to use selected ref: `/git/trees/{ref}?recursive=1`
- Store selected branch in state, reset when repo changes

**Components**:

- `src/components/BranchSelector.tsx` (new)
- `src/hooks/useRepoAnalyzer.ts` (modify)

---

### 1.2 Search/Filter Files

**Priority**: High

Search and filter files in the tree view by name or extension.

**Design**:

- Add search input above the file tree
- Real-time filtering as user types
- Highlight matching text in results
- Show "X of Y files" count

**Implementation**:

- Add search state to FileTree or lift to parent
- Filter recursively through tree nodes
- Use fuzzy matching or simple `includes()` for MVP
- Preserve folder structure (show parent folders of matches)

**Components**:

- `src/components/FileTreeSearch.tsx` (new)
- `src/components/FileTree.tsx` (modify to accept filter)

---

### 1.3 Share via URL

**Priority**: High

Encode repository in URL for easy sharing.

**Design**:

- URL format: `/?repo=facebook/react` or `/?repo=facebook/react&branch=main`
- Auto-analyze on page load if repo param exists
- Update URL when analysis completes (without page reload)

**Implementation**:

- Read `URLSearchParams` on mount
- Use `history.replaceState` to update URL after analysis
- Add "Copy Link" button to results header

**Components**:

- `src/App.tsx` (modify)
- `src/components/ShareButton.tsx` (new, optional)

---

### 1.4 File Size Statistics

**Priority**: Medium

Show file sizes and identify largest files.

**Design**:

- Add "Size" tab alongside Tree and Stats
- Show: total size, average file size, largest files (top 10)
- Size breakdown by extension (bar chart)

**Implementation**:

- GitHub tree API includes `size` for blobs
- Already available in the API response, just not displayed
- Format sizes: bytes, KB, MB as appropriate

**Components**:

- `src/components/FileSizeStats.tsx` (new)
- `src/types/index.ts` (add size to FileNode if needed)

---

### 1.5 Copy Tree as Text

**Priority**: Medium

Export file tree as ASCII or markdown for documentation.

**Design**:

- "Copy" button in tree tab header
- Format options: ASCII tree, markdown list, or plain paths
- Copy to clipboard with toast notification

**Implementation**:

- Recursive function to build ASCII tree string
- Use `navigator.clipboard.writeText()`
- Add toast/sonner for feedback

**Example output**:

```
react/
├── packages/
│   ├── react/
│   │   ├── src/
│   │   └── package.json
│   └── react-dom/
└── README.md
```

**Components**:

- `src/components/CopyTreeButton.tsx` (new)
- `src/lib/treeToText.ts` (new utility)

---

## Phase 2: Visualizations

### 2.1 Pie/Donut Chart

**Priority**: Medium

Visual breakdown of file types distribution.

**Design**:

- Donut chart showing top 8-10 extensions
- Group remaining as "Other"
- Interactive: hover to see count/percentage
- Click to filter tree by that type

**Implementation**:

- Use Recharts (lightweight) or chart.js
- Data already available from `extensionCounts`

**Dependencies**: `recharts` or similar

**Components**:

- `src/components/FileTypeChart.tsx` (new)

---

### 2.2 Treemap Visualization

**Priority**: Low

Size-based visual representation of repository structure.

**Design**:

- Nested rectangles representing folders and files
- Size = file size, color = file type
- Click to zoom into folders

**Implementation**:

- Use d3-treemap or recharts Treemap
- Requires file sizes (from 1.4)

**Dependencies**: `recharts` or `d3`

---

### 2.3 Lines of Code Estimate

**Priority**: Low

Rough LOC count by language/extension.

**Design**:

- Show estimated LOC per language
- Display in stats tab with caveat "estimate based on file sizes"

**Implementation**:

- Estimate: avg bytes per line varies by language (~40-60 bytes)
- Use file sizes and known averages per extension
- This is a rough estimate only (can't read file contents via API without fetching each file)

**Note**: Accurate LOC requires fetching file contents, which is rate-limited. Consider this a "rough estimate" feature.

---

## Phase 3: Comparison Features

### 3.1 Compare Two Repos

**Priority**: Low

Side-by-side structure comparison of two repositories.

**Design**:

- Split view with two repo inputs
- Highlight: unique files, common files, different extensions
- Stats comparison table

**Implementation**:

- Two parallel analyses
- Diff algorithm for tree comparison
- May need significant UI rework

---

### 3.2 Compare Branches

**Priority**: Low

Diff file structure between two branches of the same repo.

**Design**:

- Select two branches from same repo
- Show: added files, removed files, common files
- Summary of changes

**Implementation**:

- Fetch trees for both branches
- Set difference operations on file paths

---

## Phase 4: Export & Integration

### 4.1 Download as JSON

**Priority**: Low

Export analysis data for external use.

**Design**:

- "Export" button in results
- JSON includes: tree structure, stats, metadata

**Implementation**:

- `JSON.stringify(result)`
- Create blob and trigger download
- Include timestamp and repo info in export

---

### 4.2 GitHub OAuth (Private Repos)

**Priority**: Low

Access private repositories with user authentication.

**Design**:

- "Sign in with GitHub" button
- Show user avatar when signed in
- Private repos accessible after auth

**Implementation**:

- GitHub OAuth App or GitHub App
- Store token in memory (not localStorage for security)
- Add token to API requests

**Security considerations**:

- Use minimal scopes (`repo` for private access)
- Clear token on sign out
- Consider token expiration

---

## Phase 5: Performance

### 5.1 Result Caching

**Priority**: Medium

Cache analysis results to avoid redundant API calls.

**Design**:

- Cache by `owner/repo@branch`
- Show "cached" indicator with timestamp
- "Refresh" button to bypass cache

**Implementation**:

- Store in localStorage with TTL (e.g., 1 hour)
- Cache structure: `{ data, timestamp, ttl }`
- Check cache before API call

**Storage limits**: localStorage ~5MB, may need LRU eviction for heavy users

---

### 5.2 Large Repo Handling

**Priority**: Medium

Better handling of repositories with truncated trees.

**Design**:

- Show warning when tree is truncated (>100k files)
- Option to analyze specific subdirectory only
- Progressive loading indicator

**Implementation**:

- GitHub API truncates at 100k entries
- For truncated repos: fetch tree non-recursively, lazy-load subdirectories
- Add "path" parameter to analyze subdirectory

---

## Completed

### Phase 1: Core Enhancements

- [x] 1.1 Branch/Tag Selector
- [x] 1.2 Search/Filter Files
- [x] 1.3 Share via URL
- [x] 1.4 File Size Statistics
- [x] 1.5 Copy Tree as Text

### Phase 2: Visualizations

- [x] 2.1 Pie/Donut Chart
- [x] 2.3 Lines of Code Estimate

### Phase 5: Performance

- [x] 5.1 Result Caching
- [x] 5.2 Large Repo Handling (with folder navigation)

### Foundation

- [x] Basic repo analysis (file tree, stats)
- [x] VS Code file icons
- [x] Short format support (`owner/repo`)
- [x] shadcn/ui components
- [x] Light/dark/system theme toggle

---

## Notes

### API Rate Limits

- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour
- Consider adding rate limit indicator in UI

### Tech Stack

- React 19 + TypeScript
- Vite 8 (beta)
- Tailwind CSS v4
- shadcn/ui components
- GitHub REST API

### File Structure

```
src/
├── components/
│   ├── ui/          # shadcn components
│   ├── FileTree.tsx
│   ├── FileStats.tsx
│   ├── FileIcon.tsx
│   └── ...
├── hooks/
│   └── useRepoAnalyzer.ts
├── lib/
│   └── utils.ts
├── types/
│   └── index.ts
└── App.tsx
```
