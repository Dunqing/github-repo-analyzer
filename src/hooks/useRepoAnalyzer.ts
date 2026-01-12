import { useState, useCallback } from 'react';
import type { FileNode, FileStats, AnalysisResult } from '../types';

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', '.cache', '__pycache__', '.venv', 'venv']);

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
  function calculateCounts(node: FileNode): { files: number; dirs: number } {
    if (node.type === 'file') {
      return { files: 1, dirs: 0 };
    }

    let files = 0;
    let dirs = 0;

    for (const child of node.children || []) {
      const counts = calculateCounts(child);
      files += counts.files;
      dirs += counts.dirs;
      if (child.type === 'directory') {
        dirs++;
      }
    }

    node.fileCount = files;
    node.directoryCount = dirs;

    // Sort children: directories first, then alphabetically
    node.children?.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return { files, dirs };
  }

  calculateCounts(root);

  return root;
}

function calculateStats(tree: FileNode): FileStats {
  const extensionCounts: Record<string, number> = {};
  let totalFiles = 0;
  let totalDirectories = 0;

  function traverse(node: FileNode) {
    if (node.type === 'file') {
      totalFiles++;
      const ext = node.extension || 'no-ext';
      extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
    } else {
      if (node.path !== '') totalDirectories++;
      node.children?.forEach(traverse);
    }
  }

  traverse(tree);

  return { totalFiles, totalDirectories, extensionCounts };
}

export function useRepoAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyze = useCallback(async (repoUrl: string) => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Parse GitHub URL
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
      }

      const [, owner, repo] = match;
      const repoName = repo.replace(/\.git$/, '').replace(/\/$/, '');

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
      const defaultBranch = repoData.default_branch;

      setProgress('Fetching file tree...');

      // Get the tree recursively
      const treeResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/git/trees/${defaultBranch}?recursive=1`
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

      setResult({ tree, stats });
      setProgress('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analysis failed';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return { analyze, isAnalyzing, progress, result, error };
}
