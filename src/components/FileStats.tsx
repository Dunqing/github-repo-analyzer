import { File, Folder, FileType } from 'lucide-react';
import type { FileStats as FileStatsType } from '@/types';
import { getIconForExtension, IconDefault } from '@/components/FileIcon';
import { Progress } from '@/components/ui/progress';
import { FileTypeChart } from '@/components/FileTypeChart';

interface FileStatsProps {
  stats: FileStatsType;
}

export function FileStats({ stats }: FileStatsProps) {
  const sortedExtensions = Object.entries(stats.extensionCounts)
    .sort((a, b) => b[1] - a[1]);

  const maxCount = sortedExtensions[0]?.[1] || 1;
  const totalFiles = stats.totalFiles;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <File className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-2xl font-semibold">{stats.totalFiles}</p>
          <p className="text-xs text-muted-foreground">Files</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <Folder className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-2xl font-semibold">{stats.totalDirectories}</p>
          <p className="text-xs text-muted-foreground">Directories</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-muted/50">
          <FileType className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
          <p className="text-2xl font-semibold">{sortedExtensions.length}</p>
          <p className="text-xs text-muted-foreground">File Types</p>
        </div>
      </div>

      {/* File Type Distribution Chart */}
      <FileTypeChart stats={stats} />

      {/* File Types Distribution */}
      <div>
        <h3 className="text-sm font-medium mb-4">File Types</h3>
        <div className="space-y-3">
          {sortedExtensions.map(([ext, count]) => {
            const Icon = ext === 'no-ext' ? IconDefault : getIconForExtension(ext);
            const percentage = (count / maxCount) * 100;
            const filePercentage = ((count / totalFiles) * 100).toFixed(1);
            return (
              <div key={ext} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <Icon className="h-4 w-4 shrink-0" />
                    {ext === 'no-ext' ? '(no extension)' : `.${ext}`}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {count} ({filePercentage}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
