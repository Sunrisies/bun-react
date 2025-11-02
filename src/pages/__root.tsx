import { Button } from "@/components/ui/button"
import { createRootRoute, Outlet, useNavigate } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { Info } from "lucide-react"

export const Route = createRootRoute({
  component: Root,
})
function Root() {
  const navigate = useNavigate()
  return (
    <main className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 flex items-center border-b border-gray-200 bg-white shadow-sm px-4">
        <div className="container max-w-[1440px] mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold py-4">sunrise工具库</h1>
          <Button
            onClick={ () => navigate({ to: "/about" }) }
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Info className="h-4 w-4" />
            关于项目
          </Button>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
      { import.meta.env.MODE === "development" && <TanStackRouterDevtools /> }
    </main>
  )
}
