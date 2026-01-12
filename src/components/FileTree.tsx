import { useState } from 'react';
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
}

export function FileTree({ node, level = 0 }: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(level < 2);

  if (node.type === 'file') {
    return (
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm",
          "hover:bg-accent transition-colors",
          "text-muted-foreground hover:text-foreground"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <FileIcon
          filename={node.name}
          extension={node.extension}
          className="h-4 w-4 shrink-0"
        />
        <span className="truncate font-mono text-foreground">{node.name}</span>
      </div>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 py-1.5 px-2 rounded-md text-sm w-full",
            "hover:bg-accent transition-colors text-left"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              isOpen && "rotate-90"
            )}
          />
          <FileIcon
            isFolder
            isOpen={isOpen}
            className="h-4 w-4 shrink-0"
          />
          <span className="truncate font-medium font-mono">{node.name}</span>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
            {node.fileCount} files
            {node.directoryCount ? `, ${node.directoryCount} folders` : ''}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-l border-border ml-4 pl-2">
          {node.children?.map((child) => (
            <FileTree key={child.path} node={child} level={level + 1} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
