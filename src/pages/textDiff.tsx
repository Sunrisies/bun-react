import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, RefreshCw, Download, ChevronDown, ChevronUp, FileText, Info } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import * as Diff from "diff"

export const Route = createFileRoute("/textDiff")({
    component: TextDiffTool,
})

interface DiffItem {
    id: string
    type: "add" | "remove" | "equal"
    value: string
    lineStart: number
    lineEnd: number
}

interface DiffNavItem {
    id: string
    type: "add" | "remove"
    lineNumber: number
    preview: string
}

interface DiffLineItemProps {
    item: DiffItem
    line: string
    lineIndex: number
    totalLines: number
}

// Memoized diff line component for better performance
const DiffLineItem = memo(({ item, line, lineIndex, totalLines }: DiffLineItemProps) => {
    const lineNumber = item.lineStart + lineIndex + 1
    const isLastLine = lineIndex === totalLines - 1

    return (
        <div
            id={ lineIndex === 0 ? item.id : undefined }
            className={ `
                flex border-l-4 transition-all duration-200
                ${item.type === "add" ? "bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400" : ""}
                ${item.type === "remove" ? "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400" : ""}
                ${item.type === "equal" ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" : ""}
                ${!isLastLine ? "border-b border-gray-100 dark:border-gray-700" : ""}
            `}
        >
            <div className="w-12 flex-shrink-0 text-right pr-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 select-none">
                { item.type !== "equal" && lineNumber }
            </div>
            <div className="flex-1 px-3 py-1 font-mono text-sm whitespace-pre-wrap break-all dark:text-gray-300">
                { line || <span className="text-gray-300 dark:text-gray-600">(空行)</span> }
            </div>
            { item.type !== "equal" && (
                <div className="w-12 flex-shrink-0 flex items-center justify-center text-xs">
                    { item.type === "add" ? (
                        <span className="text-green-600 dark:text-green-400 font-semibold">+</span>
                    ) : (
                        <span className="text-red-600 dark:text-red-400 font-semibold">-</span>
                    ) }
                </div>
            ) }
        </div>
    )
})

// Memoized diff result container
const MemoizedDiffResult = memo(({ diffResult, renderDiffLine }: { diffResult: DiffItem[], renderDiffLine: (item: DiffItem, index: number) => React.ReactNode }) => {
    return <>{ diffResult.map((item, index) => renderDiffLine(item, index)) }</>
})

function TextDiffTool() {
    const navigate = useNavigate()
    const [leftText, setLeftText] = useState("")
    const [rightText, setRightText] = useState("")
    const [diffResult, setDiffResult] = useState<DiffItem[]>([])
    const [diffNavItems, setDiffNavItems] = useState<DiffNavItem[]>([])
    const [showNav, setShowNav] = useState(true)
    const diffContainerRef = useRef<HTMLDivElement>(null)

    // 文件上传处理
    const handleFileUpload = useCallback((side: "left" | "right", file: File) => {
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            const text = e.target?.result as string
            if (side === "left") {
                setLeftText(text)
            } else {
                setRightText(text)
            }
            toast.success(`文件 ${file.name} 加载成功`)
        }
        reader.onerror = () => {
            toast.error("文件读取失败")
        }
        reader.readAsText(file)
    }, [])

    // 执行文本对比
    const performDiff = useCallback(() => {
        if (!leftText && !rightText) {
            toast.error("请至少输入一段文本")
            return
        }

        try {
            const changes = Diff.diffLines(leftText, rightText)
            let leftLineNum = 0
            let rightLineNum = 0
            const results: DiffItem[] = []
            const navItems: DiffNavItem[] = []

            changes.forEach((part, index) => {
                const lines = part.value.split("\n")
                const lineCount = lines.length - (part.value.endsWith("\n") ? 1 : 0)

                const item: DiffItem = {
                    id: `diff-${index}`,
                    type: part.added ? "add" : part.removed ? "remove" : "equal",
                    value: part.value,
                    lineStart: part.added ? rightLineNum : leftLineNum,
                    lineEnd: part.added ? rightLineNum + lineCount : leftLineNum + lineCount,
                }

                results.push(item)

                // 添加到导航列表（只添加新增和删除的部分）
                if (part.added || part.removed) {
                    const preview = lines[0].substring(0, 50) + (lines[0].length > 50 ? "..." : "")
                    navItems.push({
                        id: item.id,
                        type: part.added ? "add" : "remove",
                        lineNumber: part.added ? rightLineNum + 1 : leftLineNum + 1,
                        preview: preview || "(空行)",
                    })
                }

                if (!part.added) leftLineNum += lineCount
                if (!part.removed) rightLineNum += lineCount
            })

            setDiffResult(results)
            setDiffNavItems(navItems)
            toast.success(`对比完成，发现 ${navItems.length} 处差异`)
        } catch (error) {
            console.error("文本对比出错:", error)
            toast.error("文本对比失败")
        }
    }, [leftText, rightText])

    // 滚动到指定差异项
    const scrollToDiff = useCallback((diffId: string) => {
        const element = document.getElementById(diffId)
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" })
            element.classList.add("highlight-flash")
            setTimeout(() => {
                element.classList.remove("highlight-flash")
            }, 2000)
        }
    }, [])

    // 导出对比结果
    const exportDiff = useCallback(() => {
        if (diffResult.length === 0) {
            toast.error("暂无对比结果可导出")
            return
        }

        let output = "=== 文本对比结果 ===\n\n"
        output += `总计差异: ${diffNavItems.length} 处\n\n`
        output += "--- 详细差异 ---\n\n"

        diffResult.forEach((item) => {
            if (item.type !== "equal") {
                const typeLabel = item.type === "add" ? "新增" : "删除"
                output += `[${typeLabel}] 行 ${item.lineStart + 1}-${item.lineEnd}:\n`
                output += item.value
                output += "\n---\n\n"
            }
        })

        const blob = new Blob([output], { type: "text/plain;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `文本对比结果-${new Date().toISOString().slice(0, 10)}.txt`
        a.click()
        URL.revokeObjectURL(url)
        toast.success("对比结果已导出")
    }, [diffResult, diffNavItems])

    // 清空所有内容
    const clearAll = useCallback(() => {
        setLeftText("")
        setRightText("")
        setDiffResult([])
        setDiffNavItems([])
        toast.success("已清空所有内容")
    }, [])

    // 渲染差异行 - 优化性能
    const renderDiffLine = useCallback((item: DiffItem, index: number) => {
        const lines = item.value.split("\n").filter((_, i, arr) => i < arr.length - 1 || item.value[item.value.length - 1] !== "\n")

        return lines.map((line, lineIndex) => (
            <DiffLineItem
                key={ `${item.id}-${lineIndex}` }
                item={ item }
                line={ line }
                lineIndex={ lineIndex }
                totalLines={ lines.length }
            />
        ))
    }, [])

    return (
        <div className="h-[calc(100vh-4.2rem)] p-4 md:p-6 overflow-hidden">
            <style>{ `
        .highlight-flash {
          animation: flash 0.5s ease-in-out 3;
        }
        @keyframes flash {
          0%, 100% { background-color: inherit; };
          50% { background-color: #fef08a; }
        }
      `}</style>

            <Card className="w-full max-w-7xl mx-auto shadow-lg h-full flex flex-col">
                <CardHeader className="pb-4 border-b flex-shrink-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                                📝 文本对比工具
                            </CardTitle>
                            <div className="relative inline-block group">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                                    <Info className="h-5 w-5" />
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700"></div>
                                    <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">💡 使用提示</h4>
                                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                                        <li>• 支持拖拽上传文本文件（.txt、.md、.json、.xml等）</li>
                                        <li>• 绿色表示新增内容，红色表示删除内容</li>
                                        <li>• 点击右侧差异列表可快速定位到具体位置</li>
                                        <li>• 可导出对比结果为文本文件</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={ () => navigate({ to: "/" }) }
                            variant="outline"
                            className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            返回首页
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-6 flex-1 overflow-y-auto min-h-0">
                    {/* 输入区域 */ }
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* 左侧文本 */ }
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="left-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    原始文本
                                </Label>
                                <input
                                    type="file"
                                    id="left-file"
                                    className="hidden"
                                    accept=".txt,.md,.json,.xml,.yaml,.yml,.csv,.log"
                                    onChange={ (e) => e.target.files?.[0] && handleFileUpload("left", e.target.files[0]) }
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={ () => document.getElementById("left-file")?.click() }
                                    className="text-xs"
                                >
                                    <Upload className="h-3 w-3 mr-1" />
                                    上传文件
                                </Button>
                            </div>
                            <Textarea
                                id="left-text"
                                placeholder="在此输入或粘贴原始文本..."
                                value={ leftText }
                                onChange={ (e) => setLeftText(e.target.value) }
                                className="h-[200px] font-mono text-sm resize-none"
                            />
                        </div>

                        {/* 右侧文本 */ }
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="right-text" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    对比文本
                                </Label>
                                <input
                                    type="file"
                                    id="right-file"
                                    className="hidden"
                                    accept=".txt,.md,.json,.xml,.yaml,.yml,.csv,.log"
                                    onChange={ (e) => e.target.files?.[0] && handleFileUpload("right", e.target.files[0]) }
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={ () => document.getElementById("right-file")?.click() }
                                    className="text-xs"
                                >
                                    <Upload className="h-3 w-3 mr-1" />
                                    上传文件
                                </Button>
                            </div>
                            <Textarea
                                id="right-text"
                                placeholder="在此输入或粘贴要对比的文本..."
                                value={ rightText }
                                onChange={ (e) => setRightText(e.target.value) }
                                className="h-[200px] font-mono text-sm resize-none"
                            />
                        </div>
                    </div>

                    {/* 操作按钮 */ }
                    <div className="flex flex-wrap gap-3 mb-6">
                        <Button
                            onClick={ performDiff }
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            开始对比
                        </Button>
                        { diffResult.length > 0 && (
                            <>
                                <Button onClick={ exportDiff } variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    导出结果
                                </Button>
                                <Button onClick={ clearAll } variant="outline" className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    清空所有
                                </Button>
                            </>
                        ) }
                    </div>

                    {/* 对比结果区域 */ }
                    { diffResult.length > 0 && (
                        <div className="border dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 flex flex-col" style={ { height: 'calc(100vh - 650px)', minHeight: '300px' } }>
                            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
                                <h3 className="font-medium text-gray-800 dark:text-gray-100">
                                    对比结果
                                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                        ({ diffNavItems.length } 处差异)
                                    </span>
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={ () => setShowNav(!showNav) }
                                    className="text-xs"
                                >
                                    { showNav ? (
                                        <>
                                            <ChevronUp className="h-4 w-4 mr-1" />
                                            隐藏导航
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="h-4 w-4 mr-1" />
                                            显示导航
                                        </>
                                    ) }
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 flex-1 overflow-hidden">
                                {/* 差异导航 */ }
                                { showNav && diffNavItems.length > 0 && (
                                    <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                                        <div className="p-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                                <FileText className="h-4 w-4" />
                                                差异导航
                                            </h4>
                                        </div>
                                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                            { diffNavItems.map((item, index) => (
                                                <div
                                                    key={ item.id }
                                                    onClick={ () => scrollToDiff(item.id) }
                                                    className={ `
                            p-3 cursor-pointer transition-colors hover:bg-white dark:hover:bg-gray-800
                            ${item.type === "add" ? "border-l-4 border-green-500 dark:border-green-400" : "border-l-4 border-red-500 dark:border-red-400"}
                          `}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                                            #{ index + 1 }
                                                        </span>
                                                        <span
                                                            className={ `
                                text-xs px-2 py-0.5 rounded-full font-medium
                                ${item.type === "add" ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"}
                              `}
                                                        >
                                                            { item.type === "add" ? "新增" : "删除" }
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">行 { item.lineNumber }</div>
                                                    <div className="text-xs text-gray-700 dark:text-gray-300 truncate font-mono">{ item.preview }</div>
                                                </div>
                                            )) }
                                        </div>
                                    </div>
                                ) }

                                {/* 差异内容 */ }
                                <div
                                    ref={ diffContainerRef }
                                    className={ `${showNav && diffNavItems.length > 0 ? "lg:col-span-3" : "lg:col-span-4"} overflow-y-auto` }
                                >
                                    <MemoizedDiffResult diffResult={ diffResult } renderDiffLine={ renderDiffLine } />
                                </div>
                            </div>
                        </div>
                    ) }

                    {/* 空状态提示 */ }
                    { diffResult.length === 0 && (
                        <div className="text-center py-12">
                            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">暂无对比结果</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                输入或上传两段文本，然后点击“开始对比”按钮
                            </p>
                        </div>
                    ) }
                </CardContent>
            </Card>
        </div>
    )
}
