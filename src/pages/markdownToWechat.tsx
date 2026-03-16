import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { downloadLocalFile } from "sunrise-utils"
import { copyToClipboard } from "@/lib/utils"
import { marked } from "marked"

export const Route = createFileRoute("/markdownToWechat")({
    component: MarkdownToWechat,
})

function MarkdownToWechat() {
    const navigate = useNavigate()
    const [input, setInput] = useState("")
    const [output, setOutput] = useState("")

    // Markdown转微信公众号格式的核心转换函数 - 使用marked库
    const convertMarkdownToWechat = async (markdown: string): Promise<string> => {
        if (!markdown.trim()) return ""

        // 使用marked解析Markdown为HTML
        const html = await marked.parse(markdown, {
            gfm: true, // GitHub Flavored Markdown
            breaks: true // 保留换行
        })

        // 将HTML转换为微信公众号格式
        let result = html as string

        // 1. 处理代码块 - 转换为引用格式
        result = result.replace(/<pre><code class="language-[^"]*">([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
            const lines = code.trim().split('\n')
            return lines.map((line: string) => `> ${line}`).join('\n')
        })

        // 处理没有语言类的代码块
        result = result.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
            const lines = code.trim().split('\n')
            return lines.map((line: string) => `> ${line}`).join('\n')
        })

        // 2. 处理行内代码
        result = result.replace(/<code>([^<]*)<\/code>/g, "「$1」")

        // 3. 处理加粗
        result = result.replace(/<strong>([^<]*)<\/strong>/g, "**$1**")
        result = result.replace(/<b>([^<]*)<\/b>/g, "**$1**")

        // 4. 处理斜体
        result = result.replace(/<em>([^<]*)<\/em>/g, "*$1*")

        // 5. 处理链接 - 转换为微信公众号支持的格式
        result = result.replace(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g, "【$2】($1)")

        // 6. 处理标题 - 转换为加粗文本
        result = result.replace(/<h1>([^<]*)<\/h1>/g, "**$1**")
        result = result.replace(/<h2>([^<]*)<\/h2>/g, "**$1**")
        result = result.replace(/<h3>([^<]*)<\/h3>/g, "**$1**")
        result = result.replace(/<h4>([^<]*)<\/h4>/g, "**$1**")
        result = result.replace(/<h5>([^<]*)<\/h5>/g, "**$1**")
        result = result.replace(/<h6>([^<]*)<\/h6>/g, "**$1**")

        // 7. 处理无序列表
        result = result.replace(/<li>([^<]*)<\/li>/g, "• $1")
        result = result.replace(/<\/ul>\s*<ul>/g, "\n") // 合并连续的ul
        result = result.replace(/<ul>([\s\S]*?)<\/ul>/g, "$1")

        // 8. 处理有序列表
        result = result.replace(/<ol>([\s\S]*?)<\/ol>/g, (match, content) => {
            // 将li转换为数字列表
            let index = 1
            return content.replace(/<li>([^<]*)<\/li>/g, (m: string, item: string) => {
                return `${index++}. ${item}`
            })
        })

        // 9. 处理引用块
        result = result.replace(/<blockquote>([\s\S]*?)<\/blockquote>/g, (match, content) => {
            return content.trim().split('\n').map((line: string) => `「${line.trim()}」`).join('\n')
        })

        // 10. 处理段落 - 添加换行
        result = result.replace(/<p>([^<]*)<\/p>/g, "$1\n\n")

        // 11. 处理分割线
        result = result.replace(/<hr[^>]*>/g, "——————————")

        // 12. 清理多余的HTML标签（如果有遗漏）
        result = result.replace(/<[^>]+>/g, "")

        // 13. 处理换行 - 微信公众号需要两个空格加换行
        result = result.replace(/\n/g, "  \n")

        // 14. 清理多余的空格和换行
        result = result.replace(/\s+$/gm, "")
        result = result.replace(/(  \n){3,}/g, "  \n  \n") // 限制连续换行

        return result
    }

    const handleConvert = async () => {
        if (!input.trim()) {
            toast.error("请输入Markdown内容")
            return
        }

        try {
            const converted = await convertMarkdownToWechat(input)
            setOutput(converted)
            toast.success("转换完成")
        } catch (error) {
            console.error("转换失败", error)
            toast.error("转换失败")
        }
    }

    const handleInputChange = (value: string) => {
        setInput(value)
    }

    const downloadText = () => {
        try {
            const blob = new Blob([output], { type: "text/plain" })
            downloadLocalFile(blob, "wechat_format.txt")
            toast.success("下载成功")
        } catch (err) {
            console.error("下载失败", err)
            toast.error("下载失败")
        }
    }

    return (
        <div className="h-[calc(100vh-4.2rem)] flex justify-center p-4 md:p-6 overflow-hidden">
            <Card className="w-full overflow-hidden">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="dark:text-gray-100">Markdown转微信公众号格式</CardTitle>
                        <Button onClick={ () => navigate({ to: "/" }) } variant="ghost" className="dark:hover:bg-gray-700">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            返回首页
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* 操作按钮 */ }
                        <div className="flex justify-end gap-2">
                            <Button onClick={ handleConvert } size="sm">
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
                                onClick={ downloadText }
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
                                <label className="text-sm font-medium">输入 Markdown</label>
                                <Textarea
                                    placeholder="请输入Markdown内容...
示例：
# 标题
**加粗文本**
*斜体文本*
[链接文本](https://example.com)
`行内代码`
```代码块```
- 列表项1
- 列表项2"
                                    value={ input }
                                    onChange={ (e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e.target.value) }
                                    className="h-[300px] font-mono"
                                />
                            </div>

                            {/* 右侧输出 */ }
                            <div className="space-y-2">
                                <label className="text-sm font-medium">微信公众号格式</label>
                                <Textarea
                                    value={ output }
                                    readOnly
                                    className="h-[400px] font-mono bg-gray-50"
                                    placeholder="转换后的微信公众号格式将显示在这里..."
                                />
                            </div>
                        </div>

                        {/* 提示信息 */ }
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 mb-2">
                                <strong>转换规则说明：</strong>
                            </p>
                            <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                                <li>标题转换为加粗文本</li>
                                <li>链接格式转换为【文本】(链接)</li>
                                <li>代码块转换为引用格式</li>
                                <li>行内代码转换为「」符号</li>
                                <li>列表转换为圆点符号</li>
                                <li>换行符转换为微信公众号支持的格式</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
