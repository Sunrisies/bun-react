import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { useDynamicGrid } from "@/hooks/useDynamicGrid"
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Info } from "lucide-react"
import { useEffect } from "react"

export const Route = createRootRoute({
  component: Root,
})
function Root() {
  const navigate = useNavigate()

  // 使用hook的方式
  const { canvasRef } = useDynamicGrid({
    gridSize: 25,
    speed: 0.25,
    borderColor: "#64748b",
    directionChangeInterval: 3000,
    animate: true
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

  return (
    <main className="flex flex-col min-h-screen">
      {/* Enhanced Canvas Background with gradient overlay */ }
      <div className="fixed inset-0 overflow-hidden">

        <canvas
          ref={ canvasRef }
          className="w-full h-full"
          style={ { display: 'block', } }
        />
        {/* Gradient overlay for better readability */ }
        <div className="fixed inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/20 dark:from-gray-900/40 dark:via-transparent dark:to-gray-900/20 pointer-events-none"></div>
        {/* Ambient glow effects */ }
        <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-float-slow pointer-events-none"></div>
        <div className="fixed bottom-[-10%] left-[-5%] w-80 h-80 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-float-medium pointer-events-none"></div>
      </div>

      <header className="sticky top-0 z-100 flex items-center border-b border-border bg-background shadow-sm px-4">
        <div className="container max-w-[1440px] mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold py-4">sunrise工具库</h1>
          <div className="flex items-center gap-4">
            <ModeToggle></ModeToggle>
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
      <div className="flex-1 overflow-hidden z-10">
        <Outlet />
      </div>
      { import.meta.env.MODE === "development" && <TanStackRouterDevtools /> }
    </main>
  )
}
