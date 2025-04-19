import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: Root,
});
function Root() {
  return (
    <main className="flex flex-col h-full">
      <header className="sticky top-0 z-10 flex justify-center border-b border-gray-200 bg-white shadow-sm">
        <h1 className="text-2xl font-bold py-4">sunrise工具库</h1>
      </header>
      <div className="flex-1">
        <Outlet />
      </div>
      {import.meta.env.MODE === "development" && <TanStackRouterDevtools />}
    </main>
  );
}
