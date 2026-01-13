import type { FileNode } from "@/types"

export type TreeFormat = "ascii" | "markdown" | "paths"

function buildAsciiTree(node: FileNode, prefix: string = "", isLast: boolean = true): string {
  const lines: string[] = []

  // Add current node
  const connector = isLast ? "└── " : "├── "
  const displayName = node.type === "directory" ? `${node.name}/` : node.name
  lines.push(prefix + connector + displayName)

  // Process children
  if (node.children && node.children.length > 0) {
    const newPrefix = prefix + (isLast ? "    " : "│   ")
    node.children.forEach((child, index) => {
      const childIsLast = index === node.children!.length - 1
      lines.push(buildAsciiTree(child, newPrefix, childIsLast))
    })
  }

  return lines.join("\n")
}

function buildMarkdownTree(node: FileNode, indent: number = 0): string {
  const lines: string[] = []
  const prefix = "  ".repeat(indent)
  const bullet = node.type === "directory" ? "📁" : "📄"

  lines.push(`${prefix}- ${bullet} ${node.name}`)

  if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      lines.push(buildMarkdownTree(child, indent + 1))
    })
  }

  return lines.join("\n")
}

function buildPathsList(node: FileNode, currentPath: string = ""): string {
  const lines: string[] = []
  const path = currentPath ? `${currentPath}/${node.name}` : node.name

  if (node.type === "file") {
    lines.push(path)
  } else if (node.children && node.children.length > 0) {
    node.children.forEach((child) => {
      lines.push(buildPathsList(child, path))
    })
  }

  return lines.join("\n")
}

export function treeToText(node: FileNode, format: TreeFormat = "ascii"): string {
  switch (format) {
    case "ascii": {
      // For the root, start with just the name
      const lines: string[] = [`${node.name}/`]
      if (node.children && node.children.length > 0) {
        node.children.forEach((child, index) => {
          const isLast = index === node.children!.length - 1
          lines.push(buildAsciiTree(child, "", isLast))
        })
      }
      return lines.join("\n")
    }
    case "markdown":
      return buildMarkdownTree(node)
    case "paths":
      return buildPathsList(node)
    default:
      return buildAsciiTree(node)
  }
}
