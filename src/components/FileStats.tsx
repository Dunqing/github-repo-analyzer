import { File, Folder, FileType } from 'lucide-react';
import type { FileStats as FileStatsType } from '@/types';
import { getIconForExtension, IconDefault } from '@/components/FileIcon';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface FileStatsProps {
  stats: FileStatsType;
}

export function FileStats({ stats }: FileStatsProps) {
  const sortedExtensions = Object.entries(stats.extensionCounts)
    .sort((a, b) => b[1] - a[1]);

  const maxCount = sortedExtensions[0]?.[1] || 1;

  return (
    <div className="space-y-8">
      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">{stats.totalFiles}</p>
                <p className="text-sm text-muted-foreground">Total Files</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-lavender-deep/10">
                <Folder className="h-6 w-6 text-lavender-deep" />
              </div>
              <div>
                <p className="text-3xl font-bold text-lavender-deep">{stats.totalDirectories}</p>
                <p className="text-sm text-muted-foreground">Directories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-teal/10">
                <FileType className="h-6 w-6 text-teal" />
              </div>
              <div>
                <p className="text-3xl font-bold text-teal">{sortedExtensions.length}</p>
                <p className="text-sm text-muted-foreground">File Types</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File Types Distribution */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          File Types Distribution
        </h3>
        <div className="space-y-3">
          {sortedExtensions.map(([ext, count]) => {
            const Icon = ext === 'no-ext' ? IconDefault : getIconForExtension(ext);
            const percentage = (count / maxCount) * 100;
            return (
              <div key={ext} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-mono font-medium">
                    <Icon className="h-4 w-4 shrink-0" />
                    {ext === 'no-ext' ? '(no extension)' : `.${ext}`}
                  </span>
                  <span className="text-muted-foreground tabular-nums">{count}</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
