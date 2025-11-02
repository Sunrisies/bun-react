import { router } from '@/plugins/router'
import { RouterProvider } from "@tanstack/react-router"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"
import "./index.css"
// import "./styles/globals.css"

const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement)
  root.render(
    <StrictMode>
      { import.meta.env.PROD && <script defer src="http://api.chaoyang1024.top:30033/script.js" data-website-id="c25cfa97-82b1-4a9e-b8bf-c52222f0a8c8"></script> }
      <Toaster position="top-center" />
      <RouterProvider router={ router } />
    </StrictMode>,
  )
}

