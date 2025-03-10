import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

export const Route = createRootRoute({
	component: () => (
		<>
			<main className="flex flex-col ">
				{/* <div className="p-2 flex gap-2 h-14">
					<Link to="/" className="[&.active]:font-bold">
						Home
					</Link>{" "}
					<Link to="/about" className="[&.active]:font-bold">
						About
					</Link>
					<Link to="/jsonToTs" className="[&.active]:font-bold">
						json转TypeScript
					</Link>
				</div> */}
				<Outlet />
				<TanStackRouterDevtools />
			</main>
		</>
	),
})
