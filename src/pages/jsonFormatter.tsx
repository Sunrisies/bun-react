import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { downloadLocalFile } from "sunrise-utils"
import { copyToClipboard } from "@/lib/utils"

export const Route = createFileRoute("/jsonFormatter")({
  component: JsonFormatter,
})

function JsonFormatter() {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const formatJson = () => {
    try {
      if (!input.trim()) {
        setOutput("")
        setError(null)
        return
      }

      // 尝试解析JSON
      const parsed = JSON.parse(input)
      // 格式化输出，使用2个空格缩进
      const formatted = JSON.stringify(parsed, null, 2)
      setOutput(formatted)
      setError(null)
    } catch (err) {
      console.error("JSON 格式化失败", err)
      setError("JSON 格式无效，请检查输入")
      setOutput("")
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    setError(null)
  }

  const downloadJson = () => {
    try {
      const blob = new Blob([output], { type: "application/json" })
      downloadLocalFile(blob, "formatted.json")
      toast.success("下载成功")
    } catch (err) {
      console.error("下载失败", err)
      toast.error("下载失败")
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>JSON 格式化工具</CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 操作按钮 */ }
            <div className="flex justify-end gap-2">
              <Button onClick={ formatJson } size="sm">
                格式化
              </Button>
              <Button
                onClick={ () => copyToClipboard(output) }
                size="sm"
                variant="outline"
                disabled={ !output }
              >
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
              <Button
                onClick={ downloadJson }
                size="sm"
                variant="outline"
                disabled={ !output }
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>

            {/* 左右布局的编辑区域 */ }
            <div className="grid grid-cols-2 gap-4">
              {/* 左侧输入 */ }
              <div className="space-y-2">
                <label className="text-sm font-medium">输入 JSON</label>
                <Textarea
                  placeholder="请输入需要格式化的 JSON..."
                  value={ input }
                  onChange={ (e) => handleInputChange(e.target.value) }
                  className="min-h-[500px] font-mono"
                />
              </div>

              {/* 右侧输出 */ }
              <div className="space-y-2">
                <label className="text-sm font-medium">格式化结果</label>
                <Textarea
                  value={ output }
                  readOnly
                  className="min-h-[500px] font-mono bg-gray-50"
                  placeholder="格式化后的 JSON 将显示在这里..."
                />
              </div>
            </div>

            {/* 错误提示 */ }
            { error && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{ error }</p>
              </div>
            ) }

            {/* 提示信息 */ }
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                提示：此工具可以帮助您格式化 JSON 数据，使其更易读。支持复制格式化后的结果或下载为文件。如果输入的 JSON 格式有误，工具会提示错误信息。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}