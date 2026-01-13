import { ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"

import type { FileNode } from "@/types"

import { FileIcon } from "@/components/FileIcon"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface FileTreeProps {
  node: FileNode
  level?: number
  filter?: string
  forceOpen?: boolean
  onFolderNavigate?: (path: string) => void
}

function filterTree(node: FileNode, filter: string): FileNode | null {
  if (!filter) return node

  if (node.type === "file") {
    return node.name.toLowerCase().includes(filter.toLowerCase()) ? node : null
  }

  // For directories, filter children
  const filteredChildren = node.children
    ?.map((child) => filterTree(child, filter))
    .filter((child): child is FileNode => child !== null)

  if (!filteredChildren || filteredChildren.length === 0) {
    return null
  }

  return {
    ...node,
    children: filteredChildren,
  }
}

function countMatchingFiles(node: FileNode, filter: string): number {
  if (!filter) {
    return node.type === "file" ? 1 : node.fileCount || 0
  }

  if (node.type === "file") {
    return node.name.toLowerCase().includes(filter.toLowerCase()) ? 1 : 0
  }

  return node.children?.reduce((sum, child) => sum + countMatchingFiles(child, filter), 0) || 0
}

function HighlightMatch({ text, filter }: { text: string; filter: string }) {
  if (!filter) {
    return <>{text}</>
  }

  const lowerText = text.toLowerCase()
  const lowerFilter = filter.toLowerCase()
  const index = lowerText.indexOf(lowerFilter)

  if (index === -1) {
    return <>{text}</>
  }

  return (
    <>
      {text.slice(0, index)}
      <span className="rounded bg-yellow-200 px-0.5 dark:bg-yellow-800">
        {text.slice(index, index + filter.length)}
      </span>
      {text.slice(index + filter.length)}
    </>
  )
}

function FileTreeNode({
  node,
  level = 0,
  filter = "",
  forceOpen = false,
  onFolderNavigate,
}: FileTreeProps) {
  const [isOpen, setIsOpen] = useState(level < 2 || forceOpen)

  // When filter is active and node matches, expand it
  const shouldBeOpen = filter ? forceOpen || isOpen : isOpen

  if (node.type === "file") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded px-2 py-1 text-sm",
          "cursor-default transition-colors hover:bg-muted/50",
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
    )
  }

  const handleFolderDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onFolderNavigate && node.path) {
      onFolderNavigate(node.path)
    }
  }

  return (
    <Collapsible open={shouldBeOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          className={cn(
            "flex w-full items-center gap-2 rounded px-2 py-1 text-sm",
            "text-left transition-colors hover:bg-muted/50",
            onFolderNavigate && "group",
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onDoubleClick={handleFolderDoubleClick}
          title={onFolderNavigate ? "Click to expand, double-click to navigate" : undefined}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              shouldBeOpen && "rotate-90",
            )}
          />
          <FileIcon isFolder isOpen={shouldBeOpen} className="h-4 w-4 shrink-0" />
          <span className="truncate font-mono text-xs font-medium">{node.name}</span>
          <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
            {node.fileCount} {node.fileCount === 1 ? "file" : "files"}
            {node.directoryCount
              ? `, ${node.directoryCount} ${node.directoryCount === 1 ? "dir" : "dirs"}`
              : ""}
          </span>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-[22px] border-l border-border">
          {node.children?.map((child) => (
            <FileTreeNode
              key={child.path}
              node={child}
              level={level + 1}
              filter={filter}
              forceOpen={!!filter}
              onFolderNavigate={onFolderNavigate}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function FileTree({ node, level = 0, filter = "", onFolderNavigate }: FileTreeProps) {
  const filteredNode = useMemo(() => filterTree(node, filter), [node, filter])

  if (!filteredNode) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No files match "{filter}"
      </div>
    )
  }

  return (
    <FileTreeNode
      node={filteredNode}
      level={level}
      filter={filter}
      forceOpen={!!filter}
      onFolderNavigate={onFolderNavigate}
    />
  )
}

export { countMatchingFiles }
