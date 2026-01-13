import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FileTreeSearchProps {
  value: string
  onChange: (value: string) => void
  matchCount: number
  totalCount: number
}

export function FileTreeSearch({ value, onChange, matchCount, totalCount }: FileTreeSearchProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search files..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10 pl-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <span className="text-muted-foreground text-xs whitespace-nowrap">
          {matchCount} of {totalCount} files
        </span>
      )}
    </div>
  )
}
