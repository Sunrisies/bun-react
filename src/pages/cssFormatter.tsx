import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

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

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>CSS 格式化工具</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 操作按钮 */}
            <div className="flex justify-end gap-2">
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

            {/* 左右布局的编辑区域 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 左侧输入 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">输入 CSS</label>
                <Textarea
                  placeholder="请输入需要格式化的 CSS..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="min-h-[500px] font-mono"
                />
              </div>

              {/* 右侧输出 */}
              <div className="space-y-2">
                <label className="text-sm font-medium">格式化结果</label>
                <Textarea
                  value={output}
                  readOnly
                  className="min-h-[500px] font-mono bg-gray-50"
                  placeholder="格式化后的 CSS 将显示在这里..."
                />
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* 提示信息 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                提示：此工具可以帮助您格式化 CSS 代码，使其更易读。支持复制格式化后的结果或下载为文件。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
