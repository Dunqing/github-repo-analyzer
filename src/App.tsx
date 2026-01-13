import {
  Loader2,
  Search,
  FolderTree,
  BarChart3,
  Github,
  File,
  Folder,
  FileType,
  HardDrive,
  RefreshCw,
  KeyRound,
  AlertTriangle,
  Package,
  X,
} from "lucide-react"
import { useState, useCallback, useEffect, useRef, useMemo } from "react"

import { BranchSelector } from "@/components/BranchSelector"
import { CopyTreeButton } from "@/components/CopyTreeButton"
import { DependencyStats } from "@/components/DependencyStats"
import { ExportButton } from "@/components/ExportButton"
import { FileSizeStats } from "@/components/FileSizeStats"
import { FileStats } from "@/components/FileStats"
import { FileTree, countMatchingFiles } from "@/components/FileTree"
import { FileTreeSearch } from "@/components/FileTreeSearch"
import { GitHubLink } from "@/components/GitHubLink"
import { PathBreadcrumb } from "@/components/PathBreadcrumb"
import { RateLimitIndicator } from "@/components/RateLimitIndicator"
import { RecentReposDropdown } from "@/components/RecentReposDropdown"
import { ShareButton } from "@/components/ShareButton"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDependencies } from "@/hooks/useDependencies"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { useRateLimit } from "@/hooks/useRateLimit"
import { useRecentRepos } from "@/hooks/useRecentRepos"
import { useRepoAnalyzer } from "@/hooks/useRepoAnalyzer"
import { treeToText } from "@/lib/treeToText"
import "@/index.css"

function App() {
  const [repoUrl, setRepoUrl] = useState("")
  const [treeFilter, setTreeFilter] = useState("")
  const repoInputRef = useRef<HTMLInputElement>(null)
  const treeSearchRef = useRef<HTMLInputElement>(null)
  const {
    analyze,
    analyzeWithRef,
    isAnalyzing,
    isNavigating,
    progress,
    result,
    error,
    branches,
    tags,
    selectedRef,
    defaultBranch,
    cacheInfo,
    token,
    setToken,
    currentPath,
    navigateToPath,
    navigateToRoot,
  } = useRepoAnalyzer()

  const { recent, addRecent, clearRecent } = useRecentRepos()
  const { rateLimit, isLoading: isLoadingRateLimit } = useRateLimit(token)
  const {
    dependencies,
    isLoading: isLoadingDeps,
    error: depsError,
  } = useDependencies({
    repoName: result?.repoName || "",
    branch: result?.ref || "",
    token,
    enabled: !!result?.repoName && !!result?.ref,
  })

  // Add to recent repos when analysis completes
  useEffect(() => {
    if (result?.repoName && !isAnalyzing) {
      addRecent(result.repoName, result.ref)
    }
  }, [result?.repoName, result?.ref, isAnalyzing, addRecent])

  // Handle selecting a recent repo
  const handleSelectRecent = useCallback(
    (repoName: string, branch?: string) => {
      setRepoUrl(repoName)
      setTreeFilter("")
      analyze(repoName, branch)
    },
    [analyze],
  )

  // Wrap navigation to also reset filter
  const handleNavigateToPath = useCallback(
    (path: string) => {
      setTreeFilter("")
      navigateToPath(path)
    },
    [navigateToPath],
  )

  const handleNavigateToRoot = useCallback(() => {
    setTreeFilter("")
    navigateToRoot()
  }, [navigateToRoot])
  const [showSettings, setShowSettings] = useState(false)

  // Handle URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const repoParam = params.get("repo")
    const branchParam = params.get("branch")
    const pathParam = params.get("path")

    if (repoParam) {
      setRepoUrl(repoParam)
      analyze(repoParam, branchParam || undefined)
      // Navigate to path after a short delay to let the initial fetch complete
      if (pathParam) {
        // Store in sessionStorage to apply after result loads
        sessionStorage.setItem("pending-path", pathParam)
      }
    }
  }, [analyze])

  // Apply pending path from URL after result loads
  useEffect(() => {
    if (result && !isAnalyzing) {
      const pendingPath = sessionStorage.getItem("pending-path")
      if (pendingPath) {
        sessionStorage.removeItem("pending-path")
        navigateToPath(pendingPath)
      }
    }
  }, [result, isAnalyzing, navigateToPath])

  // Update URL when analysis completes or path changes
  useEffect(() => {
    if (result?.repoName) {
      const url = new URL(window.location.href)
      url.searchParams.set("repo", result.repoName)
      if (result.ref) {
        url.searchParams.set("branch", result.ref)
      }
      if (currentPath) {
        url.searchParams.set("path", currentPath)
      } else {
        url.searchParams.delete("path")
      }
      window.history.replaceState({}, "", url.toString())
    }
  }, [result, currentPath])

  const handleAnalyze = useCallback(() => {
    if (!repoUrl.trim()) return
    setTreeFilter("")
    analyze(repoUrl)
  }, [analyze, repoUrl])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAnalyze()
    }
  }

  const handleBranchChange = useCallback(
    (ref: string) => {
      setTreeFilter("")
      analyzeWithRef(ref)
    },
    [analyzeWithRef],
  )

  const handleRefresh = useCallback(() => {
    if (!result?.repoName) return
    setTreeFilter("")
    analyze(result.repoName, result.ref, true) // forceRefresh = true
  }, [analyze, result])

  const matchingCount = result ? countMatchingFiles(result.tree, treeFilter) : 0

  // Keyboard shortcut handlers
  const keyboardHandlers = useMemo(
    () => ({
      onFocusSearch: () => {
        treeSearchRef.current?.focus()
      },
      onFocusRepoInput: () => {
        repoInputRef.current?.focus()
      },
      onAnalyze: () => {
        if (repoUrl.trim() && !isAnalyzing) {
          handleAnalyze()
        }
      },
      onCopyTree: async () => {
        if (result?.tree) {
          const text = treeToText(result.tree, "ascii")
          try {
            await navigator.clipboard.writeText(text)
          } catch (err) {
            console.error("Failed to copy tree:", err)
          }
        }
      },
      onClearSearch: () => {
        if (treeFilter) {
          setTreeFilter("")
        } else if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      },
    }),
    [result?.tree, repoUrl, isAnalyzing, handleAnalyze, treeFilter],
  )

  useKeyboardShortcuts(keyboardHandlers)

  // Format cache time as relative time
  const formatCacheTime = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ago`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-6 inline-flex items-center justify-center rounded-full bg-muted p-3">
            <Github className="h-8 w-8" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight">GitHub Repo Analyzer</h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Analyze the file structure and statistics of any GitHub repository
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Collapsible open={showSettings} onOpenChange={setShowSettings}>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={repoInputRef}
                    type="text"
                    placeholder="owner/repo or GitHub URL (press /)"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isAnalyzing}
                    className="pr-10 pl-10"
                  />
                  {repoUrl && !isAnalyzing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                      onClick={() => setRepoUrl("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <RecentReposDropdown
                  recent={recent}
                  onSelect={handleSelectRecent}
                  onClear={clearRecent}
                  disabled={isAnalyzing}
                />
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !repoUrl.trim()}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    title={token ? "Token configured" : "Add GitHub token"}
                  >
                    <KeyRound className={`h-4 w-4 ${token ? "text-green-500" : ""}`} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-start gap-2">
                    <KeyRound className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 space-y-2">
                      <Input
                        type="password"
                        placeholder="GitHub Personal Access Token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Optional: Add a token to access private repos or avoid rate limits. Token is
                        stored locally in your browser.
                      </p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isAnalyzing && (
          <Card className="mb-8">
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{progress || "Processing..."}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FolderTree className="h-5 w-5" />
                    {result.tree.name}
                    {result.ref && (
                      <Badge variant="outline" className="ml-2 font-mono text-xs">
                        {result.ref}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {cacheInfo.isCached && cacheInfo.cachedAt ? (
                      <>
                        <span className="text-muted-foreground">
                          Cached {formatCacheTime(cacheInfo.cachedAt)}
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                      </>
                    ) : null}
                    <span>Repository analysis complete</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <BranchSelector
                    branches={branches}
                    tags={tags}
                    selectedRef={selectedRef}
                    defaultBranch={defaultBranch}
                    onSelect={handleBranchChange}
                    disabled={isAnalyzing}
                  />
                  {cacheInfo.isCached && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={isAnalyzing}
                      title="Refresh (bypass cache)"
                    >
                      <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
                    </Button>
                  )}
                  {result.repoName && (
                    <>
                      <ExportButton result={result} />
                      <GitHubLink
                        repoName={result.repoName}
                        branch={result.ref}
                        path={currentPath}
                      />
                      <ShareButton
                        repoName={result.repoName}
                        branch={result.ref}
                        path={currentPath}
                      />
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="secondary" className="gap-1">
                  <File className="h-3 w-3" />
                  {result.stats.totalFiles} files
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Folder className="h-3 w-3" />
                  {result.stats.totalDirectories} directories
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <FileType className="h-3 w-3" />
                  {Object.keys(result.stats.extensionCounts).length} file types
                </Badge>
              </div>
              {result.truncated && (
                <div className="mt-3 flex items-start gap-2 rounded-md border border-yellow-500/50 bg-yellow-500/10 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">
                      Large repository - tree truncated
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      GitHub limits tree responses to ~100k entries. Double-click on folders to
                      navigate into subdirectories and see their full contents.
                    </p>
                  </div>
                </div>
              )}
            </CardHeader>
            <Separator />
            <CardContent>
              <Tabs defaultValue="tree">
                <TabsList>
                  <TabsTrigger value="tree" className="gap-2">
                    <FolderTree className="h-4 w-4" />
                    Tree
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Stats
                  </TabsTrigger>
                  <TabsTrigger value="size" className="gap-2">
                    <HardDrive className="h-4 w-4" />
                    Size
                  </TabsTrigger>
                  <TabsTrigger value="deps" className="gap-2">
                    <Package className="h-4 w-4" />
                    Deps
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="tree">
                  {result.repoName && (
                    <div className="mb-4">
                      <PathBreadcrumb
                        repoName={result.repoName}
                        currentPath={currentPath}
                        onNavigateToRoot={handleNavigateToRoot}
                        onNavigateToPath={handleNavigateToPath}
                        isLoading={isNavigating}
                      />
                    </div>
                  )}
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex-1">
                      <FileTreeSearch
                        ref={treeSearchRef}
                        value={treeFilter}
                        onChange={setTreeFilter}
                        matchCount={matchingCount}
                        totalCount={result.stats.totalFiles}
                      />
                    </div>
                    <CopyTreeButton tree={result.tree} />
                  </div>
                  <div className="-mx-2 max-h-[500px] overflow-y-auto px-2">
                    <FileTree
                      node={result.tree}
                      filter={treeFilter}
                      onFolderNavigate={handleNavigateToPath}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="stats">
                  <FileStats stats={result.stats} />
                </TabsContent>
                <TabsContent value="size">
                  <FileSizeStats stats={result.stats} tree={result.tree} />
                </TabsContent>
                <TabsContent value="deps">
                  <DependencyStats
                    dependencies={dependencies}
                    isLoading={isLoadingDeps}
                    error={depsError}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <RateLimitIndicator rateLimit={rateLimit} isLoading={isLoadingRateLimit} />
          <p className="text-xs text-muted-foreground">
            Uses the GitHub API to analyze repositories
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
