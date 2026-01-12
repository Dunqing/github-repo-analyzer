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
  const paddingLeft = level * 16 + 8;

  if (node.type === 'file') {
    return (
      <div
        className="flex items-center gap-2.5 py-2 px-3 my-0.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-mono text-sm"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <span className="text-base opacity-80">{getFileIcon(node.extension)}</span>
        <span className="text-neutral-900 dark:text-cloud">{node.name}</span>
        {node.extension && (
          <span className="text-neutral-400 dark:text-neutral-500 text-xs">.{node.extension}</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        className="flex items-center gap-2.5 py-2 px-3 my-0.5 cursor-pointer rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-mono text-sm"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className={`text-[10px] text-neutral-400 w-3.5 transition-transform ${isExpanded ? '' : '-rotate-90'}`}>
          ▼
        </span>
        <span className="text-base">📁</span>
        <span className="text-neutral-900 dark:text-cloud font-medium">{node.name}</span>
        <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full">
          {node.fileCount} files
          {node.directoryCount ? `, ${node.directoryCount} folders` : ''}
        </span>
      </div>
      {isExpanded && node.children && (
        <div className="ml-4 pl-4 border-l border-neutral-200 dark:border-neutral-700">
          {node.children.map((child) => (
            <FileTree key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
