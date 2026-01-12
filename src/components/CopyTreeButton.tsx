import { useState } from 'react';
import { Copy, Check, ChevronDown } from 'lucide-react';
import type { FileNode } from '@/types';
import { treeToText, type TreeFormat } from '@/lib/treeToText';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CopyTreeButtonProps {
  tree: FileNode;
}

const FORMAT_LABELS: Record<TreeFormat, string> = {
  ascii: 'ASCII Tree',
  markdown: 'Markdown',
  paths: 'File Paths',
};

export function CopyTreeButton({ tree }: CopyTreeButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (format: TreeFormat) => {
    const text = treeToText(tree, format);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
              <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {(Object.keys(FORMAT_LABELS) as TreeFormat[]).map((format) => (
          <DropdownMenuItem key={format} onClick={() => handleCopy(format)}>
            {FORMAT_LABELS[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
