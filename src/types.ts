export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  extension?: string;
  children?: FileNode[];
  fileCount?: number;
  directoryCount?: number;
}

export interface FileStats {
  totalFiles: number;
  totalDirectories: number;
  extensionCounts: Record<string, number>;
}

export interface AnalysisResult {
  tree: FileNode;
  stats: FileStats;
}
