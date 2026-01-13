import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import { ThemeProvider } from "@/components/theme-provider"
import { SWRCacheProvider } from "@/lib/swr-cache-provider"

import App from "./App.tsx"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SWRCacheProvider>
      <ThemeProvider defaultTheme="system" storageKey="repo-analyzer-theme">
        <App />
      </ThemeProvider>
    </SWRCacheProvider>
  </StrictMode>,
)
