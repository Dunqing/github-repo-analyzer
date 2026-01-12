import { GitBranch, Tag } from 'lucide-react';
import type { GitHubBranch, GitHubTag } from '@/hooks/useRepoAnalyzer';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BranchSelectorProps {
  branches: GitHubBranch[];
  tags: GitHubTag[];
  selectedRef: string;
  defaultBranch: string;
  onSelect: (ref: string) => void;
  disabled?: boolean;
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
    return null;
  }

  return (
    <Select value={selectedRef} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger className="w-[180px]">
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
              <SelectItem key={`branch-${branch.name}`} value={branch.name}>
                <span className="flex items-center gap-2">
                  {branch.name}
                  {branch.name === defaultBranch && (
                    <span className="text-[10px] bg-muted px-1 rounded">default</span>
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
              <SelectItem key={`tag-${tag.name}`} value={tag.name}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
