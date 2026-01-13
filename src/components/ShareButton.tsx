import { useState } from "react"
import Check from "~icons/lucide/check"
import Link from "~icons/lucide/link"

import { Button } from "@/components/ui/button"

interface ShareButtonProps {
  repoName: string
  branch?: string
  path?: string
}

export function ShareButton({ repoName, branch, path }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = new URL(window.location.href)
    url.searchParams.set("repo", repoName)
    if (branch) {
      url.searchParams.set("branch", branch)
    }
    if (path) {
      url.searchParams.set("path", path)
    } else {
      url.searchParams.delete("path")
    }

    try {
      await navigator.clipboard.writeText(url.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Copy share link"}
    >
      {copied ? <Check className="h-4 w-4" /> : <Link className="h-4 w-4" />}
    </Button>
  )
}
