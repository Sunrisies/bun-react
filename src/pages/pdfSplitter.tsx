import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import JSZip from 'jszip'
import { ArrowLeft, FileText, FileUp, Loader2, Play, RotateCcw, Trash2 } from "lucide-react"
import { PDFDocument } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"

// 设置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export const Route = createFileRoute("/pdfSplitter")({
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

function PdfSplitterComponent() {
  const navigate = useNavigate()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [pageRanges, setPageRanges] = useState<PageRange[]>([{ start: 1, end: 1 }])
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewPages, setPreviewPages] = useState<PreviewPage[]>([])
  const [fixed, setFixed] = useState(1)
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const workerRef = useRef<Worker | null>(null)
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/pdfPreviewWorker.ts', import.meta.url),
      { type: 'module' }
    )

    workerRef.current.onmessage = (event) => {
      const { pages, pageCount, error } = event.data
      console.log("收到Worker消息，页面数量:", event.data, "错误:", error)
      if (error) {
        toast.error("生成预览失败：" + error)
        return
      }

      setPreviewPages(pages)
      toast.success(`成功加载PDF文件，共 ${pageCount} 页`)
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])
  // 修改 PDF 加载逻辑
  // const { getRootProps, getInputProps } = useDropzone({
  //   accept: { 'application/pdf': ['.pdf'] },
  //   maxFiles: 1,
  //   onDrop: async (acceptedFiles) => {
  //     if (acceptedFiles.length > 0) {
  //       const file = acceptedFiles[0]
  //       setPdfFile(file)

  //       try {
  //         const fileBuffer = await file.arrayBuffer()
  //         const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })
  //         const pageCount = pdf.getPageCount()
  //         setTotalPages(pageCount)

  //         // 使用 Worker 生成预览
  //         workerRef.current?.postMessage({
  //           pdfData: fileBuffer,
  //           scale: 0.5,
  //         })
  //       } catch (error) {
  //         toast.error("加载PDF失败：" + (error as Error).message)
  //       }
  //     }
  //   },
  // })
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
          console.time("生成PDF预览")
          if (ctx) {
            const generatePreviews = async () => {
              const pages: PreviewPage[] = []
              const BATCH_SIZE = 10 // 每批并发渲染 5 页，可根据设备性能调整

              for (let start = 1; start <= pageCount; start += BATCH_SIZE) {
                const end = Math.min(start + BATCH_SIZE - 1, pageCount)
                const batchTasks = []

                for (let pageNum = start; pageNum <= end; pageNum++) {
                  batchTasks.push(
                    (async () => {
                      // 每个任务创建独立的 canvas
                      const canvas = document.createElement('canvas')
                      const ctx = canvas.getContext('2d')!

                      const page = await pdfJsDoc.getPage(pageNum)
                      const viewport = page.getViewport({ scale: 0.5 })
                      canvas.width = viewport.width
                      canvas.height = viewport.height

                      console.log(`页面 ${pageNum} 开始渲染`)
                      await page.render({ canvasContext: ctx, viewport }).promise
                      console.log(`页面 ${pageNum} 渲染完成`)

                      // 转换为 Blob 并生成 URL
                      const blob = await new Promise<Blob>((resolve) =>
                        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.7)
                      )
                      const url = URL.createObjectURL(blob)

                      return { pageNumber: pageNum, thumbnail: url }
                    })()
                  )
                }

                // 等待本批所有页面完成
                const batchResults = await Promise.all(batchTasks)
                pages.push(...batchResults)

                // 可选：每批完成后更新 UI，让用户看到逐步加载的效果
                setPreviewPages([...pages])
              }

              // 全部完成后可进行整体提示（如 toast）
              toast.success(`成功加载 ${pageCount} 页`)
            }
            generatePreviews()

          }
          console.timeEnd("生成PDF预览")

          setPreviewPages(pages)
          toast.success(`成功加载PDF文件，共 ${pageCount} 页`)
        } catch (error) {
          toast.error("加载PDF失败：" + (error as Error).message)
        }
      }
    },
  })
  const handleSplit = async () => {
    if (!pdfFile) {
      toast.error("请先上传PDF文件")
      return
    }

    try {
      setIsProcessing(true)
      const fileBuffer = await pdfFile.arrayBuffer()
      const pdf = await PDFDocument.load(fileBuffer, { ignoreEncryption: true })

      const zip = new JSZip()
      let successCount = 0

      // 根据 fixed 参数计算拆分范围
      const ranges: { start: number; end: number }[] = []
      const totalPages = pdf.getPageCount()

      for (let i = 0; i < totalPages; i += fixed) {
        ranges.push({
          start: i + 1,
          end: Math.min(i + fixed, totalPages)
        })
      }

      console.log("开始拆分PDF，页面范围:", ranges)

      for (const range of ranges) {
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
  }


  const resetForm = () => {
  }



  return (
    <div className="h-[calc(100vh-4.04rem)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="w-full h-full  rounded-2xl shadow-xl px-4 sm:px-6 py-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              PDF拆分工具
            </CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>

        <div className="space-y-6 p-6 h-full">
          { !pdfFile ? (
            <div
              { ...getRootProps() }
              className="border-2  max-w-4xl mx-auto border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-blue-300"
            >
              <input { ...getInputProps() } />
              <FileUp className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <p className="text-xl font-medium text-gray-700 mb-2">
                拖放PDF文件至此或点击选择
              </p>
              <p className="text-sm text-gray-500">支持单个PDF文件</p>
            </div>
          ) : (
            <div className="flex gap-2 h-full">
              {/* 拆分预览 */ }
              { previewPages.length > 0 ? (
                <div className="flex-1 overflow-y-auto max-h-full">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    { previewPages.map((page) => (
                      <div
                        key={ page.pageNumber }
                        className="relative group border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <img
                          src={ page.thumbnail }
                          alt={ `Page ${page.pageNumber}` }
                          className="w-full h-auto"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 px-2 text-center">
                          第 { page.pageNumber } 页
                        </div>
                      </div>
                    )) }
                  </div>
                </div>
              ) : (
                <div className="flex-1 h-full flex justify-center items-center border border-red-400 rounded-lg p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    无法生成预览，可能是PDF加密或格式不受支持
                  </p>
                </div>

              ) }
              <div className="w-100 border border-red-400 bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 h-full border border-red-300">
                {/* 文件信息 */ }
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium">{ pdfFile?.name }</p>
                      <p className="text-sm text-gray-500">
                        {/* { (pdfFile.size / 1024 / 1024).toFixed(2) } MB · 共 { totalPages } 页 */ }
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={ clearFile }>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                {/* 页面范围设置 */ }
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-8 font-sans">
                  <div className="max-w-4xl mx-auto">
                    { (
                      <div className="animate-fade-in">
                        <div className="mb-6">
                          <label className="block text-sm font-medium text-slate-700 mb-3">范围模式：固定</label>
                        </div>

                        {/* Fixed Mode Message */ }
                        { (
                          <div className="mb-6 p-4 gap-3 bg-slate-50 flex items-center rounded-lg text-center text-slate-500">
                            拆分为
                            <Input
                              type="number"
                              min={ 1 }
                              max={ totalPages }
                              value={ fixed }
                              onChange={ (e) => setFixed(+e.target.value) }
                              className="w-16 text-center font-medium text-slate-800 bg-transparent "
                            />
                          </div>
                        ) }
                      </div>
                    ) }


                    {/* Action Buttons */ }
                    <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200">
                      <button
                        onClick={ resetForm }
                        className="px-6 py-3 rounded-lg border-2 border-slate-300 text-slate-600 font-medium hover:bg-slate-50 transition-all hover:border-slate-400"
                      >
                        <RotateCcw className="w-4 h-4 inline mr-2" />
                        重置
                      </button>
                      <button
                        onClick={ handleSplit }
                        disabled={ isProcessing }
                        className={ `flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-white transition-all duration-300 
                           disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none` }
                      >
                        { isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            处理中...
                          </>
                        ) : (
                          <>
                            <Play className="w-5 h-5" />
                            开始拆分
                          </>
                        ) }
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          ) }
        </div>
      </div>
    </div >
  )
}
