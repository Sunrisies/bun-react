
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, Copy, Check, Trash2, ZoomIn, ZoomOut, RotateCw, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { useDropzone } from "react-dropzone"
import { useTheme } from "@/components/theme-provider"

export const Route = createFileRoute("/imageGallery")({
  component: ImageGallery,
})

interface ImageItem {
  id: string
  file: File
  url: string
  base64?: string
  name: string
  size: number
  type: string
  width: number
  height: number
  createdAt: number
}

function ImageGallery() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 从localStorage加载保存的图片
  useEffect(() => {
    try {
      const savedImages = localStorage.getItem("gallery_images")
      if (savedImages) {
        const parsed = JSON.parse(savedImages)
        // 重新创建URL对象
        const restoredImages = parsed.map((img: any) => ({
          ...img,
          url: img.base64 || URL.createObjectURL(new File([new Blob()], img.name, { type: img.type }))
        }))
        setImages(restoredImages)
      }
    } catch (error) {
      console.error("加载图片失败:", error)
    }
  }, [])

  // 保存图片到localStorage（使用base64）
  useEffect(() => {
    if (images.length > 0) {
      try {
        // 只保存最近50张图片的base64，避免localStorage溢出
        const imagesToSave = images.slice(-50).map(img => ({
          ...img,
          url: "", // 不保存URL
          base64: img.base64 // 保存base64数据
        }))
        localStorage.setItem("gallery_images", JSON.stringify(imagesToSave))
      } catch (error) {
        console.error("保存图片失败:", error)
        toast.error("保存图片失败，可能超出存储限制")
      }
    }
  }, [images])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: ImageItem[] = []

    for (const file of acceptedFiles) {
      try {
        const url = URL.createObjectURL(file)
        const img = new Image()

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = url
        })

        // 转换为base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        newImages.push({
          id: Date.now() + Math.random().toString(36),
          file,
          url,
          base64,
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          createdAt: Date.now()
        })
      } catch (error) {
        console.error(`处理图片 ${file.name} 失败:`, error)
        toast.error(`处理图片 ${file.name} 失败`)
      }
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages])
      toast.success(`成功添加 ${newImages.length} 张图片`)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']
    },
    multiple: true,
  })

  const handleDelete = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id)
      if (img) {
        URL.revokeObjectURL(img.url)
      }
      return prev.filter(i => i.id !== id)
    })
    if (selectedImage?.id === id) {
      setSelectedImage(null)
    }
    toast.success("图片已删除")
  }

  const handleCopy = async (image: ImageItem) => {
    try {
      await navigator.clipboard.writeText(image.base64 || image.url)
      setCopiedId(image.id)
      toast.success("已复制到剪贴板")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error("复制失败:", error)
      toast.error("复制失败")
    }
  }

  const handleDownload = (image: ImageItem) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("开始下载")
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const resetView = () => {
    setZoomLevel(1)
    setRotation(0)
  }

  return (
    <div className="h-[calc(100vh-65px)] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900 transition-colors duration-300">
      {/* Header */ }
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={ () => navigate({ to: "/" }) }
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  图库
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  { images.length } 张图片
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={ () => fileInputRef.current?.click() }
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Upload className="h-4 w-4 mr-2" />
                上传图片
              </Button>
              <input
                ref={ fileInputRef }
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={ (e) => {
                  const files = Array.from(e.target.files || [])
                  if (files.length > 0) {
                    onDrop(files)
                  }
                } }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */ }
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Area */ }
        <div
          { ...getRootProps() }
          className={ `mb-8 p-12 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer
            ${isDragActive
              ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }` }
        >
          <input { ...getInputProps() } />
          <div className="flex flex-col items-center justify-center text-center">
            <div className={ `w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300
              ${isDragActive
                ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white scale-110'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
              }` }>
              <Upload className="h-10 w-10" />
            </div>
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              { isDragActive ? '释放以上传图片' : '拖放图片到此处，或点击选择' }
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              支持 PNG, JPG, JPEG, WebP, GIF, SVG 格式
            </p>
          </div>
        </div>

        {/* Image Grid */ }
        { images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            { images.map((image) => (
              <div
                key={ image.id }
                className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500"
              >
                {/* Image */ }
                <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={ image.url }
                    alt={ image.name }
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Overlay */ }
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <p className="text-white text-sm font-medium truncate mb-2">
                    { image.name }
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={ (e) => {
                        e.stopPropagation()
                        handleCopy(image)
                      } }
                      className="flex-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg py-2 px-3 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      { copiedId === image.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" /> }
                      <span className="text-xs font-medium">
                        { copiedId === image.id ? '已复制' : '复制' }
                      </span>
                    </button>
                    <button
                      onClick={ (e) => {
                        e.stopPropagation()
                        handleDelete(image.id)
                      } }
                      className="bg-red-500/80 hover:bg-red-600 backdrop-blur-sm text-white rounded-lg py-2 px-3 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Size Badge */ }
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                  { formatFileSize(image.size) }
                </div>
              </div>
            )) }
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 mb-6">
              <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">暂无图片，请上传</p>
          </div>
        ) }
      </div>

      {/* Image Preview Modal */ }
      { selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full h-full flex flex-col">
            {/* Modal Header */ }
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ () => {
                    setSelectedImage(null)
                    resetView()
                  } }
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="text-white">
                  <p className="font-medium truncate max-w-md">{ selectedImage.name }</p>
                  <p className="text-sm text-gray-300">
                    { formatFileSize(selectedImage.size) } • { selectedImage.width } × { selectedImage.height }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ handleZoomOut }
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <span className="text-white min-w-[3rem] text-center text-sm font-medium">
                  { Math.round(zoomLevel * 100) }%
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ handleZoomIn }
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ handleRotate }
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ () => handleCopy(selectedImage) }
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  { copiedId === selectedImage.id ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" /> }
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ () => handleDownload(selectedImage) }
                  className="text-white hover:bg-white/10 transition-colors"
                >
                  <Download className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={ () => handleDelete(selectedImage.id) }
                  className="text-white hover:bg-red-500/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Image Container */ }
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <img
                src={ selectedImage.url }
                alt={ selectedImage.name }
                style={ {
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                } }
              />
            </div>
          </div>
        </div>
      ) }
    </div>
  )
}
