import { HardDrive, FileBox, TrendingUp } from "lucide-react"

import type { FileStats, FileNode } from "@/types"

import { getIconForExtension, IconDefault } from "@/components/FileIcon"
import { Progress } from "@/components/ui/progress"

interface FileSizeStatsProps {
  stats: FileStats
  tree: FileNode
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

function getTopLargestFiles(node: FileNode, limit: number = 10): FileNode[] {
  const files: FileNode[] = []

  function traverse(n: FileNode) {
    if (n.type === "file" && n.size !== undefined) {
      files.push(n)
    } else if (n.children) {
      n.children.forEach(traverse)
    }
  }

  traverse(node)

  return files.sort((a, b) => (b.size || 0) - (a.size || 0)).slice(0, limit)
}

export function FileSizeStats({ stats, tree }: FileSizeStatsProps) {
  const sortedExtensions = Object.entries(stats.extensionSizes).sort((a, b) => b[1] - a[1])

  const maxSize = sortedExtensions[0]?.[1] || 1
  const totalSize = stats.totalSize
  const averageFileSize = stats.totalFiles > 0 ? totalSize / stats.totalFiles : 0
  const largestFiles = getTopLargestFiles(tree, 10)

  return (
    <div className="space-y-6">
      {/* Size Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <HardDrive className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
          <p className="text-2xl font-semibold">{formatSize(totalSize)}</p>
          <p className="text-muted-foreground text-xs">Total Size</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <FileBox className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
          <p className="text-2xl font-semibold">{formatSize(averageFileSize)}</p>
          <p className="text-muted-foreground text-xs">Average File</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <TrendingUp className="text-muted-foreground mx-auto mb-2 h-5 w-5" />
          <p className="text-2xl font-semibold">{formatSize(largestFiles[0]?.size || 0)}</p>
          <p className="text-muted-foreground text-xs">Largest File</p>
        </div>
      </div>

      {/* Largest Files */}
      {largestFiles.length > 0 && (
        <div>
          <h3 className="mb-4 text-sm font-medium">Top 10 Largest Files</h3>
          <div className="space-y-2">
            {largestFiles.map((file, index) => {
              const Icon = file.extension ? getIconForExtension(file.extension) : IconDefault
              return (
                <div
                  key={file.path}
                  className="hover:bg-muted/50 flex items-center gap-3 rounded px-2 py-1.5"
                >
                  <span className="text-muted-foreground w-5 text-xs">{index + 1}.</span>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate font-mono text-xs" title={file.path}>
                    {file.path}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {formatSize(file.size || 0)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Size by Extension */}
      <div>
        <h3 className="mb-4 text-sm font-medium">Size by File Type</h3>
        <div className="space-y-3">
          {sortedExtensions.map(([ext, size]) => {
            const Icon = ext === "no-ext" ? IconDefault : getIconForExtension(ext)
            const percentage = (size / maxSize) * 100
            const sizePercentage = ((size / totalSize) * 100).toFixed(1)
            return (
              <div key={ext} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <Icon className="h-4 w-4 shrink-0" />
                    {ext === "no-ext" ? "(no extension)" : `.${ext}`}
                  </span>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {formatSize(size)} ({sizePercentage}%)
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
