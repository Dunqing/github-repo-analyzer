import { Download } from "lucide-react"

import type { AnalysisResult } from "@/types"

import { Button } from "@/components/ui/button"

interface ExportButtonProps {
  result: AnalysisResult
}

export function ExportButton({ result }: ExportButtonProps) {
  const handleExport = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      repoName: result.repoName,
      ref: result.ref,
      currentPath: result.currentPath || "",
      tree: result.tree,
      stats: result.stats,
      truncated: result.truncated,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(result.repoName ?? "repo").replace("/", "-")}-analysis.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="icon" onClick={handleExport} title="Export as JSON">
      <Download className="h-4 w-4" />
    </Button>
  )
}
