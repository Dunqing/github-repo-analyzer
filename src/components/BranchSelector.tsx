import GitBranch from "~icons/lucide/git-branch"
import Tag from "~icons/lucide/tag"

import type { GitHubBranch, GitHubTag } from "@/hooks/useRepoAnalyzer"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface BranchSelectorProps {
  branches: GitHubBranch[]
  tags: GitHubTag[]
  selectedRef: string
  defaultBranch: string
  onSelect: (ref: string) => void
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  isLoading?: boolean
}

export function BranchSelector({
  branches,
  tags,
  selectedRef,
  defaultBranch,
  onSelect,
  onOpenChange,
  disabled,
  isLoading,
}: BranchSelectorProps) {
  // Use selectedRef if set, otherwise fall back to defaultBranch
  const displayValue = selectedRef || defaultBranch

  // Show selector even when loading (will show loading state inside)
  if (!isLoading && branches.length === 0 && tags.length === 0) {
    return null
  }

  return (
    <Select
      value={displayValue}
      onValueChange={onSelect}
      onOpenChange={onOpenChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-full overflow-hidden sm:w-45" title={displayValue}>
        <SelectValue placeholder="Select ref" />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <>
            {branches.length > 0 && (
              <SelectGroup>
                <SelectLabel className="flex items-center gap-2">
                  <GitBranch className="h-3 w-3" />
                  Branches
                </SelectLabel>
                {branches.map((branch) => (
                  <SelectItem key={`branch-${branch.name}`} value={branch.name} title={branch.name}>
                    <span className="flex max-w-50 items-center gap-2">
                      <span className="truncate">{branch.name}</span>
                      {branch.name === defaultBranch && (
                        <span className="shrink-0 rounded bg-muted px-1 text-[10px]">default</span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
            {tags.length > 0 && (
              <SelectGroup>
                <SelectLabel className="flex items-center gap-2">
                  <Tag className="h-3 w-3" />
                  Tags
                </SelectLabel>
                {tags.map((tag) => (
                  <SelectItem key={`tag-${tag.name}`} value={tag.name} title={tag.name}>
                    <span className="max-w-50 truncate">{tag.name}</span>
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </>
        )}
      </SelectContent>
    </Select>
  )
}
