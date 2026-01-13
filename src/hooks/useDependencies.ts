import { useMemo } from "react"
import useSWR from "swr"

import { DEPENDENCY_FILES, type DependencyInfo } from "@/lib/dependencyParser"

interface GitHubContentResponse {
  content: string
  encoding: string
}

async function fetchFileContent(
  repoName: string,
  branch: string,
  path: string,
  token?: string,
): Promise<string | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${repoName}/contents/${path}?ref=${branch}`,
      { headers },
    )

    if (!response.ok) {
      return null
    }

    const data: GitHubContentResponse = await response.json()

    if (data.encoding === "base64" && data.content) {
      return atob(data.content.replace(/\n/g, ""))
    }

    return null
  } catch {
    return null
  }
}

async function fetchDependencies(
  repoName: string,
  branch: string,
  token?: string,
): Promise<DependencyInfo[]> {
  const results: DependencyInfo[] = []

  // Fetch all dependency files in parallel
  const promises = DEPENDENCY_FILES.map(async ({ path, parser }) => {
    const content = await fetchFileContent(repoName, branch, path, token)
    if (content) {
      return parser(content)
    }
    return null
  })

  const responses = await Promise.all(promises)

  for (const result of responses) {
    if (result && (result.dependencies.length > 0 || result.devDependencies.length > 0)) {
      results.push(result)
    }
  }

  return results
}

interface UseDependenciesOptions {
  repoName: string
  branch: string
  token?: string
  enabled?: boolean
}

export function useDependencies({
  repoName,
  branch,
  token,
  enabled = true,
}: UseDependenciesOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled && repoName && branch ? `deps:${repoName}:${branch}` : null,
    () => fetchDependencies(repoName, branch, token),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  )

  const summary = useMemo(() => {
    if (!data) return null

    let totalDeps = 0
    let totalDevDeps = 0
    const ecosystems: string[] = []

    for (const info of data) {
      totalDeps += info.dependencies.length
      totalDevDeps += info.devDependencies.length
      ecosystems.push(info.ecosystem)
    }

    return {
      totalDependencies: totalDeps,
      totalDevDependencies: totalDevDeps,
      ecosystems,
      fileCount: data.length,
    }
  }, [data])

  return {
    dependencies: data || [],
    summary,
    isLoading,
    error,
    refresh: mutate,
  }
}
