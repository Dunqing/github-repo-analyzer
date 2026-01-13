import { GitBranch, Tag } from "lucide-react"

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
  disabled?: boolean
}

export function BranchSelector({
  branches,
  tags,
  selectedRef,
  defaultBranch,
  onSelect,
  disabled,
}: BranchSelectorProps) {
  if (branches.length === 0 && tags.length === 0) {
    return null
  }

  // Use selectedRef if set, otherwise fall back to defaultBranch
  const displayValue = selectedRef || defaultBranch

  return (
    <Select value={displayValue} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger className="w-[180px] overflow-hidden" title={displayValue}>
        <SelectValue placeholder="Select ref" />
      </SelectTrigger>
      <SelectContent>
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
      </SelectContent>
    </Select>
  )
}
