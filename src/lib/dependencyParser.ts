export interface Dependency {
  name: string
  version?: string
}

export interface DependencyInfo {
  ecosystem: string
  file: string
  dependencies: Dependency[]
  devDependencies: Dependency[]
}

// Parse package.json (Node.js/npm)
export function parsePackageJson(content: string): DependencyInfo {
  try {
    const pkg = JSON.parse(content)
    return {
      ecosystem: "npm",
      file: "package.json",
      dependencies: Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
        name,
        version: version as string,
      })),
      devDependencies: Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
        name,
        version: version as string,
      })),
    }
  } catch {
    return { ecosystem: "npm", file: "package.json", dependencies: [], devDependencies: [] }
  }
}

// Parse requirements.txt (Python)
export function parseRequirements(content: string): DependencyInfo {
  const dependencies: Dependency[] = []

  for (const line of content.split("\n")) {
    const trimmed = line.trim()
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("-")) continue

    // Handle various formats: pkg, pkg==1.0, pkg>=1.0, pkg[extra]==1.0
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)(?:\[.*?\])?(?:([=<>!~]+)(.+))?/)
    if (match) {
      dependencies.push({
        name: match[1],
        version: match[3] ? `${match[2]}${match[3]}` : undefined,
      })
    }
  }

  return {
    ecosystem: "pip",
    file: "requirements.txt",
    dependencies,
    devDependencies: [],
  }
}

// Parse Cargo.toml (Rust)
export function parseCargoToml(content: string): DependencyInfo {
  const dependencies: Dependency[] = []
  const devDependencies: Dependency[] = []

  let section = ""

  for (const line of content.split("\n")) {
    const trimmed = line.trim()

    // Detect section headers
    if (trimmed.startsWith("[")) {
      section = trimmed.toLowerCase()
      continue
    }

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) continue

    // Parse dependency line
    const match = trimmed.match(
      /^([a-zA-Z0-9_-]+)\s*=\s*(?:"([^"]+)"|{.*version\s*=\s*"([^"]+)".*}|\{.*\})/,
    )
    if (match) {
      const dep: Dependency = {
        name: match[1],
        version: match[2] || match[3],
      }

      if (section.includes("dev-dependencies") || section.includes("build-dependencies")) {
        devDependencies.push(dep)
      } else if (section.includes("dependencies")) {
        dependencies.push(dep)
      }
    }
  }

  return {
    ecosystem: "cargo",
    file: "Cargo.toml",
    dependencies,
    devDependencies,
  }
}

// Parse go.mod (Go)
export function parseGoMod(content: string): DependencyInfo {
  const dependencies: Dependency[] = []
  let inRequire = false

  for (const line of content.split("\n")) {
    const trimmed = line.trim()

    if (trimmed.startsWith("require (")) {
      inRequire = true
      continue
    }
    if (trimmed === ")" && inRequire) {
      inRequire = false
      continue
    }

    // Single-line require
    const singleMatch = trimmed.match(/^require\s+(\S+)\s+(\S+)/)
    if (singleMatch) {
      dependencies.push({ name: singleMatch[1], version: singleMatch[2] })
      continue
    }

    // Multi-line require block
    if (inRequire) {
      const match = trimmed.match(/^(\S+)\s+(\S+)/)
      if (match && !trimmed.startsWith("//")) {
        dependencies.push({ name: match[1], version: match[2] })
      }
    }
  }

  return {
    ecosystem: "go",
    file: "go.mod",
    dependencies,
    devDependencies: [],
  }
}

// Parse Gemfile (Ruby)
export function parseGemfile(content: string): DependencyInfo {
  const dependencies: Dependency[] = []
  const devDependencies: Dependency[] = []
  let inDevGroup = false

  for (const line of content.split("\n")) {
    const trimmed = line.trim()

    // Track group blocks
    if (trimmed.match(/^group\s+:(development|test)/)) {
      inDevGroup = true
      continue
    }
    if (trimmed === "end" && inDevGroup) {
      inDevGroup = false
      continue
    }

    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith("#")) continue

    // Parse gem line: gem 'name', '~> 1.0'
    const match = trimmed.match(/^gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?/)
    if (match) {
      const dep: Dependency = { name: match[1], version: match[2] }
      if (inDevGroup) {
        devDependencies.push(dep)
      } else {
        dependencies.push(dep)
      }
    }
  }

  return {
    ecosystem: "rubygems",
    file: "Gemfile",
    dependencies,
    devDependencies,
  }
}

// Parse pom.xml (Java/Maven) - simplified parser
export function parsePomXml(content: string): DependencyInfo {
  const dependencies: Dependency[] = []
  const devDependencies: Dependency[] = []

  // Simple regex-based parsing for dependencies
  const depRegex =
    /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>(?:\s*<version>([^<]+)<\/version>)?(?:\s*<scope>([^<]+)<\/scope>)?/g

  let match
  while ((match = depRegex.exec(content)) !== null) {
    const dep: Dependency = {
      name: `${match[1]}:${match[2]}`,
      version: match[3],
    }

    if (match[4] === "test" || match[4] === "provided") {
      devDependencies.push(dep)
    } else {
      dependencies.push(dep)
    }
  }

  return {
    ecosystem: "maven",
    file: "pom.xml",
    dependencies,
    devDependencies,
  }
}

// Parse build.gradle (Java/Gradle) - simplified parser
export function parseBuildGradle(content: string): DependencyInfo {
  const dependencies: Dependency[] = []
  const devDependencies: Dependency[] = []

  // Match various gradle dependency formats
  const depRegex =
    /(implementation|api|compile|runtime|testImplementation|testCompile)\s*[('"]([^'"()]+)['")\s]/g

  let match
  while ((match = depRegex.exec(content)) !== null) {
    const config = match[1]
    const depString = match[2]

    // Parse group:artifact:version format
    const parts = depString.split(":")
    const dep: Dependency = {
      name: parts.length >= 2 ? `${parts[0]}:${parts[1]}` : depString,
      version: parts[2],
    }

    if (config.toLowerCase().includes("test")) {
      devDependencies.push(dep)
    } else {
      dependencies.push(dep)
    }
  }

  return {
    ecosystem: "gradle",
    file: "build.gradle",
    dependencies,
    devDependencies,
  }
}

// Parse pubspec.yaml (Dart/Flutter) - simplified parser
export function parsePubspecYaml(content: string): DependencyInfo {
  const dependencies: Dependency[] = []
  const devDependencies: Dependency[] = []

  let section = ""

  for (const line of content.split("\n")) {
    // Detect section headers
    if (line.match(/^dependencies:\s*$/)) {
      section = "dependencies"
      continue
    }
    if (line.match(/^dev_dependencies:\s*$/)) {
      section = "dev_dependencies"
      continue
    }
    if (line.match(/^[a-z_]+:\s*$/) && !line.startsWith(" ")) {
      section = ""
      continue
    }

    if (!section) continue

    // Parse dependency line
    const match = line.match(/^\s{2}([a-z_0-9]+):\s*(?:\^?([0-9.]+)|.*)/)
    if (match) {
      const dep: Dependency = { name: match[1], version: match[2] }
      if (section === "dev_dependencies") {
        devDependencies.push(dep)
      } else {
        dependencies.push(dep)
      }
    }
  }

  return {
    ecosystem: "pub",
    file: "pubspec.yaml",
    dependencies,
    devDependencies,
  }
}

// Map of supported files to their parsers
export const DEPENDENCY_FILES: { path: string; parser: (content: string) => DependencyInfo }[] = [
  { path: "package.json", parser: parsePackageJson },
  { path: "requirements.txt", parser: parseRequirements },
  { path: "Cargo.toml", parser: parseCargoToml },
  { path: "go.mod", parser: parseGoMod },
  { path: "Gemfile", parser: parseGemfile },
  { path: "pom.xml", parser: parsePomXml },
  { path: "build.gradle", parser: parseBuildGradle },
  { path: "pubspec.yaml", parser: parsePubspecYaml },
]
