import { Package, ChevronDown, Loader2, AlertCircle, ExternalLink } from "lucide-react"
import { useState } from "react"

import type { DependencyInfo } from "@/lib/dependencyParser"

import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface DependencyStatsProps {
  dependencies: DependencyInfo[]
  isLoading: boolean
  error?: Error | null
}

const ECOSYSTEM_LABELS: Record<string, string> = {
  npm: "npm (Node.js)",
  pip: "pip (Python)",
  cargo: "Cargo (Rust)",
  go: "Go Modules",
  rubygems: "RubyGems",
  maven: "Maven (Java)",
  gradle: "Gradle (Java)",
  pub: "Pub (Dart/Flutter)",
}

const ECOSYSTEM_COLORS: Record<string, string> = {
  npm: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50",
  pip: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50",
  cargo:
    "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50",
  go: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:hover:bg-cyan-900/50",
  rubygems:
    "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900/50",
  maven:
    "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50",
  gradle:
    "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50",
  pub: "bg-sky-100 text-sky-800 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:hover:bg-sky-900/50",
}

function getRegistryUrl(ecosystem: string, name: string): string | null {
  switch (ecosystem) {
    case "npm":
      return `https://www.npmjs.com/package/${name}`
    case "pip":
      return `https://pypi.org/project/${name}`
    case "cargo":
      return `https://crates.io/crates/${name}`
    case "go":
      return `https://pkg.go.dev/${name}`
    case "rubygems":
      return `https://rubygems.org/gems/${name}`
    case "maven":
    case "gradle": {
      // Format: group:artifact -> group/artifact
      const parts = name.split(":")
      if (parts.length >= 2) {
        return `https://mvnrepository.com/artifact/${parts[0]}/${parts[1]}`
      }
      return `https://mvnrepository.com/search?q=${encodeURIComponent(name)}`
    }
    case "pub":
      return `https://pub.dev/packages/${name}`
    default:
      return null
  }
}

function DependencyList({
  title,
  deps,
  ecosystem,
}: {
  title: string
  deps: { name: string; version?: string }[]
  ecosystem: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (deps.length === 0) return null

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 py-1 text-sm font-medium hover:underline">
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
        {title} ({deps.length})
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-1 ml-6 space-y-0.5">
          {deps.map((dep) => {
            const url = getRegistryUrl(ecosystem, dep.name)
            return (
              <div key={dep.name} className="flex items-center gap-2 text-xs">
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-1 font-mono text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {dep.name}
                    <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                ) : (
                  <span className="text-muted-foreground font-mono">{dep.name}</span>
                )}
                {dep.version && (
                  <span className="text-muted-foreground/60 font-mono text-[10px]">
                    {dep.version}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function DependencyStats({ dependencies, isLoading, error }: DependencyStatsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        <p className="text-muted-foreground mt-2 text-sm">Scanning for dependencies...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="text-destructive h-8 w-8" />
        <p className="text-destructive mt-2 text-sm">Failed to load dependencies</p>
      </div>
    )
  }

  if (dependencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Package className="text-muted-foreground h-8 w-8" />
        <p className="text-muted-foreground mt-2 text-sm">No dependency files found</p>
        <p className="text-muted-foreground/60 mt-1 text-xs">
          Supported: package.json, requirements.txt, Cargo.toml, go.mod, Gemfile, pom.xml,
          build.gradle, pubspec.yaml
        </p>
      </div>
    )
  }

  const totalDeps = dependencies.reduce((sum, d) => sum + d.dependencies.length, 0)
  const totalDevDeps = dependencies.reduce((sum, d) => sum + d.devDependencies.length, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1">
          <Package className="h-3 w-3" />
          {totalDeps} dependencies
        </Badge>
        {totalDevDeps > 0 && (
          <Badge variant="outline" className="gap-1">
            {totalDevDeps} dev dependencies
          </Badge>
        )}
        <Badge variant="outline" className="gap-1">
          {dependencies.length} {dependencies.length === 1 ? "ecosystem" : "ecosystems"}
        </Badge>
      </div>

      {/* Ecosystems */}
      <div className="space-y-4">
        {dependencies.map((info) => (
          <div key={info.file} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center gap-2">
              <Badge className={ECOSYSTEM_COLORS[info.ecosystem] || "bg-gray-100 text-gray-800"}>
                {ECOSYSTEM_LABELS[info.ecosystem] || info.ecosystem}
              </Badge>
              <span className="text-muted-foreground font-mono text-xs">{info.file}</span>
            </div>

            <div className="space-y-1">
              <DependencyList
                title="Dependencies"
                deps={info.dependencies}
                ecosystem={info.ecosystem}
              />
              <DependencyList
                title="Dev Dependencies"
                deps={info.devDependencies}
                ecosystem={info.ecosystem}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
