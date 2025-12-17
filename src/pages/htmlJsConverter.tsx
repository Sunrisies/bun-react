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


export const Route = createFileRoute("/htmlJsConverter")({
  component: HtmlJsConverter,
})

function HtmlJsConverter() {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)

  const convertHtmlToJs = (html: string) => {
    try {
      if (!html.trim()) {
        setOutput("")
        setError(null)
        return
      }

      // 移除多余的空白和换行
      const cleanHtml = html.trim().replace(/\s+/g, ' ')

      // 转换为 JavaScript 字符串
      const jsString = cleanHtml
        .replace(/'/g, "\\'")  // 转义单引号
        .replace(/"/g, '\\"') // 转义双引号

      // 生成 JavaScript 代码
      const jsCode = `const element = document.createElement('div');
element.innerHTML = "${jsString}";

// 使用模板字符串方式
const template = \`${cleanHtml}\`;

// 使用 innerHTML 方式
document.getElementById('container').innerHTML = \`${cleanHtml}\`;`
      console.log(jsCode, '========')
      const formattedCode = beautify(jsCode, {
        indent_size: 2,           // 缩进大小
        indent_char: ' ',         // 缩进字符
        max_preserve_newlines: 2, // 最多保留的空行数
        preserve_newlines: true,  // 是否保留现有的换行
        keep_array_indentation: false,  // 保持数组缩进
        break_chained_methods: false,   // 是否在链式方法调用处换行
        // indent_scripts: 'normal',       // 脚本缩进方式
        space_before_conditional: true, // 条件语句前的空格
        unescape_strings: false,        // 是否反转义字符串
        jslint_happy: false,           // 是否使用 JSLint 风格
        end_with_newline: true,        // 是否以换行结束
        wrap_line_length: 0,           // 每行最大长度，0表示不限制
        // indent_inner_html: false,      // 是否缩进 HTML
        comma_first: false,            // 逗号是否放在行首
        e4x: false,                    // 是否支持 E4X
        indent_empty_lines: false      // 是否缩进空行
      })
      setOutput(formattedCode)
      setError(null)
    } catch (err) {
      console.error("转换失败, 请检查输入的 HTML 代码", err)
      setError("转换失败，请检查输入的 HTML 代码")
      setOutput("")
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.html')) {
      toast.error('请上传.html文件')
      return
    }

    try {
      const text = await file.text()
      setInput(text)
      convertHtmlToJs(text)
    } catch (err) {
      console.error("文件读取失败", err)
      toast.error('文件读取失败')
    }
  }

  const downloadFile = () => {
    try {
      const blob = new Blob([output], { type: "text/javascript" })
      downloadLocalFile(blob, "converted.js")
      toast.success("下载成功")
    } catch (err) {
      console.error("下载失败", err)
      toast.error("下载失败")
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-[90%] m-auto flex flex-col h-[90%] dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="dark:text-gray-100">HTML 转 JavaScript 工具</CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="space-y-4 h-full flex flex-col overflow-hidden">
            {/* 文件上传和操作按钮 */ }
            <div className="flex justify-between gap-6 items-center flex-shrink-0 pb-4 border-b">
              <div className="flex items-center gap-6">
                <Input
                  type="file"
                  accept=".html"
                  onChange={ handleFileUpload }
                  className="max-w-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={ () => convertHtmlToJs(input) } size="sm">
                  转换
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
                  onClick={ downloadFile }
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
            <div className="border-2 border-dashed rounded-lg p-3 text-center text-gray-500 flex-shrink-0 bg-gray-50/50">
              <p className="text-sm">支持将.html文件拖放到输入框中</p>
            </div>

            {/* 左右布局的编辑区域 */ }
            <div className="flex-1 min-h-0 grid grid-cols-2 gap-6 overflow-hidden">
              <div className="space-y-2 overflow-hidden flex flex-col">
                <label className="text-sm font-medium flex-shrink-0">输入 HTML</label>
                <Textarea
                  placeholder="请输入HTML代码..."
                  value={ input }
                  onChange={ (e) => setInput(e.target.value) }
                  className="flex-1 overflow-auto resize-none font-mono p-4"
                />
              </div>

              <div className="space-y-2 overflow-hidden flex flex-col">
                <label className="text-sm font-medium flex-shrink-0">转换结果 (JavaScript)</label>
                <Textarea
                  value={ output }
                  readOnly
                  className="flex-1 overflow-auto resize-none bg-gray-50 font-mono p-4"
                  placeholder="转换后的JavaScript代码将显示在这里..."
                />
              </div>
            </div>

            {/* 错误提示和说明 */ }
            <div className="flex-shrink-0 space-y-3">
              { error && (
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">{ error }</p>
                </div>
              ) }
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  提示：此工具可以帮助您将 HTML 代码转换为 JavaScript 代码。支持复制转换后的结果或下载为文件。转换结果包含多种使用方式供您选择。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}