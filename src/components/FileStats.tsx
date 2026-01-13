import File from "~icons/lucide/file"
import FileType from "~icons/lucide/file-type"
import Folder from "~icons/lucide/folder"

import type { FileStats as FileStatsType } from "@/types"

import { getIconForExtension, IconDefault } from "@/components/FileIcon"
import { FileTypeChart } from "@/components/FileTypeChart"
import { Progress } from "@/components/ui/progress"

interface FileStatsProps {
  stats: FileStatsType
}

export function FileStats({ stats }: FileStatsProps) {
  const sortedExtensions = Object.entries(stats.extensionCounts).sort((a, b) => b[1] - a[1])

  const maxCount = sortedExtensions[0]?.[1] || 1
  const totalFiles = stats.totalFiles

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-lg bg-muted/50 p-2 text-center sm:p-4">
          <File className="mx-auto mb-1 h-4 w-4 text-muted-foreground sm:mb-2 sm:h-5 sm:w-5" />
          <p className="text-lg font-semibold sm:text-2xl">{stats.totalFiles}</p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">Files</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center sm:p-4">
          <Folder className="mx-auto mb-1 h-4 w-4 text-muted-foreground sm:mb-2 sm:h-5 sm:w-5" />
          <p className="text-lg font-semibold sm:text-2xl">{stats.totalDirectories}</p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">Dirs</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-center sm:p-4">
          <FileType className="mx-auto mb-1 h-4 w-4 text-muted-foreground sm:mb-2 sm:h-5 sm:w-5" />
          <p className="text-lg font-semibold sm:text-2xl">{sortedExtensions.length}</p>
          <p className="text-[10px] text-muted-foreground sm:text-xs">Types</p>
        </div>
      </div>

      {/* File Type Distribution Chart */}
      <FileTypeChart stats={stats} />

      {/* File Types Distribution */}
      <div>
        <h3 className="mb-4 text-sm font-medium">File Types</h3>
        <div className="space-y-3">
          {sortedExtensions.map(([ext, count]) => {
            const Icon = ext === "no-ext" ? IconDefault : getIconForExtension(ext)
            const percentage = (count / maxCount) * 100
            const filePercentage = ((count / totalFiles) * 100).toFixed(1)
            return (
              <div key={ext} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <Icon className="h-4 w-4 shrink-0" />
                    {ext === "no-ext" ? "(no extension)" : `.${ext}`}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {count} ({filePercentage}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-1.5" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
