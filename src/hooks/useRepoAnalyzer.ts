import { useState, useCallback } from 'react';
import type { FileNode, FileStats, AnalysisResult } from '../types';

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.cache', '__pycache__', '.venv', 'venv']);

// Cache configuration
const CACHE_KEY_PREFIX = 'repo-analyzer-cache:';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  data: AnalysisResult;
  timestamp: number;
  ttl: number;
}

function getCacheKey(repoName: string, ref: string): string {
  return `${CACHE_KEY_PREFIX}${repoName}@${ref}`;
}

function getFromCache(repoName: string, ref: string): CacheEntry | null {
  try {
    const key = getCacheKey(repoName, ref);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired
    if (now - entry.timestamp > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return entry;
  } catch {
    return null;
  }
}

function saveToCache(result: AnalysisResult): void {
  if (!result.repoName) return;
  try {
    const key = getCacheKey(result.repoName, result.ref ?? 'default');
    const entry: CacheEntry = {
      data: result,
      timestamp: Date.now(),
      ttl: CACHE_TTL_MS,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (err) {
    // localStorage might be full or disabled
    console.warn('Failed to cache result:', err);
  }
}

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
}

interface GitHubTreeResponse {
  sha: string;
  tree: GitHubTreeItem[];
  truncated: boolean;
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
}

export interface GitHubTag {
  name: string;
}

function buildFileTree(items: GitHubTreeItem[], repoName: string): FileNode {
  const root: FileNode = {
    name: repoName,
    path: '',
    type: 'directory',
    children: [],
    fileCount: 0,
    directoryCount: 0,
  };

  // Create a map for quick lookup
  const nodeMap = new Map<string, FileNode>();
  nodeMap.set('', root);

  // Sort items to ensure parent directories come before children
  const sortedItems = [...items].sort((a, b) => a.path.localeCompare(b.path));

  for (const item of sortedItems) {
    const parts = item.path.split('/');
    const name = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');

    // Skip ignored directories and their contents
    if (parts.some(part => IGNORED_DIRS.has(part))) {
      continue;
    }

    const ext = item.type === 'blob' && name.includes('.')
      ? name.split('.').pop()?.toLowerCase() || 'no-ext'
      : undefined;

    const node: FileNode = {
      name,
      path: item.path,
      type: item.type === 'tree' ? 'directory' : 'file',
      extension: ext,
      size: item.type === 'blob' ? item.size : undefined,
      children: item.type === 'tree' ? [] : undefined,
      fileCount: item.type === 'tree' ? 0 : undefined,
      directoryCount: item.type === 'tree' ? 0 : undefined,
    };

    nodeMap.set(item.path, node);

    // Find or create parent
    let parent = nodeMap.get(parentPath);
    if (!parent) {
      // Create missing parent directories
      let currentPath = '';
      for (const part of parts.slice(0, -1)) {
        const prevPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${part}` : part;

        if (!nodeMap.has(currentPath)) {
          const dirNode: FileNode = {
            name: part,
            path: currentPath,
            type: 'directory',
            children: [],
            fileCount: 0,
            directoryCount: 0,
          };
          nodeMap.set(currentPath, dirNode);
          const parentNode = nodeMap.get(prevPath);
          parentNode?.children?.push(dirNode);
        }
      }
      parent = nodeMap.get(parentPath);
    }

    parent?.children?.push(node);
  }

  // Calculate file counts for each directory
  function calculateCounts(node: FileNode): { files: number; dirs: number; size: number } {
    if (node.type === 'file') {
      return { files: 1, dirs: 0, size: node.size || 0 };
    }

    let files = 0;
    let dirs = 0;
    let size = 0;

    for (const child of node.children || []) {
      const counts = calculateCounts(child);
      files += counts.files;
      dirs += counts.dirs;
      size += counts.size;
      if (child.type === 'directory') {
        dirs++;
      }
    }

    node.fileCount = files;
    node.directoryCount = dirs;
    node.size = size;

    // Sort children: directories first, then alphabetically
    node.children?.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return { files, dirs, size };
  }

  calculateCounts(root);

  return root;
}

function calculateStats(tree: FileNode): FileStats {
  const extensionCounts: Record<string, number> = {};
  const extensionSizes: Record<string, number> = {};
  let totalFiles = 0;
  let totalDirectories = 0;
  let totalSize = 0;

  function traverse(node: FileNode) {
    if (node.type === 'file') {
      totalFiles++;
      totalSize += node.size || 0;
      const ext = node.extension || 'no-ext';
      extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
      extensionSizes[ext] = (extensionSizes[ext] || 0) + (node.size || 0);
    } else {
      if (node.path !== '') totalDirectories++;
      node.children?.forEach(traverse);
    }
  }

  traverse(tree);

  return { totalFiles, totalDirectories, extensionCounts, extensionSizes, totalSize };
}

function parseRepoInput(input: string): { owner: string; repoName: string } | null {
  const trimmed = input.trim();

  // Try full URL format first: https://github.com/owner/repo
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)/);
  // Try short format: owner/repo
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);

  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repoName: urlMatch[2].replace(/\.git$/, '').replace(/\/$/, ''),
    };
  } else if (shortMatch) {
    return {
      owner: shortMatch[1],
      repoName: shortMatch[2].replace(/\.git$/, '').replace(/\/$/, ''),
    };
  }

  return null;
}

export function useRepoAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<GitHubBranch[]>([]);
  const [tags, setTags] = useState<GitHubTag[]>([]);
  const [selectedRef, setSelectedRef] = useState<string>('');
  const [defaultBranch, setDefaultBranch] = useState<string>('');
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repoName: string } | null>(null);
  const [cacheInfo, setCacheInfo] = useState<{ isCached: boolean; cachedAt: Date | null }>({
    isCached: false,
    cachedAt: null,
  });

  const fetchBranchesAndTags = useCallback(async (owner: string, repoName: string, defaultBranchName: string) => {
    try {
      const [branchesRes, tagsRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repoName}/branches?per_page=100`),
        fetch(`https://api.github.com/repos/${owner}/${repoName}/tags?per_page=100`),
      ]);

      if (branchesRes.ok) {
        const branchesData: GitHubBranch[] = await branchesRes.json();
        // Ensure default branch is always in the list
        const hasDefaultBranch = branchesData.some(b => b.name === defaultBranchName);
        if (!hasDefaultBranch && defaultBranchName) {
          branchesData.unshift({ name: defaultBranchName, protected: false });
        }
        setBranches(branchesData);
      } else {
        // If branches fetch fails, at least show the default branch
        if (defaultBranchName) {
          setBranches([{ name: defaultBranchName, protected: false }]);
        }
      }

      if (tagsRes.ok) {
        const tagsData: GitHubTag[] = await tagsRes.json();
        setTags(tagsData);
      }
    } catch (err) {
      console.error('Failed to fetch branches/tags:', err);
      // On error, at least show the default branch
      if (defaultBranchName) {
        setBranches([{ name: defaultBranchName, protected: false }]);
      }
    }
  }, []);

  const analyze = useCallback(async (repoUrl: string, ref?: string, forceRefresh = false) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setCacheInfo({ isCached: false, cachedAt: null });

    try {
      const parsed = parseRepoInput(repoUrl);
      if (!parsed) {
        throw new Error('Invalid format. Use owner/repo or https://github.com/owner/repo');
      }

      const { owner, repoName } = parsed;
      setRepoInfo({ owner, repoName });

      setProgress('Fetching repository info...');

      // Get default branch
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
      if (!repoResponse.ok) {
        if (repoResponse.status === 404) {
          throw new Error('Repository not found. Make sure it exists and is public.');
        }
        throw new Error(`Failed to fetch repository: ${repoResponse.statusText}`);
      }
      const repoData = await repoResponse.json();
      const defaultBranchName = repoData.default_branch;
      setDefaultBranch(defaultBranchName);

      // Use provided ref or default branch
      const targetRef = ref || defaultBranchName;
      setSelectedRef(targetRef);

      // Check cache unless force refresh is requested
      const fullRepoName = `${owner}/${repoName}`;
      if (!forceRefresh) {
        const cached = getFromCache(fullRepoName, targetRef);
        if (cached) {
          setResult(cached.data);
          setCacheInfo({ isCached: true, cachedAt: new Date(cached.timestamp) });
          setProgress('');
          // Still fetch branches/tags in background
          fetchBranchesAndTags(owner, repoName, defaultBranchName);
          return;
        }
      }

      setProgress('Fetching file tree...');

      // Get the tree recursively
      const treeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/git/trees/${targetRef}?recursive=1`
      );
      if (!treeResponse.ok) {
        throw new Error(`Failed to fetch file tree: ${treeResponse.statusText}`);
      }
      const treeData: GitHubTreeResponse = await treeResponse.json();

      if (treeData.truncated) {
        console.warn('Repository tree was truncated due to size');
      }

      setProgress('Analyzing file structure...');

      // Build the file tree
      const tree = buildFileTree(treeData.tree, repoName);
      const stats = calculateStats(tree);

      const analysisResult: AnalysisResult = { tree, stats, repoName: fullRepoName, ref: targetRef };
      setResult(analysisResult);
      setCacheInfo({ isCached: false, cachedAt: null });
      setProgress('');

      // Save to cache
      saveToCache(analysisResult);

      // Fetch branches and tags for the selector (in background)
      fetchBranchesAndTags(owner, repoName, defaultBranchName);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [fetchBranchesAndTags]);

  const analyzeWithRef = useCallback(async (ref: string) => {
    if (!repoInfo) return;
    await analyze(`${repoInfo.owner}/${repoInfo.repoName}`, ref);
  }, [analyze, repoInfo]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setBranches([]);
    setTags([]);
    setSelectedRef('');
    setDefaultBranch('');
    setRepoInfo(null);
  }, []);

  return {
    analyze,
    analyzeWithRef,
    reset,
    isAnalyzing,
    progress,
    result,
    error,
    branches,
    tags,
    selectedRef,
    defaultBranch,
    cacheInfo,
  };
}
