import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import type { FileNode } from '@/types';
import { FileIcon } from '@/components/FileIcon';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FileTreeProps {
  node: FileNode;
  level?: number;
  filter?: string;
  forceOpen?: boolean;
}

function filterTree(node: FileNode, filter: string): FileNode | null {
  if (!filter) return node;

  if (node.type === 'file') {
    return node.name.toLowerCase().includes(filter.toLowerCase()) ? node : null;
  }

  // For directories, filter children
  const filteredChildren = node.children
    ?.map((child) => filterTree(child, filter))
    .filter((child): child is FileNode => child !== null);

  if (!filteredChildren || filteredChildren.length === 0) {
    return null;
  }

  return {
    ...node,
    children: filteredChildren,
  };
}

function countMatchingFiles(node: FileNode, filter: string): number {
  if (!filter) {
    return node.type === 'file' ? 1 : (node.fileCount || 0);
  }

  if (node.type === 'file') {
    return node.name.toLowerCase().includes(filter.toLowerCase()) ? 1 : 0;
  }

  return node.children?.reduce((sum, child) => sum + countMatchingFiles(child, filter), 0) || 0;
}

function HighlightMatch({ text, filter }: { text: string; filter: string }) {
  if (!filter) {
    return <>{text}</>;
  }

  const lowerText = text.toLowerCase();
  const lowerFilter = filter.toLowerCase();
  const index = lowerText.indexOf(lowerFilter);

  if (index === -1) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, index)}
      <span className="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">
        {text.slice(index, index + filter.length)}
      </span>
      {text.slice(index + filter.length)}
    </>
  );
}

function FileTreeNode({ node, level = 0, filter = '', forceOpen = false }: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(level < 2 || forceOpen);

  // When filter is active and node matches, expand it
  const shouldBeOpen = filter ? (forceOpen || isOpen) : isOpen;

  if (node.type === 'file') {
    return (
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 rounded text-sm",
          "hover:bg-muted/50 transition-colors cursor-default"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <FileIcon
          filename={node.name}
          extension={node.extension}
          className="h-4 w-4 shrink-0 text-muted-foreground"
        />
        <span className="truncate font-mono text-xs">
          <HighlightMatch text={node.name} filter={filter} />
        </span>
      </div>
    );
  }

  return (
    <Collapsible open={shouldBeOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 py-1 px-2 rounded text-sm w-full",
            "hover:bg-muted/50 transition-colors text-left"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              shouldBeOpen && "rotate-90"
            )}
          />
          <FileIcon
            isFolder
            isOpen={shouldBeOpen}
            className="h-4 w-4 shrink-0"
          />
          <span className="truncate font-medium font-mono text-xs">{node.name}</span>
          <span className="ml-auto text-[10px] text-muted-foreground shrink-0">
            {node.fileCount}
            {node.directoryCount ? ` / ${node.directoryCount}` : ''}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-l border-border ml-[22px]">
          {node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              filter={filter}
              forceOpen={!!filter}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function FileTree({ node, level = 0, filter = '' }: FileTreeProps) {
  const filteredNode = useMemo(() => filterTree(node, filter), [node, filter]);

  if (!filteredNode) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No files match "{filter}"
      </div>
    );
  }

  return <FileTreeNode node={filteredNode} level={level} filter={filter} forceOpen={!!filter} />;
}

export { countMatchingFiles };
