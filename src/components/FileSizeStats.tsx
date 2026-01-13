import { HardDrive, FileBox, TrendingUp } from "lucide-react"

import type { FileStats, FileNode } from "@/types"

import { getIconForExtension, IconDefault } from "@/components/FileIcon"
import { Progress } from "@/components/ui/progress"

// Average bytes per line estimates for different file types
// These are rough estimates based on typical code formatting
const BYTES_PER_LINE: Record<string, number> = {
  // JavaScript/TypeScript ecosystem
  js: 40,
  jsx: 45,
  ts: 42,
  tsx: 48,
  mjs: 40,
  cjs: 40,
  vue: 50,
  svelte: 50,

  // Web
  html: 45,
  htm: 45,
  css: 35,
  scss: 38,
  sass: 30,
  less: 38,

  // Backend languages
  py: 35,
  rb: 32,
  php: 40,
  java: 45,
  kt: 40,
  scala: 42,
  go: 38,
  rs: 40,
  c: 35,
  cpp: 40,
  h: 35,
  hpp: 40,
  cs: 45,
  swift: 42,

  // Data/Config
  json: 30,
  yaml: 25,
  yml: 25,
  toml: 28,
  xml: 50,

  // Documentation
  md: 60,
  txt: 50,
  rst: 55,

  // Shell/Scripts
  sh: 35,
  bash: 35,
  zsh: 35,
  ps1: 45,
  bat: 40,

  // SQL
  sql: 45,

  // Default for unknown extensions
  default: 40,
}

function getBytesPerLine(ext: string): number {
  return BYTES_PER_LINE[ext.toLowerCase()] || BYTES_PER_LINE.default
}

// Check if extension is likely a code file (not binary or data)
function isCodeExtension(ext: string): boolean {
  const codeExtensions = new Set([
    "js",
    "jsx",
    "ts",
    "tsx",
    "mjs",
    "cjs",
    "vue",
    "svelte",
    "html",
    "htm",
    "css",
    "scss",
    "sass",
    "less",
    "py",
    "rb",
    "php",
    "java",
    "kt",
    "scala",
    "go",
    "rs",
    "c",
    "cpp",
    "h",
    "hpp",
    "cs",
    "swift",
    "json",
    "yaml",
    "yml",
    "toml",
    "xml",
    "md",
    "txt",
    "rst",
    "sh",
    "bash",
    "zsh",
    "ps1",
    "bat",
    "sql",
    "graphql",
    "gql",
    "prisma",
    "dockerfile",
    "makefile",
  ])
  return codeExtensions.has(ext.toLowerCase())
}

function estimateLinesOfCode(extensionSizes: Record<string, number>): {
  total: number
  byExtension: Array<{ ext: string; loc: number; size: number }>
} {
  const byExtension: Array<{ ext: string; loc: number; size: number }> = []
  let total = 0

  for (const [ext, size] of Object.entries(extensionSizes)) {
    if (ext === "no-ext" || !isCodeExtension(ext)) continue

    const bytesPerLine = getBytesPerLine(ext)
    const loc = Math.round(size / bytesPerLine)
    total += loc
    byExtension.push({ ext, loc, size })
  }

  byExtension.sort((a, b) => b.loc - a.loc)

  return { total, byExtension }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toLocaleString()
}

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
  const locEstimate = estimateLinesOfCode(stats.extensionSizes)
  const maxLoc = locEstimate.byExtension[0]?.loc || 1

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

      {/* Lines of Code Estimate */}
      {locEstimate.byExtension.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium">Lines of Code (Estimate)</h3>
            <span className="bg-muted text-muted-foreground rounded px-2 py-0.5 text-xs">
              ~{formatNumber(locEstimate.total)} total
            </span>
          </div>
          <p className="text-muted-foreground mb-4 text-xs">
            Estimated based on file sizes and typical bytes-per-line for each language.
          </p>
          <div className="space-y-3">
            {locEstimate.byExtension.slice(0, 10).map(({ ext, loc }) => {
              const Icon = getIconForExtension(ext)
              const percentage = (loc / maxLoc) * 100
              const locPercentage = ((loc / locEstimate.total) * 100).toFixed(1)
              return (
                <div key={ext} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 font-mono text-xs">
                      <Icon className="h-4 w-4 shrink-0" />.{ext}
                    </span>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {formatNumber(loc)} lines ({locPercentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-1.5" />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
