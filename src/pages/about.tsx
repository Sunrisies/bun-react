import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  const navigate = useNavigate();
  const techStack = [
    {
      name: "Bun",
      version: "1.0.x",
      description: "JavaScript 运行时和工具链",
    },
    {
      name: "React",
      version: "19",
      description: "用于构建用户界面的 JavaScript 库",
    },
    {
      name: "TypeScript",
      version: "5.7.2",
      description: "JavaScript 的超集，添加了类型系统",
    },
    {
      name: "Vite",
      version: "6.2.0",
      description: "现代前端构建工具",
    },
    {
      name: "TanStack Router",
      version: "1.114.4",
      description: "类型安全的路由解决方案",
    },
    {
      name: "Tailwind CSS",
      version: "4.0.11",
      description: "实用优先的 CSS 框架",
    },
    {
      name: "shadcn/ui",
      version: "latest",
      description: "基于 Radix UI 和 Tailwind 的组件库",
    },
  ];

  return (
    <main className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">关于项目</h1>
          <Button onClick={() => navigate({ to: "/" })} variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">作者信息</h2>
          <Card>
            <CardHeader>
              <CardTitle>朝阳</CardTitle>
              <CardDescription>全栈开发工程师</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                专注于现代 Web 技术栈，致力于打造高质量的开发工具和实用程序。
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">技术栈</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {techStack.map((tech) => (
              <Card key={tech.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{tech.name}</CardTitle>
                  <CardDescription>版本: {tech.version}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{tech.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">项目特点</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>现代化技术栈</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  采用最新的 React 19、TypeScript 5.7.2 和 Vite 6.2.0，确保最佳的开发体验和性能表现。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>类型安全</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  全面使用 TypeScript，配合 TanStack Router 实现端到端的类型安全。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>优秀的UI组件</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  使用 shadcn/ui 和 Tailwind CSS 构建美观且响应式的用户界面。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
