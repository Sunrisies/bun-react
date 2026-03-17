import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileUp, ArrowLeft, Package, Trash2, FileText, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDropzone } from "react-dropzone"
import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import * as pdfjsLib from 'pdfjs-dist'

// 设置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export const Route = createFileRoute("/pdfSplitter_new")({
  component: PdfSplitterComponent,
})

interface PageRange {
  start: number
  end: number
}

interface PreviewPage {
  pageNumber: number
  thumbnail: string
}

type SplitMode = 'range' | 'page'

function PdfSplitterComponent() {
  const navigate = useNavigate()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [pageRanges, setPageRanges] = useState<PageRange[]>([{ start: 1, end: 1 }])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewPages, setPreviewPages] = useState<PreviewPage[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const [splitMode, setSplitMode] = useState<SplitMode>('range')

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        setPdfFile(file)

        try {
          const fileBuffer = await file.arrayBuffer()
          const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })
          const pageCount = pdf.getPageCount()
          setTotalPages(pageCount)
          setPageRanges([{ start: 1, end: pageCount }])

          // 加载 PDF.js 文档用于预览
          const loadingTask = pdfjsLib.getDocument({ data: fileBuffer })
          const pdfJsDoc = await loadingTask.promise
          setPdfDoc(pdfJsDoc)

          // 生成页面预览
          const pages: PreviewPage[] = []
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          if (ctx) {
            for (let i = 0; i < Math.min(pageCount, 10); i++) {
              const page = await pdfJsDoc.getPage(i + 1)
              const viewport = page.getViewport({ scale: 0.5 })
              canvas.height = viewport.height
              canvas.width = viewport.width

              await page.render({
                canvasContext: ctx,
                viewport: viewport
              }).promise

              pages.push({
                pageNumber: i + 1,
                thumbnail: canvas.toDataURL()
              })
            }
          }

          setPreviewPages(pages)
          toast.success(`成功加载PDF文件，共 ${pageCount} 页`)
        } catch (error) {
          toast.error("加载PDF失败：" + (error as Error).message)
        }
      }
    },
  })

  const addPageRange = () => {
    if (pageRanges.length < 10) {
      setPageRanges([...pageRanges, { start: 1, end: 1 }])
    } else {
      toast.error("最多只能添加10个页面范围")
    }
  }

  const handleSplitModeChange = (mode: SplitMode) => {
    setSplitMode(mode)
    if (mode === 'page') {
      // 按页拆分模式：为每一页创建一个范围
      const ranges: PageRange[] = []
      for (let i = 1; i <= totalPages; i++) {
        ranges.push({ start: i, end: i })
      }
      setPageRanges(ranges)
      toast.success(`已切换到按页拆分模式，共 ${totalPages} 页`)
    } else {
      // 按范围拆分模式：重置为一个默认范围
      setPageRanges([{ start: 1, end: totalPages }])
      toast.success("已切换到按范围拆分模式")
    }
  }

  const removePageRange = (index: number) => {
    if (pageRanges.length > 1) {
      setPageRanges(pageRanges.filter((_, i) => i !== index))
    } else {
      toast.error("至少需要保留一个页面范围")
    }
  }

  const updatePageRange = (index: number, field: 'start' | 'end', value: number) => {
    const newRanges = [...pageRanges]
    newRanges[index][field] = Math.max(1, Math.min(totalPages, value))
    setPageRanges(newRanges)
  }

  const splitPDF = async () => {
    if (!pdfFile) {
      toast.error("请先上传PDF文件")
      return
    }

    try {
      setIsProcessing(true)
      const fileBuffer = await pdfFile.arrayBuffer()
      const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })

      console.log("开始拆分PDF，页面范围:", pageRanges)

      const zip = new JSZip()
      let successCount = 0

      for (const range of pageRanges) {
        console.log(`处理范围 ${range.start}-${range.end}`)

        // 为每个范围创建一个新的PDF文档
        const newPdf = await PDFDocument.create()
        const pagesToCopy = []

        // 收集要复制的页面索引
        for (let i = range.start - 1; i < range.end && i < pdf.getPageCount(); i++) {
          pagesToCopy.push(i)
        }

        console.log(`范围 ${range.start}-${range.end} 包含页面:`, pagesToCopy)

        if (pagesToCopy.length === 0) {
          toast.warning(`页面范围 ${range.start}-${range.end} 无效，已跳过`)
          continue
        }

        // 复制页面到新的PDF文档
        const copiedPages = await newPdf.copyPages(pdf, pagesToCopy)
        copiedPages.forEach((page) => {
          newPdf.addPage(page)
        })

        console.log(`新PDF文档页数: ${newPdf.getPageCount()}`)

        // 保存PDF字节数据
        const pdfBytes = await newPdf.save()
        const fileName = `${pdfFile.name.replace('.pdf', '')}_pages_${range.start}-${range.end}.pdf`

        console.log(`添加文件到ZIP: ${fileName}, 大小: ${pdfBytes.length} bytes`)

        zip.file(fileName, pdfBytes)
        successCount++
      }

      if (successCount === 0) {
        toast.error("没有有效的页面范围")
        return
      }

      console.log(`成功生成 ${successCount} 个PDF文件，正在打包成ZIP...`)

      // 生成ZIP文件
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)

      const link = document.createElement('a')
      link.href = url
      link.download = `${pdfFile.name.replace('.pdf', '')}_split.zip`
      link.click()

      URL.revokeObjectURL(url)
      toast.success(`PDF拆分成功！共生成 ${successCount} 个文件`)
    } catch (error) {
      console.error("PDF拆分失败:", error)
      toast.error("PDF拆分失败：" + (error as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearFile = () => {
    setPdfFile(null)
    setTotalPages(0)
    setPageRanges([{ start: 1, end: 1 }])
    setPreviewPages([])
    setPdfDoc(null)
    setShowPreview(false)
    setSplitMode('range')
  }

  return (
    <div className="h-[calc(100vh-4.04rem)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <Card className="w-full max-w-7xl rounded-2xl shadow-xl mx-auto my-4 h-[calc(100vh-5rem)]">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              PDF拆分工具
            </CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 h-[calc(100%-80px)] overflow-auto">
          {!pdfFile ? (
            // 没有选择文件时居中显示上传区域
            (<div className="flex items-center justify-center min-h-[60vh]">
              <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all hover:border-blue-300 w-full max-w-2xl"
              >
                <input {...getInputProps()} />
                <FileUp className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <p className="text-2xl font-medium text-gray-700 mb-2">
                  拖放PDF文件至此或点击选择
                </p>
                <p className="text-sm text-gray-500">支持单个PDF文件</p>
              </div>
            </div>)
          ) : (
            // 选择文件后，左右布局
            (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* 左侧：预览区域 */}
              <div className="lg:col-span-2 space-y-4">
                {/* 文件信息 */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{pdfFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB · 共 {totalPages} 页
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                {/* 预览区域 */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">页面预览</h3>
                    <Button
                      onClick={() => setShowPreview(!showPreview)}
                      variant="outline"
                      size="sm"
                    >
                      {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPreview ? '隐藏预览' : '显示预览'}
                    </Button>
                  </div>

                  {showPreview && previewPages.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {previewPages.map((page) => (
                        <div
                          key={page.pageNumber}
                          className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={page.thumbnail}
                            alt={`Page ${page.pageNumber}`}
                            className="w-full h-auto"
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 px-2 text-center">
                            第 {page.pageNumber} 页
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      点击"显示预览"查看PDF页面
                    </div>
                  )}
                  {totalPages > 10 && showPreview && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                      仅显示前 10 页预览，共 {totalPages} 页
                    </p>
                  )}
                </div>
              </div>
              {/* 右侧：操作区域 */}
              <div className="space-y-4">
                {/* 拆分模式选择 */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                  <h3 className="text-lg font-semibold mb-4">选择拆分模式</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => handleSplitModeChange('range')}
                      variant={splitMode === 'range' ? 'default' : 'outline'}
                      className="w-full justify-start"
                    >
                      按范围拆分
                    </Button>
                    <Button
                      onClick={() => handleSplitModeChange('page')}
                      variant={splitMode === 'page' ? 'default' : 'outline'}
                      className="w-full justify-start"
                    >
                      按页拆分
                    </Button>
                  </div>
                </div>

                {/* 页面范围设置 */}
                <div className="bg-white dark:bg-slate-800 rounded-lg border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {splitMode === 'range' ? '设置拆分范围' : '拆分页面列表'}
                    </h3>
                    {splitMode === 'range' && (
                      <Button onClick={addPageRange} variant="outline" size="sm">
                        添加范围
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {pageRanges.map((range, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <span className="text-xs text-gray-600 dark:text-gray-400 min-w-[50px]">
                          {splitMode === 'range' ? `范围${index + 1}` : `第${range.start}页`}
                        </span>
                        {splitMode === 'range' ? (
                          <>
                            <input
                              type="number"
                              min="1"
                              max={totalPages}
                              value={range.start}
                              onChange={(e) => updatePageRange(index, 'start', parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border dark:border-slate-600 rounded text-sm dark:bg-slate-600 dark:text-white"
                            />
                            <span className="text-gray-500 dark:text-gray-400 text-xs">-</span>
                            <input
                              type="number"
                              min="1"
                              max={totalPages}
                              value={range.end}
                              onChange={(e) => updatePageRange(index, 'end', parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border dark:border-slate-600 rounded text-sm dark:bg-slate-600 dark:text-white"
                            />
                          </>
                        ) : (
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            第 {range.start} 页
                          </span>
                        )}
                        {splitMode === 'range' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePageRange(index)}
                            disabled={pageRanges.length === 1}
                            className="ml-auto"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    onClick={clearFile}
                    className="w-full"
                  >
                    重新选择文件
                  </Button>
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 w-full"
                    onClick={splitPDF}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">处理中...</span>
                    ) : (
                      <>
                        <Package className="h-5 w-5 mr-2" />
                        拆分并下载ZIP
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>)
          )}
        </CardContent>
      </Card>
    </div>
  )
}
