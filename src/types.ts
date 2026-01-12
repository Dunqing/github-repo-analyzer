export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  size?: number;
  children?: FileNode[];
  fileCount?: number;
  directoryCount?: number;
}

export interface FileStats {
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  extensionCounts: Record<string, number>;
  extensionSizes: Record<string, number>;
}

export interface AnalysisResult {
  tree: FileNode;
  stats: FileStats;
  repoName?: string;
  ref?: string;
}
