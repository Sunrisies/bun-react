import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Info, Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export const Route = createRootRoute({
  component: Root,
})
function Root() {
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("THEME")
      if (saved === "dark") return true
      if (saved === "light") return false
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    } catch {
      return false
    }
  })
  useEffect(() => {
    if (import.meta.env.PROD) {
      const script = document.createElement('script')
      script.src = 'https://umami.sunrise1024.top/script.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'  // 添加这一行
      script.setAttribute('data-website-id', 'c25cfa97-82b1-4a9e-b8bf-c52222f0a8c8')
      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [])
  useEffect(() => {
    try {
      const root = document.documentElement
      if (isDark) {
        root.classList.add("dark")
        localStorage.setItem("THEME", "dark")
      } else {
        root.classList.remove("dark")
        localStorage.setItem("THEME", "light")
      }
    } catch { void 0 }
  }, [isDark])
  return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-100 flex items-center border-b border-border bg-background shadow-sm px-4">
        <div className="container max-w-[1440px] mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold py-4">sunrise工具库</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              { isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" /> }
              <Switch checked={ isDark } onCheckedChange={ setIsDark } />
            </div>
            <Button
              onClick={ () => navigate({ to: "/about" }) }
              variant="ghost"
              className="flex items-center gap-2"
            >
              <Info className="h-4 w-4" />
              关于项目
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      { import.meta.env.MODE === "development" && <TanStackRouterDevtools /> }
    </main>
  )
}
