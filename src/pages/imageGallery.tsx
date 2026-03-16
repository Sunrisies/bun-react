import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Upload,
  Copy,
  Check,
  Trash2,
  X,
  Sun,
  Moon,
  Info,
  Link2,
  Clock,
  FileImage,
  Settings2,
  ExternalLink,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { createFileRoute } from "@tanstack/react-router"

interface UploadedFile {
  id: string
  filename: string
  url: string
  uploadTime: string
}
export const Route = createFileRoute("/imageGallery")({
  component: ImageGallery,
})
// 本地存储 Key
const STORAGE_KEY = "sunrise_uploaded_files"
const SETTINGS_KEY = "sunrise_upload_settings"

// 文件名截断函数
function truncateFilename(filename: string, maxLength: number = 24): string {
  if (filename.length <= maxLength) return filename

  const ext = filename.lastIndexOf(".") > 0 ? filename.slice(filename.lastIndexOf(".")) : ""
  const name = filename.slice(0, filename.lastIndexOf(".") > 0 ? filename.lastIndexOf(".") : filename.length)

  if (name.length <= maxLength - ext.length - 3) return filename

  const truncatedName = name.slice(0, maxLength - ext.length - 3)
  return `${truncatedName}...${ext}`
}

// 格式化时间
function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function ImageGallery() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [saveToLocal, setSaveToLocal] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isDragActive, setIsDragActive] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<UploadedFile | null>(null)
  const [showCopyToast, setShowCopyToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 初始化：从本地存储读取设置和文件列表
  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_KEY)
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setSaveToLocal(settings.saveToLocal ?? true)
    }

    const savedFiles = localStorage.getItem(STORAGE_KEY)
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles))
    }
  }, [])

  // 保存设置到本地存储
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ saveToLocal }))
  }, [saveToLocal])

  // 当开启保存时，更新本地存储
  useEffect(() => {
    if (saveToLocal) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadedFiles))
    }
  }, [uploadedFiles, saveToLocal])

  // 主题切换
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  // 显示 Toast
  const showToast = (message: string) => {
    setToastMessage(message)
    setShowCopyToast(true)
    setTimeout(() => setShowCopyToast(false), 2000)
  }

  // 复制到剪贴板
  const copyToClipboard = async (url: string, id?: string) => {
    try {
      await navigator.clipboard.writeText(url)
      if (id) {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      }
      showToast("链接已复制到剪贴板")
      return true
    } catch {
      showToast("复制失败，请手动复制")
      return false
    }
  }

  // 模拟上传（实际项目中替换为真实 API）
  const uploadFile = async (file: File): Promise<UploadedFile> => {
    // 模拟上传延迟
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400))

    // 生成模拟 URL（实际项目中使用真实上传返回的 URL）
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const mockUrl = `https://img.example.com/images/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}/${String(new Date().getDate()).padStart(2, "0")}/${file.name.replace(/\s/g, "_")}_${timestamp}${randomStr}${file.name.substring(file.name.lastIndexOf("."))}`

    return {
      id: `${timestamp}-${randomStr}`,
      filename: file.name,
      url: mockUrl,
      uploadTime: new Date().toISOString(),
    }
  }

  // 处理文件上传
  const handleUpload = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return

      setIsUploading(true)
      setUploadProgress(0)

      const imageFiles = files.filter((file) => file.type.startsWith("image/"))
      if (imageFiles.length === 0) {
        showToast("请选择图片文件")
        setIsUploading(false)
        return
      }

      const newFiles: UploadedFile[] = []

      for (let i = 0; i < imageFiles.length; i++) {
        try {
          const uploadedFile = await uploadFile(imageFiles[i])
          newFiles.push(uploadedFile)
          setUploadProgress(((i + 1) / imageFiles.length) * 100)
        } catch {
          showToast(`上传 ${imageFiles[i].name} 失败`)
        }
      }

      if (newFiles.length > 0) {
        setUploadedFiles((prev) => [...newFiles, ...prev])

        // 自动复制第一个（或唯一一个）文件的链接
        if (newFiles.length === 1) {
          await copyToClipboard(newFiles[0].url)
        } else {
          // 多文件上传时复制所有链接
          const allUrls = newFiles.map((f) => f.url).join("\n")
          await copyToClipboard(allUrls)
        }
      }

      setIsUploading(false)
      setUploadProgress(0)
    },
    [saveToLocal]
  )

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragActive(false)
      const files = Array.from(e.dataTransfer.files)
      handleUpload(files)
    },
    [handleUpload]
  )

  // 粘贴上传
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      const files: File[] = []
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) files.push(file)
        }
      }

      if (files.length > 0) {
        handleUpload(files)
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [handleUpload])

  // 删除文件
  const handleDelete = (file: UploadedFile) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== file.id))
    setDeleteDialogOpen(false)
    setFileToDelete(null)
    showToast("已删除")
  }

  // 清空所有记录
  const handleClearAll = () => {
    setUploadedFiles([])
    localStorage.removeItem(STORAGE_KEY)
    showToast("已清空所有记录")
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
        {/* Toast 通知 */ }
        <div
          className={ cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg shadow-lg transition-all duration-300 flex items-center gap-2",
            showCopyToast ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
          ) }
        >
          <Check className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
          <span className="text-sm font-medium">{ toastMessage }</span>
        </div>

        {/* Header */ }
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <FileImage className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
                  图床上传
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ () => setTheme(theme === "light" ? "dark" : "light") }
                  className="text-slate-600 dark:text-slate-400"
                >
                  { theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" /> }
                </Button>
                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 dark:text-slate-400">
                  <Info className="h-4 w-4" />
                  <span className="hidden sm:inline">关于</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */ }
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Upload Area */ }
          <div
            onDragOver={ handleDragOver }
            onDragLeave={ handleDragLeave }
            onDrop={ handleDrop }
            onClick={ () => !isUploading && fileInputRef.current?.click() }
            className={ cn(
              "relative p-8 sm:p-12 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer group",
              isUploading && "pointer-events-none",
              isDragActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 scale-[1.01]"
                : "border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800/50"
            ) }
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div
                className={ cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
                  isDragActive
                    ? "bg-blue-500 text-white scale-110"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 group-hover:text-blue-500"
                ) }
              >
                <Upload className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">
                { isUploading ? "上传中..." : isDragActive ? "释放以上传图片" : "拖放图片到此处，或点击选择" }
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                支持 PNG, JPG, JPEG, WebP, GIF, SVG 格式
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                支持 Ctrl+V 粘贴上传 · 上传后自动复制链接
              </p>

              {/* 上传进度 */ }
              { isUploading && (
                <div className="mt-6 w-full max-w-xs">
                  <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                      style={ { width: `${uploadProgress}%` } }
                    />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    { Math.round(uploadProgress) }%
                  </p>
                </div>
              ) }
            </div>

            <input
              ref={ fileInputRef }
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              disabled={ isUploading }
              onChange={ (e) => {
                const files = Array.from(e.target.files || [])
                handleUpload(files)
                e.target.value = ""
              } }
            />
          </div>

          {/* Settings Bar */ }
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/60 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <Settings2 className="h-4 w-4 text-slate-400" />
              <div className="flex items-center gap-2">
                <Switch
                  id="save-local"
                  checked={ saveToLocal }
                  onCheckedChange={ setSaveToLocal }
                />
                <Label htmlFor="save-local" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  保存上传记录到本地
                </Label>
              </div>
            </div>

            { uploadedFiles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  { uploadedFiles.length } 条记录
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={ handleClearAll }
                  className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  清空
                </Button>
              </div>
            ) }
          </div>

          {/* File List */ }
          { uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                上传记录
              </h3>

              <div className="space-y-2">
                { uploadedFiles.map((file) => (
                  <div
                    key={ file.id }
                    className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    {/* 文件图标 */ }
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center">
                      <FileImage className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* 文件信息 */ }
                    <div className="flex-1 min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate cursor-default">
                            { truncateFilename(file.filename) }
                          </p>
                        </TooltipTrigger>
                        { file.filename.length > 24 && (
                          <TooltipContent>
                            <p>{ file.filename }</p>
                          </TooltipContent>
                        ) }
                      </Tooltip>

                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400">{ formatTime(file.uploadTime) }</span>
                      </div>
                    </div>

                    {/* URL 预览 */ }
                    <div className="hidden sm:block flex-1 min-w-0 max-w-[200px]">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-slate-400 truncate cursor-default">{ file.url }</p>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-md">
                          <p className="break-all text-xs">{ file.url }</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* 操作按钮 */ }
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={ (e) => {
                              e.stopPropagation()
                              copyToClipboard(file.url, file.id)
                            } }
                          >
                            { copiedId === file.id ? (
                              <Check className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            ) }
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>复制链接</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                            onClick={ (e) => {
                              e.stopPropagation()
                              window.open(file.url, "_blank")
                            } }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>打开链接</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={ (e) => {
                              e.stopPropagation()
                              setFileToDelete(file)
                              setDeleteDialogOpen(true)
                            } }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>删除</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )) }
              </div>
            </div>
          ) }

          {/* Empty State */ }
          { uploadedFiles.length === 0 && (
            <div className="mt-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Link2 className="h-8 w-8 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-slate-400 dark:text-slate-500">暂无上传记录</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">上传图片后，链接将显示在这里</p>
            </div>
          ) }
        </main>

        {/* Footer */ }
        <footer className="fixed bottom-0 left-0 right-0 py-3 text-center text-xs text-slate-400 dark:text-slate-500 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent">
          <p>图床上传工具 · 简洁高效</p>
        </footer>

        {/* Delete Confirmation Dialog */ }
        <Dialog open={ deleteDialogOpen } onOpenChange={ setDeleteDialogOpen }>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>确认删除</DialogTitle>
              <DialogDescription>
                确定要删除「{ fileToDelete ? truncateFilename(fileToDelete.filename) : "" }」的记录吗？此操作无法撤销。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={ () => setDeleteDialogOpen(false) }>
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={ () => fileToDelete && handleDelete(fileToDelete) }
              >
                删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
