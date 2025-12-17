import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import packageJson from '../../package.json';

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  console.log(packageJson, 'packageJson')
  const navigate = useNavigate();

  // 从 package.json 中提取依赖信息
  const techStack = [
    {
      name: "Bun",
      version: packageJson.dependencies["@ffmpeg/core"]?.replace("^", "") || "1.0.x",
      description: "JavaScript 运行时和工具链",
    },
    {
      name: "React",
      version: packageJson.dependencies["react"]?.replace("^", "") || "19",
      description: "用于构建用户界面的 JavaScript 库",
    },
    {
      name: "TypeScript",
      version: packageJson.devDependencies["typescript"]?.replace("~", "") || "5.7.2",
      description: "JavaScript 的超集，添加了类型系统",
    },
    {
      name: "Vite",
      version: packageJson.devDependencies["vite"]?.replace("^", "") || "6.2.0",
      description: "现代前端构建工具",
    },
    {
      name: "TanStack Router",
      version: packageJson.dependencies["@tanstack/react-router"]?.replace("^", "") || "1.114.4",
      description: "类型安全的路由解决方案",
    },
    {
      name: "Tailwind CSS",
      version: packageJson.dependencies["tailwindcss"]?.replace("^", "") || "4.0.11",
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
          <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="dark:hover:bg-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回首页
          </Button>
        </div>

        <section className="mb-4">
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
        <section className="mb-4">
          <h2 className="text-2xl font-semibold mb-4">项目简介</h2>
          <p className="text-gray-600">
            本项目是一个现代化的前端开发工具库，旨在提供丰富的功能和实用程序，以简化开发过程。
          </p>
          <p>版本: {packageJson.version}</p>
          <div className="mt-4">
            <p className="font-medium">GitHub 仓库：</p>
            <a 
              href="https://github.com/Sunrisies/bun-react" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              github.com/Sunrisies/bun-react
            </a>
          </div>
        </section>

        <section className="mb-4">
          <h2 className="text-2xl font-semibold mb-4">更新日志</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-600">
                请访问我们的 GitHub 仓库查看完整的提交记录和更新历史：
                <a 
                  href="https://github.com/Sunrisies/bun-react/commits/main" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  查看更新记录
                </a>
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-4">
          <h2 className="text-2xl font-semibold mb-4">贡献指南</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <p className="text-gray-600">
                  我们欢迎社区成员为项目做出贡献！以下是参与贡献的基本步骤：
                </p>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Fork 项目到您的 GitHub 账号</li>
                  <li>创建您的特性分支 (git checkout -b feature/AmazingFeature)</li>
                  <li>提交您的更改 (git commit -m 'Add some AmazingFeature')</li>
                  <li>推送到您的分支 (git push origin feature/AmazingFeature)</li>
                  <li>创建一个 Pull Request</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-4">
          <h2 className="text-2xl font-semibold mb-4">联系方式</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">微信：</span> 3266420686
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">GitHub：</span>
                  <a 
                    href="https://github.com/Sunrisies" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    @Sunrisies
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
        <section className="mb-4">
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

        <section className="mb-4">
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
