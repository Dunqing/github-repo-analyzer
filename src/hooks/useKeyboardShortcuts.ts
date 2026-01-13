import { useEffect } from "react"

export interface KeyboardShortcutHandlers {
  onFocusSearch?: () => void
  onFocusRepoInput?: () => void
  onAnalyze?: () => void
  onCopyTree?: () => void
  onClearSearch?: () => void
}

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName
  return tag === "INPUT" || tag === "TEXTAREA"
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey

      // Ctrl/Cmd + K - Focus tree search input
      if (isMod && e.key === "k") {
        e.preventDefault()
        handlers.onFocusSearch?.()
        return
      }

      // Escape - Clear search / close dropdowns
      if (e.key === "Escape") {
        handlers.onClearSearch?.()
        return
      }

      // / - Focus repo input (only when not in an input)
      if (e.key === "/" && !isInputFocused()) {
        e.preventDefault()
        handlers.onFocusRepoInput?.()
        return
      }

      // Ctrl/Cmd + Enter - Analyze repo
      if (isMod && e.key === "Enter") {
        e.preventDefault()
        handlers.onAnalyze?.()
        return
      }

      // Ctrl/Cmd + Shift + C - Copy tree (only when not in an input to avoid conflict with normal copy)
      if (isMod && e.shiftKey && e.key === "C") {
        e.preventDefault()
        handlers.onCopyTree?.()
        return
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handlers])
}
