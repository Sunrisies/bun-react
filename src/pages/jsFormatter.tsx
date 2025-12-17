import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { js as beautify } from 'js-beautify'
import { downloadLocalFile } from "sunrise-utils"
import { copyToClipboard } from "@/lib/utils"

export const Route = createFileRoute("/jsFormatter")({
  component: JsFormatter,
})

function JsFormatter() {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.js') && !file.name.endsWith('.jsx')) {
      toast.error('请上传.js或.jsx文件')
      return
    }

    try {
      const text = await file.text()
      setInput(text)
      formatJs(text)
    } catch (err) {
      console.error("文件读取失败", err)
      toast.error('文件读取失败')
    }
  }

  const formatJs = (text: string = input) => {
    try {
      if (!text.trim()) {
        setOutput("")
        setError(null)
        return
      }

      const formatted = beautify(text, {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        // indent_scripts: 'normal',
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: true,
        wrap_line_length: 0,
        // indent_inner_html: false,
        comma_first: false,
        e4x: false,
        indent_empty_lines: false,
        // end_with_semicolon: semicolons,
      })
      setOutput(formatted)
      setError(null)
    } catch (err) {
      console.error(err)
      setError("JavaScript 格式无效，请检查输入")
      setOutput("")
    }
  }

  const downloadJs = () => {
    try {
      const blob = new Blob([output], { type: "text/javascript" })
      downloadLocalFile(blob, "formatted.js")
      toast.success("下载成功")
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
            <CardTitle className="dark:text-gray-100">JavaScript 格式化工具</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="space-y-6 h-full flex flex-col overflow-hidden">
            {/* 文件上传和操作按钮 */ }
            <div className="flex justify-between items-center flex-shrink-0">
              <div className="flex gap-4 items-center">
                <Input
                  type="file"
                  accept=".js,.jsx"
                  onChange={ handleFileUpload }
                  className="max-w-xs"
                />

              </div>
              <div className="flex gap-2">
                <Button onClick={ () => formatJs() } size="sm">
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
                  onClick={ downloadJs }
                  size="sm"
                  variant="outline"
                  disabled={ !output }
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
            </div>

            {/* 文件拖放提示 */ }
            <div className="border-2 border-dashed rounded-lg p-4 text-center text-gray-500 flex-shrink-0">
              <p>支持将.js或.jsx文件拖放到输入框中</p>
            </div>

            {/* 编辑区域 */ }
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-4 overflow-hidden">
              <div className="space-y-2 overflow-hidden flex flex-col">
                <label className="text-sm font-medium flex-shrink-0">输入 JavaScript</label>
                <Textarea
                  placeholder="请输入需要格式化的 JavaScript 代码..."
                  value={ input }
                  onChange={ (e) => {
                    setInput(e.target.value)
                    // 移除实时格式化，改为手动触发
                  } }
                  className="flex-1 overflow-auto resize-none font-mono"
                />
              </div>

              <div className="space-y-2 overflow-hidden flex flex-col">
                <label className="text-sm font-medium flex-shrink-0">格式化结果</label>
                <Textarea
                  value={ output }
                  readOnly
                  className="flex-1 overflow-auto resize-none bg-gray-50 font-mono"
                  placeholder="格式化后的代码将显示在这里..."
                />
              </div>
            </div>

            {/* 错误提示和说明 */ }
            <div className="flex-shrink-0">
              { error && (
                <div className="p-4 bg-red-50 rounded-lg mb-4">
                  <p className="text-sm text-red-600">{ error }</p>
                </div>
              ) }
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  提示：此工具可以帮助您格式化 JavaScript 代码，支持自定义格式化选项。可以通过复制或下载获取格式化后的代码。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}