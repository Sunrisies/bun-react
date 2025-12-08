import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { compileString } from 'sass'
import { Input } from "@/components/ui/input"
import { copyToClipboard } from "@/lib/utils"
export const Route = createFileRoute("/scssConverter")({
  component: ScssConverter,
})

function ScssConverter() {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.scss')) {
      toast.error('请上传.scss文件')
      return
    }

    try {
      const text = await file.text()
      setInput(text)
      convertScss()
    } catch (err) {
      console.error("文件读取失败", err)
      toast.error('文件读取失败')
    }
  }

  // 添加压缩选项
  const [compress, setCompress] = useState(false)

  // 修改转换函数
  const convertScss = () => {
    try {
      if (!input.trim()) {
        setOutput("")
        setError(null)
        return
      }

      const result = compileString(input, {
        style: compress ? "compressed" : "expanded"
      })
      setOutput(result.css)
      setError(null)
    } catch (err) {
      console.error("SCSS 转 CSS 失败", err)
      setError("SCSS 格式无效，请检查输入")
      setOutput("")
    }
  }

  const downloadCss = () => {
    try {
      const blob = new Blob([output], { type: "text/css" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "converted.css"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("下载失败", err)
      toast.error("下载失败")
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <Card className="w-full max-w-[90%] m-auto flex flex-col h-[90%]">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>SCSS 转 CSS 工具</CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-6 h-full flex flex-col overflow-hidden">
            {/* 文件上传和操作按钮 - 固定在顶部 */ }
            <div className="flex justify-between items-center flex-shrink-0">
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  accept=".scss"
                  onChange={ handleFileUpload }
                  className="max-w-xs"
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="compress"
                    checked={ compress }
                    onChange={ (e) => setCompress(e.target.checked) }
                    className="h-4 w-4"
                  />
                  <label htmlFor="compress" className="text-sm">压缩输出</label>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={ convertScss } size="sm">
                  转换
                </Button>
                <Button
                  onClick={ () => copyToClipboard }
                  size="sm"
                  variant="outline"
                  disabled={ !output }
                >
                  <Copy className="h-4 w-4 mr-2" />
                  复制
                </Button>
                <Button
                  onClick={ downloadCss }
                  size="sm"
                  variant="outline"
                  disabled={ !output }
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
            </div>

            {/* 文件拖放提示 - 固定在顶部 */ }
            <div className="border-2 border-dashed rounded-lg p-4 text-center text-gray-500 flex-shrink-0">
              <p>支持将.scss文件拖放到输入框中</p>
            </div>

            {/* 编辑区域 - 可滚动 */ }
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 overflow-hidden">
              {/* 左侧输入 */ }
              <div className="space-y-2 overflow-hidden flex flex-col">
                <label className="text-sm font-medium flex-shrink-0">输入 SCSS</label>
                <Textarea
                  placeholder="请输入需要转换的 SCSS..."
                  value={ input }
                  onChange={ (e) => setInput(e.target.value) }
                  className="flex-1 overflow-auto resize-none"
                />
              </div>

              {/* 右侧输出 */ }
              <div className="space-y-2 overflow-hidden flex flex-col">
                <label className="text-sm font-medium flex-shrink-0">转换结果</label>
                <Textarea
                  value={ output }
                  readOnly
                  className="flex-1 overflow-auto resize-none bg-gray-50"
                  placeholder="转换后的 CSS 将显示在这里..."
                />
              </div>
            </div>

            {/* 错误提示和提示信息 - 固定在底部 */ }
            <div className="flex-shrink-0">
              { error && (
                <div className="p-4 bg-red-50 rounded-lg mb-4">
                  <p className="text-sm text-red-600">{ error }</p>
                </div>
              ) }
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  提示：此工具可以帮助您将 SCSS 代码转换为普通的 CSS 代码。支持复制转换后的结果或下载为文件。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}