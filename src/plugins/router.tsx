import { routeTree } from "@/routeTree.gen"
import { Link, createRouter } from "@tanstack/react-router"

export const router = createRouter({
  routeTree, defaultNotFoundComponent: () => {
    return (
      <div>
        <p>Not found!</p>
        <Link to="/">Go home</Link>
      </div>
    )
  }
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}