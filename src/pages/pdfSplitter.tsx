import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileUp, ArrowLeft, Download, Trash2, FileText, Eye, EyeOff, Package, ArrowRightLeft, Check, CheckCircle2, Crown, Database, LayoutGrid, Loader2, Play, Plus, RotateCcw } from "lucide-react"
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
  const [showPreview, setShowPreview] = useState(false)
  const [splitType, setSplitType] = useState('range')
  const [rangeMode, setRangeMode] = useState('custom')
  const [ranges, setRanges] = useState([{ start: 1, end: 7 }])
  const [mergeAll, setMergeAll] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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
  }


  const handleSplitTypeChange = (type) => {
    setSplitType(type)
  }

  const handleRangeModeChange = (mode) => {
    setRangeMode(mode)
  }

  const addRange = () => {
    const lastRange = ranges[ranges.length - 1]
    const newStart = lastRange.end + 1
    if (newStart <= totalPages) {
      setRanges([...ranges, {
        start: newStart,
        end: Math.min(newStart + 6, totalPages)
      }])
    } else {
      alert('已达到最大页数限制')
    }
  }

  const removeRange = (index) => {
    if (ranges.length > 1) {
      const newRanges = ranges.filter((_, i) => i !== index)
      setRanges(newRanges)
    }
  }

  const updateRange = (index, field, value) => {
    const numValue = parseInt(value) || 1
    const clampedValue = Math.max(1, Math.min(totalPages, numValue))

    const newRanges = [...ranges]
    newRanges[index][field] = clampedValue

    // Ensure start <= end
    if (field === 'start' && newRanges[index].start > newRanges[index].end) {
      newRanges[index].end = newRanges[index].start
    } else if (field === 'end' && newRanges[index].end < newRanges[index].start) {
      newRanges[index].start = newRanges[index].end
    }

    setRanges(newRanges)
  }

  const resetForm = () => {
    setRanges([{ start: 1, end: 7 }])
    setMergeAll(false)
    setSplitType('range')
    setRangeMode('custom')
    setIsComplete(false)
  }

  const handleSplit = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      setIsComplete(true)
      setTimeout(() => setIsComplete(false), 2000)
    }, 1500)
  }

  const getTotalSelectedPages = () => {
    return ranges.reduce((sum, r) => sum + (r.end - r.start + 1), 0)
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
          { pdfFile ? (
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
                <div className="space-y-4">
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
                  { totalPages > 10 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                      仅显示前 10 页预览，共 { totalPages } 页
                    </p>
                  ) }
                </div>
              ) : (
                <div className="flex-1 h-full flex justify-center items-center border border-red-400 rounded-lg p-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    无法生成预览，可能是PDF加密或格式不受支持
                  </p>
                </div>

              ) }
              <div className="space-y-6 border border-red-400 bg-white/50 dark:bg-gray-800/50 rounded-lg p-6 h-full">
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
                <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-4 md:p-8 font-sans">
                  <div className="max-w-4xl mx-auto">
                    {/* Header */ }
                    <div className="text-center mb-8 animate-fade-in">
                      <h1 className="text-4xl font-bold text-slate-800 mb-2">PDF 拆分工具</h1>
                      <p className="text-slate-600">轻松拆分、提取和管理您的 PDF 页面</p>
                    </div>

                    {/* Main Panel */ }
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8 animate-fade-in">
                      {/* Split Type Tabs */ }
                      <div className="flex gap-4 mb-8">
                        <button
                          onClick={ () => handleSplitTypeChange('range') }
                          className={ `flex-1 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-300 flex flex-col items-center gap-2 relative ${splitType === 'range'
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 -translate-y-0.5'
                            : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-500'
                            }` }
                        >
                          <div className="relative">
                            <LayoutGrid className="w-6 h-6" />
                            { splitType === 'range' && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pop">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={ 3 } />
                              </div>
                            ) }
                          </div>
                          <span>按范围拆分</span>
                        </button>

                        <button
                          onClick={ () => handleSplitTypeChange('page') }
                          className={ `flex-1 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-300 flex flex-col items-center gap-2 ${splitType === 'page'
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 -translate-y-0.5'
                            : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-500'
                            }` }
                        >
                          <FileText className="w-6 h-6" />
                          <span>按页面拆分</span>
                        </button>

                        <button
                          onClick={ () => handleSplitTypeChange('size') }
                          className={ `flex-1 py-4 px-6 rounded-xl font-medium text-sm transition-all duration-300 flex flex-col items-center gap-2 relative ${splitType === 'size'
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 -translate-y-0.5'
                            : 'bg-white text-slate-500 border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-500'
                            }` }
                        >
                          <div className="absolute top-2 right-2 animate-float">
                            <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
                          </div>
                          <Database className="w-6 h-6" />
                          <span>按大小拆分</span>
                        </button>
                      </div>

                      {/* Range Section */ }
                      { splitType === 'range' && (
                        <div className="animate-fade-in">
                          <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-700 mb-3">范围模式：</label>
                            <div className="flex gap-4">
                              <button
                                onClick={ () => handleRangeModeChange('custom') }
                                className={ `flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${rangeMode === 'custom'
                                  ? 'bg-red-50 text-red-600 border-2 border-red-500 shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
                                  : 'bg-slate-50 text-slate-500 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                  }` }
                              >
                                自定义
                              </button>
                              <button
                                onClick={ () => handleRangeModeChange('fixed') }
                                className={ `flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${rangeMode === 'fixed'
                                  ? 'bg-red-50 text-red-600 border-2 border-red-500 shadow-[0_0_0_3px_rgba(220,38,38,0.1)]'
                                  : 'bg-slate-50 text-slate-500 border-2 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                                  }` }
                              >
                                固定
                              </button>
                            </div>
                          </div>

                          {/* Custom Ranges */ }
                          { rangeMode === 'custom' && (
                            <div className="space-y-3 mb-6">
                              { ranges.map((range, index) => (
                                <div
                                  key={ index }
                                  className="bg-slate-50 rounded-lg p-4 flex items-center gap-4 border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-300 animate-fade-in"
                                >
                                  <div className="flex items-center gap-2 text-slate-600 min-w-[80px]">
                                    <ArrowRightLeft className="w-4 h-4" />
                                    <span className="text-sm font-medium">范围 { index + 1 }</span>
                                  </div>

                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2 bg-white rounded-md px-3 py-2 border border-slate-200">
                                      <span className="text-xs text-slate-500">从页面</span>
                                      <input
                                        type="number"
                                        min={ 1 }
                                        max={ totalPages }
                                        value={ range.start }
                                        onChange={ (e) => updateRange(index, 'start', e.target.value) }
                                        className="w-16 text-center font-medium text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0"
                                      />
                                    </div>

                                    <span className="text-slate-400 font-medium">至</span>

                                    <div className="flex items-center gap-2 bg-white rounded-md px-3 py-2 border border-slate-200">
                                      <input
                                        type="number"
                                        min={ 1 }
                                        max={ totalPages }
                                        value={ range.end }
                                        onChange={ (e) => updateRange(index, 'end', e.target.value) }
                                        className="w-16 text-center font-medium text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0"
                                      />
                                    </div>

                                    <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                      共 { Math.max(0, range.end - range.start + 1) } 页
                                    </span>
                                  </div>

                                  <button
                                    onClick={ () => removeRange(index) }
                                    disabled={ ranges.length === 1 }
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              )) }
                            </div>
                          ) }

                          {/* Fixed Mode Message */ }
                          { rangeMode === 'fixed' && (
                            <div className="mb-6 p-4 bg-slate-50 rounded-lg text-center text-slate-500">
                              固定模式：每个范围将包含相同数量的页面
                            </div>
                          ) }

                          {/* Add Range Button */ }
                          { rangeMode === 'custom' && (
                            <button
                              onClick={ addRange }
                              className="w-full py-3 border-2 border-dashed border-red-400 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all duration-300 flex items-center justify-center gap-2 mb-6 group"
                            >
                              <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              添加范围
                            </button>
                          ) }

                          {/* Merge Checkbox */ }
                          <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors group">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={ mergeAll }
                                onChange={ (e) => setMergeAll(e.target.checked) }
                                className="peer sr-only"
                              />
                              <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white peer-checked:bg-red-500 peer-checked:border-red-500 transition-all" />
                              <Check className="w-3 h-3 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={ 3 } />
                            </div>
                            <span className="text-slate-700 select-none">合并一个PDF文件中的所有范围</span>
                          </label>
                        </div>
                      ) }

                      {/* Page Split Section */ }
                      { splitType === 'page' && (
                        <div className="animate-fade-in py-12 text-center text-slate-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" strokeWidth={ 1.5 } />
                          <p>每个页面将被拆分为单独的 PDF 文件</p>
                          <p className="text-sm text-slate-400 mt-2">将生成 { totalPages } 个文件</p>
                        </div>
                      ) }

                      {/* Size Split Section */ }
                      { splitType === 'size' && (
                        <div className="animate-fade-in bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
                          <div className="animate-float inline-block mb-3">
                            <Crown className="w-12 h-12 text-amber-500 fill-amber-500" />
                          </div>
                          <h3 className="text-lg font-semibold text-amber-800 mb-2">高级功能</h3>
                          <p className="text-amber-700 mb-4">按文件大小拆分需要升级至专业版</p>
                          <button className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-lg shadow-amber-500/30">
                            升级专业版
                          </button>
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
                          disabled={ isProcessing || isComplete }
                          className={ `flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-white transition-all duration-300 ${isComplete
                            ? 'bg-emerald-500 hover:bg-emerald-500'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5'
                            } disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none` }
                        >
                          { isProcessing ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              处理中...
                            </>
                          ) : isComplete ? (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              完成！
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

                    {/* Preview Section */ }
                    <div className="mt-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 animate-fade-in">
                      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-slate-600" />
                        预览
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 min-h-[100px]">
                        { splitType === 'range' && rangeMode === 'custom' ? (
                          <div className="w-full">
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium text-slate-700">拆分预览</span>
                              <span className="text-sm text-slate-500">
                                已选择 { getTotalSelectedPages() } 页 / 共 { totalPages } 页
                              </span>
                            </div>
                            <div className="space-y-2">
                              { ranges.map((range, i) => (
                                <div key={ i } className="flex items-center gap-3 text-sm animate-fade-in">
                                  <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
                                    { i + 1 }
                                  </div>
                                  <div className="flex-1 bg-white rounded p-2 border border-slate-200 shadow-sm">
                                    页面 { range.start } - { range.end }
                                    <span className="text-slate-400 mx-2">|</span>
                                    <span className="text-slate-600">{ range.end - range.start + 1 } 页</span>
                                  </div>
                                </div>
                              )) }
                            </div>
                            { mergeAll && (
                              <div className="mt-3 text-sm text-blue-600 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" />
                                将合并为单个 PDF 文件
                              </div>
                            ) }
                          </div>
                        ) : splitType === 'range' && rangeMode === 'fixed' ? (
                          <div className="text-center text-slate-500">固定模式：每个范围将包含相同数量的页面</div>
                        ) : splitType === 'page' ? (
                          <div className="text-center">将生成 { totalPages } 个单独的 PDF 文件（每页一个）</div>
                        ) : (
                          <div className="text-center text-amber-600">请升级至专业版使用此功能</div>
                        ) }
                      </div>
                    </div>
                  </div>

                </div>

                {/* 操作按钮 */ }
                <div className="flex justify-end gap-4">

                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={ splitPDF }
                    disabled={ isProcessing }
                  >
                    { isProcessing ? (
                      <span className="animate-pulse">处理中...</span>
                    ) : (
                      <>
                        <Package className="h-5 w-5 mr-2" />
                        拆分并下载ZIP
                      </>
                    ) }
                  </Button>
                </div>
              </div>
            </div>

          ) }
        </div>
      </div>
    </div>
  )
}
