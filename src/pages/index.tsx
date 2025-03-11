import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  const list = [
    { title: 'jsonToTs', description: '将JSON转换为TypeScript interface 类型定义', path: '/jsonToTs' },
    { title: 'signature', description: '签名生成器', path: '/signature' },
    { title: 'jsonToTsx', description: 'Convert JSON to TypeScript React component', path: '/jsonToTsx' },
    { title: 'jsonToTsx', description: 'Convert JSON to TypeScript React component', path: '/jsonToTsx' },
    { title: 'jsonToTsx', description: 'Convert JSON to TypeScript React component', path: '/jsonToTsx' },
    { title: 'jsonToTsx', description: 'Convert JSON to TypeScript React component', path: '/jsonToTsx' },
  ]
  return (
    <main className="flex justify-center  h-screen pt-10">
      <div className="grid grid-cols-3 md:grid-cols-4 grid-rows-2 md:grid-rows-4 gap-4 ">
        { list.map((item) => {
          return (
            <Card className="h-[200px] w-[300px] cursor-pointer hover:translate-y-[-5px] transition-all duration-300 border-2 border-gray-300 rounded-md border drop-shadow-sm " onClick={ () => navigate({ to: item.path }) }>
              <CardHeader>
                <CardTitle>{ item.title }</CardTitle>
                <CardDescription>{ item.description }</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{ item.description }</p>
              </CardContent>
            </Card>
          )
        }) }
      </div>
    </main >
  )
}
