import type { SVGProps } from 'react';

// VS Code Icons imports
import IconTypeScript from '~icons/vscode-icons/file-type-typescript';
import IconTypeScriptReact from '~icons/vscode-icons/file-type-reactts';
import IconJavaScript from '~icons/vscode-icons/file-type-js-official';
import IconJavaScriptReact from '~icons/vscode-icons/file-type-reactjs';
import IconJson from '~icons/vscode-icons/file-type-json';
import IconMarkdown from '~icons/vscode-icons/file-type-markdown';
import IconCss from '~icons/vscode-icons/file-type-css';
import IconScss from '~icons/vscode-icons/file-type-scss';
import IconHtml from '~icons/vscode-icons/file-type-html';
import IconSvg from '~icons/vscode-icons/file-type-svg';
import IconImage from '~icons/vscode-icons/file-type-image';
import IconYaml from '~icons/vscode-icons/file-type-yaml';
import IconToml from '~icons/vscode-icons/file-type-toml';
import IconGit from '~icons/vscode-icons/file-type-git';
import IconPython from '~icons/vscode-icons/file-type-python';
import IconRust from '~icons/vscode-icons/file-type-rust';
import IconGo from '~icons/vscode-icons/file-type-go';
import IconJava from '~icons/vscode-icons/file-type-java';
import IconCpp from '~icons/vscode-icons/file-type-cpp3';
import IconC from '~icons/vscode-icons/file-type-c3';
import IconShell from '~icons/vscode-icons/file-type-shell';
import IconDocker from '~icons/vscode-icons/file-type-docker2';
import IconVue from '~icons/vscode-icons/file-type-vue';
import IconSvelte from '~icons/vscode-icons/file-type-svelte';
import IconPhp from '~icons/vscode-icons/file-type-php3';
import IconRuby from '~icons/vscode-icons/file-type-ruby';
import IconSwift from '~icons/vscode-icons/file-type-swift';
import IconKotlin from '~icons/vscode-icons/file-type-kotlin';
import IconGraphql from '~icons/vscode-icons/file-type-graphql';
import IconSql from '~icons/vscode-icons/file-type-sql';
import IconText from '~icons/vscode-icons/file-type-text';
import IconXml from '~icons/vscode-icons/file-type-xml';
import IconZip from '~icons/vscode-icons/file-type-zip';
import IconLicense from '~icons/vscode-icons/file-type-license';
import IconReadme from '~icons/vscode-icons/file-type-markdown';
import IconPackageJson from '~icons/vscode-icons/file-type-npm';
import IconEslint from '~icons/vscode-icons/file-type-eslint';
import IconPrettier from '~icons/vscode-icons/file-type-prettier';
import IconVite from '~icons/vscode-icons/file-type-vite';
import IconTailwind from '~icons/vscode-icons/file-type-tailwind';
import IconDefault from '~icons/vscode-icons/default-file';
import IconFolder from '~icons/vscode-icons/default-folder';
import IconFolderOpen from '~icons/vscode-icons/default-folder-opened';

type IconComponent = React.ComponentType<SVGProps<SVGSVGElement>>;

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
  '7z': IconZip,

  // Lock files
  lock: IconJson,

  // Environment
  env: IconGit,

  // Git
  gitignore: IconGit,
  gitattributes: IconGit,
};

const FILENAME_ICONS: Record<string, IconComponent> = {
  'package.json': IconPackageJson,
  'package-lock.json': IconPackageJson,
  'pnpm-lock.yaml': IconPackageJson,
  'yarn.lock': IconPackageJson,
  'tsconfig.json': IconTypeScript,
  '.eslintrc': IconEslint,
  '.eslintrc.js': IconEslint,
  '.eslintrc.json': IconEslint,
  'eslint.config.js': IconEslint,
  'eslint.config.mjs': IconEslint,
  '.prettierrc': IconPrettier,
  '.prettierrc.js': IconPrettier,
  '.prettierrc.json': IconPrettier,
  'prettier.config.js': IconPrettier,
  'vite.config.ts': IconVite,
  'vite.config.js': IconVite,
  'tailwind.config.js': IconTailwind,
  'tailwind.config.ts': IconTailwind,
  'license': IconLicense,
  'license.md': IconLicense,
  'license.txt': IconLicense,
  'readme': IconReadme,
  'readme.md': IconReadme,
  'readme.txt': IconReadme,
  'dockerfile': IconDocker,
  '.dockerignore': IconDocker,
  '.gitignore': IconGit,
  '.gitattributes': IconGit,
  '.env': IconGit,
  '.env.local': IconGit,
  '.env.development': IconGit,
  '.env.production': IconGit,
};

interface FileIconProps extends SVGProps<SVGSVGElement> {
  filename?: string;
  extension?: string;
  isFolder?: boolean;
  isOpen?: boolean;
}

export function FileIcon({
  filename,
  extension,
  isFolder = false,
  isOpen = false,
  className = '',
  ...props
}: FileIconProps) {
  let Icon: IconComponent = IconDefault;

  if (isFolder) {
    Icon = isOpen ? IconFolderOpen : IconFolder;
  } else if (filename) {
    const lowerFilename = filename.toLowerCase();

    // Check for exact filename match first
    if (FILENAME_ICONS[lowerFilename]) {
      Icon = FILENAME_ICONS[lowerFilename];
    } else if (extension) {
      // Then check by extension
      const ext = extension.toLowerCase().replace(/^\./, '');
      Icon = EXTENSION_ICONS[ext] || IconDefault;
    }
  } else if (extension) {
    const ext = extension.toLowerCase().replace(/^\./, '');
    Icon = EXTENSION_ICONS[ext] || IconDefault;
  }

  return <Icon className={`inline-block ${className}`} {...props} />;
}

// Export for use in statistics
export function getIconForExtension(extension: string): IconComponent {
  const ext = extension.toLowerCase().replace(/^\./, '');
  return EXTENSION_ICONS[ext] || IconDefault;
}

export { IconFolder, IconFolderOpen, IconDefault };
