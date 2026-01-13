import type { SVGProps } from "react"

import IconDefault from "~icons/vscode-icons/default-file"
import IconFolder from "~icons/vscode-icons/default-folder"
import IconFolderOpen from "~icons/vscode-icons/default-folder-opened"
import IconC from "~icons/vscode-icons/file-type-c3"
import IconCpp from "~icons/vscode-icons/file-type-cpp3"
import IconCss from "~icons/vscode-icons/file-type-css"
import IconDocker from "~icons/vscode-icons/file-type-docker2"
import IconEslint from "~icons/vscode-icons/file-type-eslint"
import IconGit from "~icons/vscode-icons/file-type-git"
import IconGo from "~icons/vscode-icons/file-type-go"
import IconGraphql from "~icons/vscode-icons/file-type-graphql"
import IconHtml from "~icons/vscode-icons/file-type-html"
import IconImage from "~icons/vscode-icons/file-type-image"
import IconJava from "~icons/vscode-icons/file-type-java"
import IconJavaScript from "~icons/vscode-icons/file-type-js-official"
import IconJson from "~icons/vscode-icons/file-type-json"
import IconKotlin from "~icons/vscode-icons/file-type-kotlin"
import IconLicense from "~icons/vscode-icons/file-type-license"
import IconMarkdown from "~icons/vscode-icons/file-type-markdown"
import IconReadme from "~icons/vscode-icons/file-type-markdown"
import IconPackageJson from "~icons/vscode-icons/file-type-npm"
import IconPhp from "~icons/vscode-icons/file-type-php3"
import IconPrettier from "~icons/vscode-icons/file-type-prettier"
import IconPython from "~icons/vscode-icons/file-type-python"
import IconJavaScriptReact from "~icons/vscode-icons/file-type-reactjs"
import IconTypeScriptReact from "~icons/vscode-icons/file-type-reactts"
import IconRuby from "~icons/vscode-icons/file-type-ruby"
import IconRust from "~icons/vscode-icons/file-type-rust"
import IconScss from "~icons/vscode-icons/file-type-scss"
import IconShell from "~icons/vscode-icons/file-type-shell"
import IconSql from "~icons/vscode-icons/file-type-sql"
import IconSvelte from "~icons/vscode-icons/file-type-svelte"
import IconSvg from "~icons/vscode-icons/file-type-svg"
import IconSwift from "~icons/vscode-icons/file-type-swift"
import IconTailwind from "~icons/vscode-icons/file-type-tailwind"
import IconText from "~icons/vscode-icons/file-type-text"
import IconToml from "~icons/vscode-icons/file-type-toml"
// VS Code Icons imports
import IconTypeScript from "~icons/vscode-icons/file-type-typescript"
import IconVite from "~icons/vscode-icons/file-type-vite"
import IconVue from "~icons/vscode-icons/file-type-vue"
import IconXml from "~icons/vscode-icons/file-type-xml"
import IconYaml from "~icons/vscode-icons/file-type-yaml"
import IconZip from "~icons/vscode-icons/file-type-zip"

type IconComponent = React.ComponentType<SVGProps<SVGSVGElement>>

const EXTENSION_ICONS: Record<string, IconComponent> = {
  // TypeScript
  ts: IconTypeScript,
  mts: IconTypeScript,
  cts: IconTypeScript,
  tsx: IconTypeScriptReact,

  // JavaScript
  js: IconJavaScript,
  mjs: IconJavaScript,
  cjs: IconJavaScript,
  jsx: IconJavaScriptReact,

  // Data formats
  json: IconJson,
  yaml: IconYaml,
  yml: IconYaml,
  toml: IconToml,
  xml: IconXml,

  // Markup & Styles
  md: IconMarkdown,
  mdx: IconMarkdown,
  css: IconCss,
  scss: IconScss,
  sass: IconScss,
  less: IconCss,
  html: IconHtml,
  htm: IconHtml,

  // Images
  svg: IconSvg,
  png: IconImage,
  jpg: IconImage,
  jpeg: IconImage,
  gif: IconImage,
  webp: IconImage,
  ico: IconImage,
  pdf: IconImage,

  // Programming languages
  py: IconPython,
  pyw: IconPython,
  rs: IconRust,
  go: IconGo,
  java: IconJava,
  cpp: IconCpp,
  cc: IconCpp,
  cxx: IconCpp,
  c: IconC,
  h: IconC,
  hpp: IconCpp,
  vue: IconVue,
  svelte: IconSvelte,
  php: IconPhp,
  rb: IconRuby,
  swift: IconSwift,
  kt: IconKotlin,
  kts: IconKotlin,

  // Shell & Config
  sh: IconShell,
  bash: IconShell,
  zsh: IconShell,
  fish: IconShell,
  dockerfile: IconDocker,

  // Database & Query
  graphql: IconGraphql,
  gql: IconGraphql,
  sql: IconSql,

  // Documents
  txt: IconText,

  // Archives
  zip: IconZip,
  tar: IconZip,
  gz: IconZip,
  rar: IconZip,
  "7z": IconZip,

  // Lock files
  lock: IconJson,

  // Environment
  env: IconGit,

  // Git
  gitignore: IconGit,
  gitattributes: IconGit,
}

const FILENAME_ICONS: Record<string, IconComponent> = {
  "package.json": IconPackageJson,
  "package-lock.json": IconPackageJson,
  "pnpm-lock.yaml": IconPackageJson,
  "yarn.lock": IconPackageJson,
  "tsconfig.json": IconTypeScript,
  ".eslintrc": IconEslint,
  ".eslintrc.js": IconEslint,
  ".eslintrc.json": IconEslint,
  "eslint.config.js": IconEslint,
  "eslint.config.mjs": IconEslint,
  ".prettierrc": IconPrettier,
  ".prettierrc.js": IconPrettier,
  ".prettierrc.json": IconPrettier,
  "prettier.config.js": IconPrettier,
  "vite.config.ts": IconVite,
  "vite.config.js": IconVite,
  "tailwind.config.js": IconTailwind,
  "tailwind.config.ts": IconTailwind,
  license: IconLicense,
  "license.md": IconLicense,
  "license.txt": IconLicense,
  readme: IconReadme,
  "readme.md": IconReadme,
  "readme.txt": IconReadme,
  dockerfile: IconDocker,
  ".dockerignore": IconDocker,
  ".gitignore": IconGit,
  ".gitattributes": IconGit,
  ".env": IconGit,
  ".env.local": IconGit,
  ".env.development": IconGit,
  ".env.production": IconGit,
}

interface FileIconProps extends SVGProps<SVGSVGElement> {
  filename?: string
  extension?: string
  isFolder?: boolean
  isOpen?: boolean
}

export function FileIcon({
  filename,
  extension,
  isFolder = false,
  isOpen = false,
  className = "",
  ...props
}: FileIconProps) {
  let Icon: IconComponent = IconDefault

  if (isFolder) {
    Icon = isOpen ? IconFolderOpen : IconFolder
  } else if (filename) {
    const lowerFilename = filename.toLowerCase()

    // Check for exact filename match first
    if (FILENAME_ICONS[lowerFilename]) {
      Icon = FILENAME_ICONS[lowerFilename]
    } else if (extension) {
      // Then check by extension
      const ext = extension.toLowerCase().replace(/^\./, "")
      Icon = EXTENSION_ICONS[ext] || IconDefault
    }
  } else if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, "")
    Icon = EXTENSION_ICONS[ext] || IconDefault
  }

  return <Icon className={`inline-block ${className}`} {...props} />
}

// Export for use in statistics
export function getIconForExtension(extension: string): IconComponent {
  const ext = extension.toLowerCase().replace(/^\./, "")
  return EXTENSION_ICONS[ext] || IconDefault
}

export { IconFolder, IconFolderOpen, IconDefault }
