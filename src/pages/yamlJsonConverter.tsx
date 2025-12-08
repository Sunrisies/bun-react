import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import yaml from 'js-yaml'
import { copyToClipboard } from "@/lib/utils"
import { downloadLocalFile } from "sunrise-utils"

export const Route = createFileRoute("/yamlJsonConverter")({
  component: YamlJsonConverter,
})

function YamlJsonConverter() {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const convertJsonToYaml = () => {
    try {
      if (!input.trim()) {
        setOutput("")
        setError(null)
        return
      }

      // 尝试解析JSON
      const parsed = JSON.parse(input)
      // 转换为YAML
      const yamlOutput = yaml.dump(parsed, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
      })
      setOutput(yamlOutput)
      setError(null)
    } catch (err) {
      console.error("JSON 转 YAML 失败", err)
      setError("JSON 格式无效，请检查输入")
      setOutput("")
    }
  }

  const convertYamlToJson = () => {
    try {
      if (!input.trim()) {
        setOutput("")
        setError(null)
        return
      }

      // 尝试解析YAML
      const parsed = yaml.load(input)
      // 转换为格式化的JSON
      const jsonOutput = JSON.stringify(parsed, null, 2)
      setOutput(jsonOutput)
      setError(null)
    } catch (err) {
      console.error("YAML 转 JSON 失败", err)
      setError("YAML 格式无效，请检查输入")
      setOutput("")
    }
  }

  const downloadResult = () => {
    try {
      const extension = output.trim().startsWith("{") ? "json" : "yaml"
      const blob = new Blob([output], { type: "text/plain" })
      downloadLocalFile(blob, `converted.${extension}`)
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
            <CardTitle>YAML/JSON 转换工具</CardTitle>
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
              <Button onClick={ convertJsonToYaml } size="sm">
                JSON 转 YAML
              </Button>
              <Button onClick={ convertYamlToJson } size="sm">
                YAML 转 JSON
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
                onClick={ downloadResult }
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
                <label className="text-sm font-medium">输入</label>
                <Textarea
                  placeholder="请输入 YAML 或 JSON 内容..."
                  value={ input }
                  onChange={ (e) => {
                    setInput(e.target.value)
                    setError(null)
                  } }
                  className="min-h-[500px] font-mono"
                />
              </div>

              {/* 右侧输出 */ }
              <div className="space-y-2">
                <label className="text-sm font-medium">转换结果</label>
                <Textarea
                  value={ output }
                  readOnly
                  className="min-h-[500px] font-mono bg-gray-50"
                  placeholder="转换结果将显示在这里..."
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
                提示：此工具可以在 YAML 和 JSON 格式之间进行转换。支持复制转换后的结果或下载为文件。如果输入格式有误，工具会提示错误信息。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}