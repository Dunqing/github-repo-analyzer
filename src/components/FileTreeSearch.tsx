import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FileTreeSearchProps {
  value: string;
  onChange: (value: string) => void;
  matchCount: number;
  totalCount: number;
}

export function FileTreeSearch({ value, onChange, matchCount, totalCount }: FileTreeSearchProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search files..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => onChange('')}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {value && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {matchCount} of {totalCount} files
        </span>
      )}
    </div>
  );
}
