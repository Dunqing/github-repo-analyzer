import ChevronRight from "~icons/lucide/chevron-right"
import FolderOpen from "~icons/lucide/folder-open"
import Home from "~icons/lucide/home"
import Loader2 from "~icons/lucide/loader-2"

import { Button } from "@/components/ui/button"

interface PathBreadcrumbProps {
  repoName: string
  currentPath: string
  onNavigateToRoot: () => void
  onNavigateToPath: (path: string) => void
  isLoading?: boolean
}

export function PathBreadcrumb({
  repoName,
  currentPath,
  onNavigateToRoot,
  onNavigateToPath,
  isLoading = false,
}: PathBreadcrumbProps) {
  const parts = currentPath ? currentPath.split("/") : []
  const repoShortName = repoName.split("/")[1]
  const isAtRoot = !currentPath

  return (
    <div
      className="flex items-center gap-1 overflow-x-auto rounded-md border bg-muted/50 px-2 py-1.5 text-sm"
      title="Double-click on folders below to navigate into them"
    >
      {isLoading ? (
        <Loader2 className="mr-1 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <FolderOpen className="mr-1 h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      {isAtRoot ? (
        <div className="flex h-6 shrink-0 items-center gap-1 px-1">
          <Home className="h-3.5 w-3.5" />
          <span className="font-mono text-xs font-medium">{repoShortName}</span>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 shrink-0 gap-1 px-1"
          onClick={onNavigateToRoot}
        >
          <Home className="h-3.5 w-3.5" />
          <span className="font-mono text-xs">{repoShortName}</span>
        </Button>
      )}
      {parts.map((part, index) => {
        const pathToHere = parts.slice(0, index + 1).join("/")
        const isLast = index === parts.length - 1
        return (
          <div key={pathToHere} className="flex shrink-0 items-center gap-1">
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            {isLast ? (
              <span className="font-mono text-xs font-medium">{part}</span>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-1"
                onClick={() => onNavigateToPath(pathToHere)}
              >
                <span className="font-mono text-xs">{part}</span>
              </Button>
            )}
          </div>
        )
      })}
      {isAtRoot && (
        <span className="ml-auto hidden text-[10px] text-muted-foreground italic sm:inline">
          Double-click folders to navigate
        </span>
      )}
    </div>
  )
}
