import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import JSZip from 'jszip'
import { ArrowLeft, Download, Eye, Trash2, Upload, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { downloadLocalFile } from "sunrise-utils"
export const Route = createFileRoute("/watermark")({
  component: Watermark,
})

interface ImageItem {
  id: string
  file: File
  originalUrl: string
  watermarkedUrl: string | null
  name: string
}

function Watermark() {
  const navigate = useNavigate()
  const [images, setImages] = useState<ImageItem[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0)
  const [watermarkText, setWatermarkText] = useState<string>("原创保护")
  const [fontSize, setFontSize] = useState<number>(36)
  const [opacity, setOpacity] = useState<number>(0.3)
  const [color, setColor] = useState<string>("#000000")
  const [rotation, setRotation] = useState<number>(-45)
  const [watermarkMode, setWatermarkMode] = useState<'single' | 'multiple'>('multiple')
  const [activePreset, setActivePreset] = useState<'subtle' | 'bold' | 'diagonal'>("diagonal") // 'subtle', 'bold', 'diagonal', 或 null
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))

    if (imageFiles.length === 0) {
      toast.error("请选择有效的图片文件")
      return
    }

    const newImages: ImageItem[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      originalUrl: URL.createObjectURL(file),
      watermarkedUrl: null,
      name: file.name,
    }))

    setImages(prev => [...prev, ...newImages])

    // if (prev.length === 0 && newImages.length > 0) {
    //   setActiveImageIndex(0)
    // }

    toast.success(`已添加 ${newImages.length} 张图片`)
  }

  // 删除图片
  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.originalUrl)
        if (imageToRemove.watermarkedUrl) {
          URL.revokeObjectURL(imageToRemove.watermarkedUrl)
        }
      }

      const newImages = prev.filter(img => img.id !== id)

      // 如果删除的是当前活动的图片，更新活动索引
      if (newImages.length > 0 && imageToRemove && prev.indexOf(imageToRemove) === activeImageIndex) {
        setActiveImageIndex(Math.min(activeImageIndex, newImages.length - 1))
      } else if (newImages.length === 0) {
        setActiveImageIndex(0)
      }

      return newImages
    })

    toast.success("图片已删除")
  }

  // 清空所有图片
  const clearAllImages = () => {
    images.forEach(img => {
      URL.revokeObjectURL(img.originalUrl)
      if (img.watermarkedUrl) {
        URL.revokeObjectURL(img.watermarkedUrl)
      }
    })
    setImages([])
    setActiveImageIndex(0)
    toast.success("已清空所有图片")
  }

  // 添加水印到当前图片
  const addWatermarkToCurrent = async () => {
    if (images.length === 0) {
      toast.error("请先上传图片")
      return
    }

    const currentImage = images[activeImageIndex]
    if (!currentImage) return

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error("无法创建画布上下文")

      const img = new Image()

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = currentImage.originalUrl
      })

      // 设置画布大小
      canvas.width = img.width
      canvas.height = img.height

      // 绘制原图
      ctx.drawImage(img, 0, 0)

      // 设置水印样式
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      ctx.fillStyle = color + Math.round(opacity * 255).toString(16).padStart(2, '0')
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const angle = (rotation * Math.PI) / 180

      if (watermarkMode === 'single') {
        // 单个水印模式 - 在图片中心添加一个水印
        const x = canvas.width / 2
        const y = canvas.height / 2

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.fillText(watermarkText, 0, 0)
        ctx.restore()
      } else {
        // 多个水印模式 - 覆盖整个画布
        // 计算水印间距和大小
        const textWidth = ctx.measureText(watermarkText).width
        const padding = 100 // 水印之间的间距

        // 计算需要的水印数量以覆盖整个画布
        const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
        const rowsCount = Math.ceil(diagonal / (textWidth + padding)) + 2
        const colsCount = Math.ceil(diagonal / (fontSize + padding)) + 2

        // 绘制多个水印覆盖整个画布
        for (let i = 0; i < rowsCount; i++) {
          for (let j = 0; j < colsCount; j++) {
            const x = (i - rowsCount / 2) * (textWidth + padding) + canvas.width / 2
            const y = (j - colsCount / 2) * (fontSize + padding) + canvas.height / 2

            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(angle)
            ctx.fillText(watermarkText, 0, 0)
            ctx.restore()
          }
        }
      }

      // 更新图片的水印URL
      const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.9)

      setImages(prev => prev.map((img, index) => {
        console.log(index, activeImageIndex)
        return index === activeImageIndex ? { ...img, watermarkedUrl } : img
      }
      ))

      toast.success("水印添加成功")
    } catch (error) {
      console.error("添加水印失败:", error)
      toast.error("添加水印失败，请重试")
    }
  }

  // 为所有图片添加水印
  const addWatermarkToAll = async () => {
    if (images.length === 0) {
      toast.error("请先上传图片")
      return
    }

    if (!watermarkText.trim()) {
      toast.error("请输入水印文字")
      return
    }

    const updatedImages = [...images]

    for (let i = 0; i < updatedImages.length; i++) {
      const image = updatedImages[i]

      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) continue

        const img = new Image()

        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = image.originalUrl
        })

        // 设置画布大小
        canvas.width = img.width
        canvas.height = img.height

        // 绘制原图
        ctx.drawImage(img, 0, 0)

        // 设置水印样式
        ctx.font = `bold ${fontSize}px Arial, sans-serif`
        ctx.fillStyle = color + Math.round(opacity * 255).toString(16).padStart(2, '0')
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        const angle = (rotation * Math.PI) / 180

        if (watermarkMode === 'single') {
          // 单个水印模式 - 在图片中心添加一个水印
          const x = canvas.width / 2
          const y = canvas.height / 2

          ctx.save()
          ctx.translate(x, y)
          ctx.rotate(angle)
          ctx.fillText(watermarkText, 0, 0)
          ctx.restore()
        } else {
          // 多个水印模式 - 覆盖整个画布
          // 计算水印间距和大小
          const textWidth = ctx.measureText(watermarkText).width
          const padding = 100 // 水印之间的间距

          // 计算需要的水印数量以覆盖整个画布
          const diagonal = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height)
          const rowsCount = Math.ceil(diagonal / (textWidth + padding)) + 2
          const colsCount = Math.ceil(diagonal / (fontSize + padding)) + 2

          // 绘制多个水印覆盖整个画布
          for (let i = 0; i < rowsCount; i++) {
            for (let j = 0; j < colsCount; j++) {
              const x = (i - rowsCount / 2) * (textWidth + padding) + canvas.width / 2
              const y = (j - colsCount / 2) * (fontSize + padding) + canvas.height / 2

              ctx.save()
              ctx.translate(x, y)
              ctx.rotate(angle)
              ctx.fillText(watermarkText, 0, 0)
              ctx.restore()
            }
          }
        }

        // 更新水印URL
        updatedImages[i] = {
          ...image,
          watermarkedUrl: canvas.toDataURL('image/jpeg', 0.9)
        }

        // 更新状态以显示进度
        setImages([...updatedImages])
      } catch (error) {
        console.error(`处理图片 ${image.name} 失败:`, error)
      }
    }

    toast.success("所有图片水印添加完成")
  }

  // 下载当前图片
  const downloadCurrent = () => {
    const currentImage = images[activeImageIndex]
    if (!currentImage?.watermarkedUrl) {
      toast.error("请先为该图片添加水印")
      return
    }

    const link = document.createElement('a')
    link.href = currentImage.watermarkedUrl
    link.download = `watermarked_${currentImage.name}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("下载成功")
  }

  // 下载所有图片
  const downloadAll = async () => {
    const watermarkedImages = images.filter(img => img.watermarkedUrl)

    if (watermarkedImages.length === 0) {
      toast.error("没有可下载的图片")
      return
    }

    try {
      toast.loading(`正在打包 ${watermarkedImages.length} 张图片...`)

      const zip = new JSZip()
      const folder = zip.folder("watermarked-images")

      // 为每张图片创建Promise
      const imagePromises = watermarkedImages.map(async (image, index) => {
        try {
          // 从base64 URL获取blob
          const response = await fetch(image.watermarkedUrl!)
          const blob = await response.blob()

          // 获取文件扩展名
          const filename = `watermarked_${index + 1}_${image.name}`

          folder?.file(filename, blob)
          return true
        } catch (error) {
          console.error(`下载图片失败: ${image.name}`, error)
          return false
        }
      })

      // 等待所有图片处理完成
      const results = await Promise.all(imagePromises)
      const successCount = results.filter(Boolean).length

      if (successCount === 0) {
        toast.dismiss()
        toast.error("所有图片下载失败")
        return
      }

      // 生成zip文件
      const content = await zip.generateAsync({ type: "blob" })
      downloadLocalFile(content, `watermarked-images-${new Date().getTime()}.zip`)

      toast.dismiss()
      toast.success(`成功打包 ${successCount} 张图片`)

    } catch (error) {
      toast.dismiss()
      toast.error("打包失败，请重试")
      console.error("打包失败:", error)
    }
  }
  // 应用预设
  const applyPreset = (preset: 'subtle' | 'bold' | 'diagonal') => {
    switch (preset) {
      case 'subtle':
        setWatermarkText("原创")
        setFontSize(24)
        setOpacity(0.2)
        setColor("#000000")
        setRotation(0)
        setActivePreset("subtle")
        break
      case 'bold':
        setWatermarkText("严禁盗用")
        setFontSize(48)
        setOpacity(0.5)
        setColor("#FF0000")
        setRotation(0)
        setActivePreset("bold")
        break
      case 'diagonal':
        setWatermarkText("原创保护")
        setFontSize(36)
        setOpacity(0.3)
        setColor("#000000")
        setRotation(-45)
        setActivePreset("diagonal")
        break
    }
    toast.success("预设已应用")
  }

  // 清理URL
  useEffect(() => {
    return () => {
      images.forEach(img => {
        URL.revokeObjectURL(img.originalUrl)
        if (img.watermarkedUrl) {
          URL.revokeObjectURL(img.watermarkedUrl)
        }
      })
    }
  })

  const currentImage = images[activeImageIndex]
  // 首先在状态中添加新的状态变量
  const [zoomedImage, setZoomomedImage] = useState<{ url: string, type: 'original' | 'watermarked' } | null>(null) // {url, type: 'original' | 'watermarked'}

  // 添加模态框组件
  const ZoomModal = () => {
    if (!zoomedImage) return null

    return (
      <div
        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        onClick={() => setZoomomedImage(null)}
      >
        <div
          className="relative max-w-[90vw] max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setZoomomedImage(null)}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={zoomedImage.url}
            alt={zoomedImage.type === 'original' ? '原图大图' : '水印效果大图'}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
          <div className="absolute bottom-4 left-4 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {zoomedImage.type === 'original' ? '原图' : '水印效果'} •
            点击任意位置关闭
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 h-[calc(100vh-4.2rem)] p-4 md:p-6 p-4 md:p-6">
      <Card className="w-full h-full mx-auto shadow-lg p-0 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="p-0 m-0 px-4 py-2 from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              图片水印工具
            </CardTitle>
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row h-full">
            {/* 左侧：设置区域 */}
            <div className="lg:w-1/3 px-6 border-r border-gray-200 space-y-6">
              {/* 上传区域 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl py-2 px-5 text-center cursor-pointer transition-all duration-300 hover:border-blue-400 hover:bg-blue-50"
              >
                <div className="space-y-4">
                  <Upload className="h-8 w-8 mx-auto text-blue-500" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      点击上传图片
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      支持 JPG, PNG, GIF, WebP, BMP
                    </p>
                  </div>
                  <Button variant="outline">
                    选择图片
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* 快速预设 */}
              {images.length > 0 && (
                <div className="space-y-1">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={activePreset === 'subtle' ? 'default' : 'outline'}
                      onClick={() => applyPreset('subtle')}
                      className="text-sm"
                    >
                      柔和水印
                    </Button>
                    <Button
                      variant={activePreset === 'bold' ? 'default' : 'outline'}
                      onClick={() => applyPreset('bold')}
                      className="text-sm"
                    >
                      醒目水印
                    </Button>
                    <Button
                      variant={activePreset === 'diagonal' ? 'default' : 'outline'}
                      onClick={() => applyPreset('diagonal')}
                      className="text-sm"
                    >
                      对角水印
                    </Button>
                  </div>
                </div>
              )}

              {/* 水印设置 */}
              {images.length > 0 && (
                <div className="space-y-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>水印模式</Label>
                      <div className="flex gap-2">
                        <Button
                          variant={watermarkMode === 'single' ? 'default' : 'outline'}
                          onClick={() => setWatermarkMode('single')}
                          className="flex-1"
                        >
                          单个水印
                        </Button>
                        <Button
                          variant={watermarkMode === 'multiple' ? 'default' : 'outline'}
                          onClick={() => setWatermarkMode('multiple')}
                          className="flex-1"
                        >
                          多个水印
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>水印文字</Label>
                      <Input
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="输入水印文字"
                      />
                    </div>

                    <div className="space-y-2 flex">
                      <div className="flex justify-between w-32">
                        <Label>字体大小: {fontSize}px</Label>
                      </div>
                      <Slider
                        value={[fontSize]}
                        onValueChange={(value) => setFontSize(value[0])}
                        min={12}
                        max={72}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2 flex">
                      <div className="flex justify-between w-32">
                        <Label>透明度: {Math.round(opacity * 100)}%</Label>
                      </div>
                      <Slider
                        value={[opacity]}
                        onValueChange={(value) => setOpacity(value[0])}
                        min={0.1}
                        max={0.9}
                        step={0.1}
                      />
                    </div>

                    <div className="space-y-2 flex">
                      <Label className="flex justify-between w-32">水印颜色</Label>
                      <div className="">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-10 h-10 cursor-pointer rounded border"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={addWatermarkToCurrent}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        应用到当前
                      </Button>
                      <Button
                        onClick={addWatermarkToAll}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        应用到全部
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={downloadCurrent}
                        variant="outline"
                        disabled={!currentImage?.watermarkedUrl}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载当前
                      </Button>
                      <Button
                        onClick={downloadAll}
                        variant="outline"
                        disabled={images.filter(img => img.watermarkedUrl).length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载全部
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={clearAllImages}
                      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      清空所有图片
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* 右侧：预览区域 */}
            <div className="lg:w-2/3 p-6">
              {images.length > 0 ? (
                <div className="space-y-6 h-full">
                  {/* 图片导航 */}
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-700">
                      图片预览 ({activeImageIndex + 1}/{images.length})
                    </h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveImageIndex(Math.max(0, activeImageIndex - 1))}
                        disabled={activeImageIndex === 0}
                      >
                        上一张
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveImageIndex(Math.min(images.length - 1, activeImageIndex + 1))}
                        disabled={activeImageIndex === images.length - 1}
                      >
                        下一张
                      </Button>
                    </div>
                  </div>

                  {/* 图片缩略图列表 */}
                  <div className="flex gap-2 overflow-x-auto pb-2">

                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        onClick={() => setActiveImageIndex(index)}
                        className={`
                          relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 cursor-pointer
                          ${index === activeImageIndex
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200'
                          }
                        `}
                      >
                        <img
                          src={img.originalUrl}
                          alt={`缩略图 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {img.watermarkedUrl && (
                          <div className="absolute top-1 right-1">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                              <Eye className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-0.5 text-center">
                          {index + 1}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeImage(img.id)
                          }}
                          className="absolute top-1 left-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 主预览区域 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">原图</h4>
                        <span className="text-xs text-gray-500">
                          {currentImage?.name}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-lg border p-2">
                        <div className="aspect-video rounded overflow-hidden bg-white">
                          <img
                            src={currentImage?.originalUrl}
                            alt="原图预览"
                            className="w-full h-full object-contain cursor-pointer"
                            onClick={() => setZoomomedImage({
                              url: currentImage?.originalUrl,
                              type: 'original'
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">水印效果</h4>
                        {currentImage?.watermarkedUrl && (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            已添加水印
                          </span>
                        )}
                      </div>
                      <div className="bg-gray-100 rounded-lg border p-2">
                        <div className="aspect-video rounded overflow-hidden bg-white relative">
                          <img
                            src={currentImage?.watermarkedUrl || currentImage?.originalUrl}
                            alt="水印效果"
                            className="w-full h-full object-contain"
                            onClick={() => setZoomomedImage({
                              url: currentImage?.watermarkedUrl || currentImage?.originalUrl,
                              type: 'watermarked'
                            })}
                          />

                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 无数据状态
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-40 h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                    <Upload className="h-20 w-20 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    暂无图片
                  </h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    上传图片开始添加水印。支持批量上传，操作简单快捷。
                  </p>

                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      <ZoomModal />
    </div>

  )
}