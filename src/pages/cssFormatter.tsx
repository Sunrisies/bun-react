import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/cssFormatter')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/cssFormatter"!</div>
}
