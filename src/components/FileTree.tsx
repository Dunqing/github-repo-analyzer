import { useState } from 'react';
import type { FileNode } from '../types';

interface FileTreeProps {
  node: FileNode;
  level?: number;
}

const FILE_ICONS: Record<string, string> = {
  ts: '📘',
  tsx: '📘',
  js: '📒',
  jsx: '📒',
  json: '📋',
  md: '📝',
  css: '🎨',
  scss: '🎨',
  html: '🌐',
  svg: '🖼️',
  png: '🖼️',
  jpg: '🖼️',
  gif: '🖼️',
  yml: '⚙️',
  yaml: '⚙️',
  toml: '⚙️',
  lock: '🔒',
  gitignore: '🙈',
  env: '🔐',
  'no-ext': '📄',
};

function getFileIcon(extension?: string): string {
  return FILE_ICONS[extension || 'no-ext'] || '📄';
}

export function FileTree({ node, level = 0 }: FileTreeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  if (node.type === 'file') {
    return (
      <div
        className="file-item"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span className="file-icon">{getFileIcon(node.extension)}</span>
        <span className="file-name">{node.name}</span>
        {node.extension && (
          <span className="file-ext">.{node.extension}</span>
        )}
      </div>
    );
  }

  return (
    <div className="directory">
      <div
        className="directory-header"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
        <span className="folder-icon">📁</span>
        <span className="directory-name">{node.name}</span>
        <span className="directory-stats">
          {node.fileCount} files
          {node.directoryCount ? `, ${node.directoryCount} folders` : ''}
        </span>
      </div>
      {isExpanded && node.children && (
        <div className="directory-children">
          {node.children.map((child) => (
            <FileTree key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
