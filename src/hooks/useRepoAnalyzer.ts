import { useState, useCallback, useMemo } from "react"
import useSWR, { mutate } from "swr"

import { githubFetcher, getStoredToken, storeToken, swrConfig } from "@/lib/github-api"
import { getCacheTimestamp, clearCache } from "@/lib/swr-cache-provider"

import type { FileNode, FileStats, AnalysisResult } from "../types"

const IGNORED_DIRS = new Set([
  ".git",
  "node_modules",
  ".next",
  "dist",
  "build",
  ".cache",
  "__pycache__",
  ".venv",
  "venv",
])

interface GitHubTreeItem {
  path: string
  mode: string
  type: "blob" | "tree"
  sha: string
  size?: number
}

interface GitHubTreeResponse {
  sha: string
  tree: GitHubTreeItem[]
  truncated: boolean
}

export interface GitHubBranch {
  name: string
  protected: boolean
}

export interface GitHubTag {
  name: string
}

interface RepoData {
  default_branch: string
  name: string
}

function buildFileTree(items: GitHubTreeItem[], repoName: string): FileNode {
  const root: FileNode = {
    name: repoName,
    path: "",
    type: "directory",
    children: [],
    fileCount: 0,
    directoryCount: 0,
  }

  const nodeMap = new Map<string, FileNode>()
  nodeMap.set("", root)

  const sortedItems = [...items].sort((a, b) => a.path.localeCompare(b.path))

  for (const item of sortedItems) {
    const parts = item.path.split("/")
    const name = parts[parts.length - 1]
    const parentPath = parts.slice(0, -1).join("/")

    if (parts.some((part) => IGNORED_DIRS.has(part))) {
      continue
    }

    const ext =
      item.type === "blob" && name.includes(".")
        ? name.split(".").pop()?.toLowerCase() || "no-ext"
        : undefined

    const node: FileNode = {
      name,
      path: item.path,
      type: item.type === "tree" ? "directory" : "file",
      extension: ext,
      size: item.type === "blob" ? item.size : undefined,
      children: item.type === "tree" ? [] : undefined,
      fileCount: item.type === "tree" ? 0 : undefined,
      directoryCount: item.type === "tree" ? 0 : undefined,
    }

    nodeMap.set(item.path, node)

    let parent = nodeMap.get(parentPath)
    if (!parent) {
      let currentPath = ""
      for (const part of parts.slice(0, -1)) {
        const prevPath = currentPath
        currentPath = currentPath ? `${currentPath}/${part}` : part

        if (!nodeMap.has(currentPath)) {
          const dirNode: FileNode = {
            name: part,
            path: currentPath,
            type: "directory",
            children: [],
            fileCount: 0,
            directoryCount: 0,
          }
          nodeMap.set(currentPath, dirNode)
          const parentNode = nodeMap.get(prevPath)
          parentNode?.children?.push(dirNode)
        }
      }
      parent = nodeMap.get(parentPath)
    }

    parent?.children?.push(node)
  }

  function calculateCounts(node: FileNode): { files: number; dirs: number; size: number } {
    if (node.type === "file") {
      return { files: 1, dirs: 0, size: node.size || 0 }
    }

    let files = 0
    let dirs = 0
    let size = 0

    for (const child of node.children || []) {
      const counts = calculateCounts(child)
      files += counts.files
      dirs += counts.dirs
      size += counts.size
      if (child.type === "directory") {
        dirs++
      }
    }

    node.fileCount = files
    node.directoryCount = dirs
    node.size = size

    node.children?.sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    return { files, dirs, size }
  }

  calculateCounts(root)

  return root
}

function calculateStats(tree: FileNode): FileStats {
  const extensionCounts: Record<string, number> = {}
  const extensionSizes: Record<string, number> = {}
  let totalFiles = 0
  let totalDirectories = 0
  let totalSize = 0

  function traverse(node: FileNode) {
    if (node.type === "file") {
      totalFiles++
      totalSize += node.size || 0
      const ext = node.extension || "no-ext"
      extensionCounts[ext] = (extensionCounts[ext] || 0) + 1
      extensionSizes[ext] = (extensionSizes[ext] || 0) + (node.size || 0)
    } else {
      if (node.path !== "") totalDirectories++
      node.children?.forEach(traverse)
    }
  }

  traverse(tree)

  return { totalFiles, totalDirectories, extensionCounts, extensionSizes, totalSize }
}

function parseRepoInput(input: string): { owner: string; repoName: string } | null {
  const trimmed = input.trim()

  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)/)
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/)

  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repoName: urlMatch[2].replace(/\.git$/, "").replace(/\/$/, ""),
    }
  } else if (shortMatch) {
    return {
      owner: shortMatch[1],
      repoName: shortMatch[2].replace(/\.git$/, "").replace(/\/$/, ""),
    }
  }

  return null
}

export function useRepoAnalyzer() {
  const [token, setTokenState] = useState<string>(getStoredToken)
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repoName: string } | null>(null)
  const [selectedRef, setSelectedRef] = useState<string>("")
  const [currentPath, setCurrentPath] = useState<string>("")

  const setToken = useCallback((newToken: string) => {
    setTokenState(newToken)
    storeToken(newToken)
  }, [])

  // Fetch repo info to get default branch
  const repoKey = repoInfo
    ? `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repoName}`
    : null
  const {
    data: repoData,
    error: repoError,
    isLoading: isLoadingRepo,
  } = useSWR<RepoData>(repoKey, (url) => githubFetcher(url, token), swrConfig)

  const defaultBranch = repoData?.default_branch || ""
  const targetRef = selectedRef || defaultBranch

  // Fetch file tree (depends on repo data)
  // When currentPath is set, fetch that specific subtree
  const treeKey = useMemo(() => {
    if (!repoInfo || !targetRef) return null
    if (currentPath) {
      // Fetch specific subtree by path
      return `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repoName}/git/trees/${targetRef}:${currentPath}?recursive=1`
    }
    return `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repoName}/git/trees/${targetRef}?recursive=1`
  }, [repoInfo, targetRef, currentPath])

  const {
    data: treeData,
    error: treeError,
    isLoading: isLoadingTree,
  } = useSWR<GitHubTreeResponse>(treeKey, (url) => githubFetcher(url, token), {
    ...swrConfig,
    keepPreviousData: true, // Keep showing old tree while fetching new subtree
  })

  // Fetch branches
  const branchesKey = repoInfo
    ? `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repoName}/branches?per_page=100`
    : null
  const { data: branchesData } = useSWR<GitHubBranch[]>(
    branchesKey,
    (url) => githubFetcher(url, token),
    {
      ...swrConfig,
      revalidateOnMount: true,
    },
  )

  // Fetch tags
  const tagsKey = repoInfo
    ? `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repoName}/tags?per_page=100`
    : null
  const { data: tagsData } = useSWR<GitHubTag[]>(tagsKey, (url) => githubFetcher(url, token), {
    ...swrConfig,
    revalidateOnMount: true,
  })

  // Ensure default branch is in branches list
  const branches = useMemo(() => {
    const list = branchesData || []
    if (defaultBranch && !list.some((b) => b.name === defaultBranch)) {
      return [{ name: defaultBranch, protected: false }, ...list]
    }
    return list
  }, [branchesData, defaultBranch])

  const tags = tagsData || []

  // Build analysis result from tree data
  const result: AnalysisResult | null = useMemo(() => {
    if (!treeData || !repoInfo) return null

    if (treeData.truncated) {
      console.warn("Repository tree was truncated due to size")
    }

    // Get the display name for the root (either repo name or current folder name)
    const rootName = currentPath
      ? currentPath.split("/").pop() || repoInfo.repoName
      : repoInfo.repoName
    const tree = buildFileTree(treeData.tree, rootName)
    const stats = calculateStats(tree)

    return {
      tree,
      stats,
      repoName: `${repoInfo.owner}/${repoInfo.repoName}`,
      ref: targetRef,
      truncated: treeData.truncated,
      currentPath,
    }
  }, [treeData, repoInfo, targetRef, currentPath])

  // Determine loading and error states
  // isAnalyzing: true only for initial load (no data yet)
  // isNavigating: true when switching paths but we have previous data
  const hasData = !!treeData
  const isAnalyzing = isLoadingRepo || (isLoadingTree && !hasData)
  const isNavigating = isLoadingTree && hasData
  const error = repoError?.message || treeError?.message || null

  // Progress message
  const progress = useMemo(() => {
    if (isLoadingRepo) return "Fetching repository info..."
    if (isLoadingTree) return "Fetching file tree..."
    return ""
  }, [isLoadingRepo, isLoadingTree])

  // Check if result is from localStorage cache
  const cacheInfo = useMemo(() => {
    if (!treeKey) {
      return { isCached: false, cachedAt: null as Date | null }
    }
    const cachedAt = getCacheTimestamp(treeKey)
    return {
      isCached: cachedAt !== null,
      cachedAt,
    }
  }, [treeKey])

  const analyze = useCallback((repoUrl: string, ref?: string, forceRefresh = false) => {
    const parsed = parseRepoInput(repoUrl)
    if (!parsed) {
      return
    }

    setRepoInfo(parsed)
    setSelectedRef(ref || "")
    setCurrentPath("") // Reset path when analyzing new repo

    if (forceRefresh) {
      // Invalidate both SWR and localStorage cache
      clearCache()
      const baseUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repoName}`
      void mutate(baseUrl, undefined, { revalidate: true })
      void mutate((key) => typeof key === "string" && key.startsWith(baseUrl), undefined, {
        revalidate: true,
      })
    }
  }, [])

  const analyzeWithRef = useCallback(
    (ref: string) => {
      if (!repoInfo) return
      setSelectedRef(ref)
      setCurrentPath("") // Reset path when changing branch
    },
    [repoInfo],
  )

  const reset = useCallback(() => {
    setRepoInfo(null)
    setSelectedRef("")
    setCurrentPath("")
  }, [])

  // Navigate into a subdirectory
  // Path can be absolute (from breadcrumb going up) or relative (from FileTree going down)
  const navigateToPath = useCallback(
    (path: string) => {
      // Check if path is an ancestor of currentPath (navigating up via breadcrumb)
      const isAncestor = currentPath === path || currentPath.startsWith(path + "/")

      if (isAncestor || !currentPath) {
        // Navigating up via breadcrumb, or at root - use path as-is
        setCurrentPath(path)
      } else {
        // Navigating down into subdirectory - join with current path
        setCurrentPath(`${currentPath}/${path}`)
      }
    },
    [currentPath],
  )

  // Navigate up one level
  const navigateUp = useCallback(() => {
    if (!currentPath) return
    const parts = currentPath.split("/")
    parts.pop()
    setCurrentPath(parts.join("/"))
  }, [currentPath])

  // Navigate to root
  const navigateToRoot = useCallback(() => {
    setCurrentPath("")
  }, [])

  return {
    analyze,
    analyzeWithRef,
    reset,
    isAnalyzing,
    isNavigating,
    progress,
    result,
    error,
    branches,
    tags,
    selectedRef: targetRef,
    defaultBranch,
    cacheInfo,
    token,
    setToken,
    currentPath,
    navigateToPath,
    navigateUp,
    navigateToRoot,
  }
}
