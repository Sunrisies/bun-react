import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, Copy, File, Link, CheckCheck } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDropzone } from "react-dropzone"

export const Route = createFileRoute("/fileUploader")({
  component: FileUploaderComponent,
})

function FileUploaderComponent() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<Array<{ file: File; url?: string }>>([]) // 修改状态结构
  const [uploading, setUploading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  // 上传文件到服务器
  const uploadFiles = async (filesToUpload: Array<{ file: File; url?: string }>) => {
    setUploading(true)
    try {
      const uploadPromises = filesToUpload.map(async (fileToUpload) => {
        try {
          console.log('Uploading file:', fileToUpload.file.name)
          const formData = new FormData()
          formData.append('file', fileToUpload.file, fileToUpload.file.name)

          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000)

          const response = await fetch('https://api.chaoyang1024.top:2345/new/api/storage', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            throw new Error(`上传失败: ${fileToUpload.file.name}`)
          }

          const result = await response.json()
          if (result.code !== 200) {
            throw new Error(result.message || `上传失败: ${fileToUpload.file.name}`)
          }

          // 返回上传结果
          return {
            originalFile: fileToUpload.file,
            url: result.data.path
          }

          toast.success(`${fileToUpload.file.name} 上传成功`)
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              toast.error(`${fileToUpload.file.name} 上传超时`)
            } else {
              toast.error(`${fileToUpload.file.name} ${error.message}`)
            }
          }
          throw error
        }
      })

      // 等待所有上传完成并更新状态
      const results = await Promise.all(uploadPromises)

      // 更新文件状态
      setFiles(prev => prev.map(item => {
        const result = results.find(r => r.originalFile === item.file)
        return result ? { ...item, url: result.url } : item
      }))

    } catch (error) {
      console.error("文件上传失败", error)
      // 错误已在单个上传中处理
    } finally {
      setUploading(false)
    }
  }

  // 处理文件上传
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({ file }))
    setFiles((prev) => [...prev, ...newFiles])
    toast.success(`成功添加 ${acceptedFiles.length} 个文件`)
  }, [])

  // 处理粘贴上传
  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items
    if (!items) return

    const pastedFiles = Array.from(items)
      .filter(item => item.kind === 'file')
      .map(item => {
        const file = item.getAsFile()
        if (!file) return null

        // 直接使用原始文件，添加时间戳到文件名
        const timestamp = new Date().getTime()
        const extension = file.name.split('.').pop() || ''
        const newName = `paste_${timestamp}.${extension}`

        // 创建一个新的对象来存储文件信息
        return {
          file: Object.defineProperty(file, 'name', {
            writable: true,
            value: newName
          })
        }
      })
      .filter((file): file is { file: File } => file !== null)

    if (pastedFiles.length > 0) {
      setFiles((prev) => [...prev, ...pastedFiles])
      console.log('Pasted files:', pastedFiles)  // 打印粘贴的文件inf  
      toast.success(`成功粘贴 ${pastedFiles.length} 个文件`)
    }
  }, [])

  // 复制URL到剪贴板
  const copyUrl = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedIndex(index)
      toast.success('已复制URL到剪贴板')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('复制失败', err)
      toast.error('复制失败')
    }
  }

  // 监听粘贴事件
  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [handlePaste])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  })

  // 清空文件列表
  const clearFiles = () => {
    setFiles([])
    toast.success("已清空文件列表")
  }

  // 手动上传文件
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('请先添加文件')
      return
    }

    // 只上传没有 URL 的文件
    const newFiles = files.filter(f => !f.url)

    if (newFiles.length === 0) {
      toast.info('没有新文件需要上传')
      return
    }

    toast.info(`准备上传 ${newFiles.length} 个新文件`)
    await uploadFiles(newFiles)
  }

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>文件上传工具</CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 上传区域 */ }
          <div
            { ...getRootProps() }
            className={ `border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300"}
              ${uploading ? "pointer-events-none opacity-50" : ""}` }
          >
            <input { ...getInputProps() } disabled={ uploading } />
            <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-xl font-medium text-gray-700 mb-2">
              { isDragActive ? "松开鼠标上传" : uploading ? "文件上传中..." : "拖放文件至此或点击选择" }
            </p>
            <p className="text-sm text-gray-500">
              支持拖拽、点击选择或直接粘贴文件
            </p>
          </div>

          {/* 文件列表 */ }
          { files.length > 0 && (
            <div className="space-y-4">
              <div className="border rounded-lg divide-y">
                { files.map(({ file, url }, index) => (
                  <div
                    key={ index }
                    className="p-3 flex items-center gap-3 hover:bg-gray-50"
                  >
                    <File className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium truncate">{ file.name }</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-gray-500">
                          { (file.size / 1024).toFixed(2) } KB
                        </p>
                        { url && (
                          <div className="flex items-center gap-2">
                            <Link className="h-4 w-4 text-blue-500" />
                            <p className="text-sm text-blue-500 truncate">{ url }</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={ () => copyUrl(url, index) }
                            >
                              { copiedIndex === index ? (
                                <CheckCheck className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              ) }
                            </Button>
                          </div>
                        ) }
                      </div>
                    </div>
                  </div>
                )) }
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={ clearFiles }
                  disabled={ uploading }
                >
                  清空列表
                </Button>
                <Button
                  variant="default"
                  onClick={ handleUpload }
                  disabled={ uploading }
                >
                  { uploading ? '上传中...' : '开始上传' }
                </Button>
              </div>
            </div>
          ) }

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>提示：您也可以直接粘贴文件到此页面</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}