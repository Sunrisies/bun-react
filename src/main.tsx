import { router } from '@/plugins/router'
import { RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"
import "./index.css"
import { ThemeProvider } from '@/components/theme-provider'

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <StrictMode>
        <Toaster position="top-center" />
        <RouterProvider router={ router } />
      </StrictMode>
    </ThemeProvider>

  )
}

