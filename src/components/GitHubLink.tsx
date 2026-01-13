import { useMemo } from "react"
import ExternalLink from "~icons/lucide/external-link"

import { Button } from "@/components/ui/button"

interface GitHubLinkProps {
  repoName: string
  branch?: string
  path?: string
}

export function GitHubLink({ repoName, branch, path }: GitHubLinkProps) {
  const url = useMemo(() => {
    let base = `https://github.com/${repoName}`
    if (branch && path) {
      base += `/tree/${branch}/${path}`
    } else if (branch) {
      base += `/tree/${branch}`
    }
    return base
  }, [repoName, branch, path])

  return (
    <Button variant="outline" size="icon" asChild title="Open in GitHub">
      <a href={url} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="h-4 w-4" />
      </a>
    </Button>
  )
}
