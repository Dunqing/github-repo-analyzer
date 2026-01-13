import History from "~icons/lucide/history"
import Trash2 from "~icons/lucide/trash-2"

import type { RecentRepo } from "@/hooks/useRecentRepos"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RecentReposDropdownProps {
  recent: RecentRepo[]
  onSelect: (repoName: string, branch?: string) => void
  onClear: () => void
  disabled?: boolean
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function RecentReposDropdown({
  recent,
  onSelect,
  onClear,
  disabled,
}: RecentReposDropdownProps) {
  if (recent.length === 0) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={disabled} title="Recent repositories">
          <History className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {recent.map((repo) => (
          <DropdownMenuItem
            key={repo.repoName}
            onClick={() => onSelect(repo.repoName, repo.branch)}
            className="flex items-center justify-between"
          >
            <span className="truncate font-mono text-sm">{repo.repoName}</span>
            <span className="ml-2 shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(repo.analyzedAt)}
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onClear}
          className="text-muted-foreground focus:text-destructive"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Clear history
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
