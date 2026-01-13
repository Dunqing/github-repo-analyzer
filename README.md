<p align="center">
  <img src="public/logo.svg" alt="GitHub Repo Analyzer Logo" width="128" height="128">
</p>

# GitHub Repo Analyzer

A web tool to analyze the file structure and statistics of any public GitHub repository. Built with modern web technologies and a clean 2026 design aesthetic.

## Features

### Input Formats

- Short format: `owner/repo` (e.g., `facebook/react`)
- Full URL: `https://github.com/owner/repo`

### File Tree View

- Interactive expandable/collapsible directory tree
- VS Code file icons for 40+ file types
- Folder icons with open/closed states
- File and folder count displayed per directory
- Auto-expands first 2 levels by default

### Statistics View

- Total files count
- Total directories count
- Number of unique file types
- File type distribution with visual bar chart
- VS Code icons for each file type

### Smart Filtering

Automatically ignores common non-essential directories:

- `.git`, `node_modules`, `.next`, `dist`, `build`, `.cache`, `__pycache__`, `.venv`, `venv`

### Modern UI/UX

- **2026 Color Palette**: Cloud Dancer, Mocha Mousse, Digital Lavender, Deep Teal
- **Dark Mode**: Automatically detects system preference
- **Responsive Design**: Works on desktop and mobile
- Loading states with progress indicators
- Friendly error messages

## Tech Stack

- **Vite 8** (beta) - Next-generation frontend tooling
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **unplugin-icons** - VS Code icons via Iconify
- **GitHub REST API** - Repository data fetching

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/user/github-repo-analyzer.git
cd github-repo-analyzer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Build for Production

```bash
pnpm build
pnpm preview
```

## Usage

1. Open the app in your browser
2. Enter a GitHub repository in one of these formats:
   - `facebook/react`
   - `https://github.com/facebook/react`
3. Click "Analyze" or press Enter
4. Explore the file tree and statistics

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for planned features.

## License

MIT
