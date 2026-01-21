import { useState, useCallback, useEffect, useRef, useMemo } from "react"
import AlertTriangle from "~icons/lucide/alert-triangle"
import BarChart3 from "~icons/lucide/bar-chart-3"
import File from "~icons/lucide/file"
import FileType from "~icons/lucide/file-type"
import Folder from "~icons/lucide/folder"
import FolderTree from "~icons/lucide/folder-tree"
import Github from "~icons/lucide/github"
import HardDrive from "~icons/lucide/hard-drive"
import KeyRound from "~icons/lucide/key-round"
import Loader2 from "~icons/lucide/loader-2"
import Package from "~icons/lucide/package"
import RefreshCw from "~icons/lucide/refresh-cw"
import Search from "~icons/lucide/search"
import X from "~icons/lucide/x"

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
    onBranchSelectorOpen,
    isLoadingRefs,
  } = useRepoAnalyzer()

  const { recent, addRecent, clearRecent } = useRecentRepos()
  const { rateLimit, isLoading: isLoadingRateLimit } = useRateLimit(token)

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

      <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-16">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-muted p-3 sm:mb-6">
            <Github className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight sm:mb-3 sm:text-3xl">
            GitHub Repo Analyzer
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">
            Explore file trees, visualize stats, and uncover dependencies in any GitHub repository
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <Collapsible open={showSettings} onOpenChange={setShowSettings}>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={repoInputRef}
                    type="text"
                    placeholder="owner/repo or GitHub URL"
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
                <div className="flex gap-2">
                  <RecentReposDropdown
                    recent={recent}
                    onSelect={handleSelectRecent}
                    onClear={clearRecent}
                    disabled={isAnalyzing}
                  />
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !repoUrl.trim()}
                    className="flex-1 sm:flex-none"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="sm:inline">Analyzing</span>
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
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base sm:text-lg">
                    <FolderTree className="h-5 w-5 shrink-0" />
                    <span className="truncate">{result.tree.name}</span>
                    {result.ref && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {result.ref}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
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
                  <div className="min-w-0 flex-1 sm:flex-none">
                    <BranchSelector
                      branches={branches}
                      tags={tags}
                      selectedRef={selectedRef}
                      defaultBranch={defaultBranch}
                      onSelect={handleBranchChange}
                      onOpenChange={onBranchSelectorOpen}
                      disabled={isAnalyzing}
                      isLoading={isLoadingRefs}
                    />
                  </div>
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
              <div className="flex flex-wrap gap-1.5 pt-2 sm:gap-2">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <File className="h-3 w-3" />
                  {result.stats.totalFiles} files
                </Badge>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Folder className="h-3 w-3" />
                  {result.stats.totalDirectories} dirs
                </Badge>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <FileType className="h-3 w-3" />
                  {Object.keys(result.stats.extensionCounts).length} types
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
                  <TabsTrigger value="tree" className="gap-1.5 px-2.5 sm:gap-2 sm:px-4">
                    <FolderTree className="h-4 w-4" />
                    <span className="hidden sm:inline">Tree</span>
                  </TabsTrigger>
                  <TabsTrigger value="stats" className="gap-1.5 px-2.5 sm:gap-2 sm:px-4">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Stats</span>
                  </TabsTrigger>
                  <TabsTrigger value="size" className="gap-1.5 px-2.5 sm:gap-2 sm:px-4">
                    <HardDrive className="h-4 w-4" />
                    <span className="hidden sm:inline">Size</span>
                  </TabsTrigger>
                  <TabsTrigger value="deps" className="gap-1.5 px-2.5 sm:gap-2 sm:px-4">
                    <Package className="h-4 w-4" />
                    <span className="hidden sm:inline">Deps</span>
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
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
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
                  <div className="-mx-2 max-h-[60vh] overflow-y-auto px-2 sm:max-h-125">
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
                    repoName={result.repoName || ""}
                    branch={result.ref || ""}
                    token={token}
                    tree={result.tree}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center gap-2 sm:mt-12">
          <RateLimitIndicator rateLimit={rateLimit} isLoading={isLoadingRateLimit} />
          <div className="flex items-center gap-2">
            <p className="text-center text-xs text-muted-foreground">
              Uses the GitHub API to analyze repositories
            </p>
            <span className="text-muted-foreground/50">•</span>
            <a
              href="https://github.com/Dunqing/github-repo-analyzer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-3.5 w-3.5" />
              Source
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
