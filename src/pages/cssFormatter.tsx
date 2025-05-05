import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/cssFormatter")({
  component: CssFormatter,
});

function CssFormatter() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatCSS = () => {
    try {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        return;
      }

      // 移除多余的空白字符
      let css = input.trim();
      
      // 移除注释
      css = css.replace(/\/\*[\s\S]*?\*\//g, "");
      
      // 处理选择器和规则
      css = css
        .replace(/\s*{\s*/g, " {\n  ") // 处理开括号
        .replace(/\s*}\s*/g, "\n}\n") // 处理闭括号
        .replace(/;\s*/g, ";\n  ") // 处理分号
        .replace(/,\s*/g, ", ") // 处理逗号
        .replace(/\n\s*\n/g, "\n") // 移除多余的空行
        .trim();

      setOutput(css);
      setError(null);
    } catch (err) {
      setError("CSS 格式无效，请检查输入");
      setOutput("");
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast.success("已复制到剪贴板");
    } catch (err) {
      toast.error("复制失败");
    }
  };

  const downloadCss = () => {
    try {
      const blob = new Blob([output], { type: "text/css" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "formatted.css";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("下载失败");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.css')) {
      toast.error('请上传.css文件');
      return;
    }

    try {
      const text = await file.text();
      setInput(text);
      formatCSS();
    } catch (err) {
      toast.error('文件读取失败');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <Card className="w-full max-w-[90%] m-auto flex flex-col h-[90%]">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>CSS 格式化工具</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="space-y-4 h-full flex flex-col overflow-hidden">
            {/* 文件上传和操作按钮 */}
            <div className="flex justify-between gap-6 items-center flex-shrink-0 pb-4 border-b">
              <div className="flex items-center gap-6">
                <Input
                  type="file"
                  accept=".css"
                  onChange={handleFileUpload}
                  className="max-w-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={formatCSS} size="sm">
                  格式化
                </Button>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  disabled={!output}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </Button>
                <Button
                  onClick={downloadCss}
                  size="sm"
                  variant="outline"
                  disabled={!output}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
            </div>

            {/* 文件拖放提示 */}
            <div className="border-2 border-dashed rounded-lg p-3 text-center text-gray-500 flex-shrink-0 bg-gray-50/50">
              <p className="text-sm">支持将.css文件拖放到输入框中</p>
            </div>

            {/* 左右布局的编辑区域 */}
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-6 overflow-hidden">
              <div className="space-y-2 overflow-hidden flex flex-col">
                <label className="text-sm font-medium flex-shrink-0">输入 CSS</label>
                <Textarea
                  placeholder="请输入需要格式化的 CSS..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 overflow-auto resize-none font-mono p-4"
                />
              </div>

              <div className="space-y-2 overflow-hidden flex flex-col">
                <label className="text-sm font-medium flex-shrink-0">格式化结果</label>
                <Textarea
                  value={output}
                  readOnly
                  className="flex-1 overflow-auto resize-none bg-gray-50 font-mono p-4"
                  placeholder="格式化后的 CSS 将显示在这里..."
                />
              </div>
            </div>

            {/* 错误提示和说明 */}
            <div className="flex-shrink-0 space-y-3">
              {error && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  提示：此工具可以帮助您格式化 CSS 代码，使其更易读。支持复制格式化后的结果或下载为文件。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
