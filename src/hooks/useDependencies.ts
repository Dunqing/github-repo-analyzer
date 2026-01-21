import { useMemo } from "react"
import useSWR from "swr"

import { DEPENDENCY_FILES, type DependencyInfo } from "@/lib/dependencyParser"
import { githubFetcherSafe } from "@/lib/github-api"

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
  const url = `https://api.github.com/repos/${repoName}/contents/${path}?ref=${branch}`
  const data = await githubFetcherSafe<GitHubContentResponse>(url, token)

  if (data?.encoding === "base64" && data.content) {
    return atob(data.content.replace(/\n/g, ""))
  }

  return null
}

async function fetchDependencies(
  repoName: string,
  branch: string,
  token?: string,
  existingPaths?: Set<string>,
): Promise<DependencyInfo[]> {
  const results: DependencyInfo[] = []

  // Filter to only files that exist in the repo (if existingPaths provided)
  const filesToFetch = existingPaths
    ? DEPENDENCY_FILES.filter(({ path }) => existingPaths.has(path))
    : DEPENDENCY_FILES

  // Fetch all dependency files in parallel
  const promises = filesToFetch.map(async ({ path, parser }) => {
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
  existingPaths?: Set<string>
}

export function useDependencies({
  repoName,
  branch,
  token,
  enabled = true,
  existingPaths,
}: UseDependenciesOptions) {
  const { data, error, isLoading, mutate } = useSWR(
    enabled && repoName && branch ? `deps:${repoName}:${branch}` : null,
    () => fetchDependencies(repoName, branch, token, existingPaths),
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
