import { createFileRoute } from "@tanstack/react-router"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, Upload, Download, Grid, Image as ImageIcon, Info } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDropzone } from "react-dropzone"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableImageItem } from "@/components/sortable-item"
import jsPDF from "jspdf"
import { BackButton } from "@/components/BackButton"

export const Route = createFileRoute("/imageToPdf")({
  component: ImageToPdfConverter,
})
interface ILayout {
  x: number
  y: number
  width: number
  height: number
}
interface ImageFile {
  id: string
  url: string
  name: string
  size?: number
}

interface PageLayout {
  imagesPerPage: number
}

function ImageToPdfConverter() {
  const navigate = useNavigate()
  const [images, setImages] = useState<ImageFile[]>([])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [pageLayout, setPageLayout] = useState<PageLayout>({
    imagesPerPage: 1
  })

  // 使用传感器来更好地处理拖拽
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // 清理图片URL - 改为在组件卸载时清理，而不是每次images变化时清理
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 移除images依赖，只在组件卸载时执行

  // 修改后的onDrop处理函数
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`文件 ${file.name} 不是有效的图片类型`)
        return false
      }
      return true
    })

    // 验证图片有效性
    const imagePromises = validFiles.map((file) => {
      return new Promise<ImageFile | null>((resolve) => {
        const objectUrl = URL.createObjectURL(file) // 单独保存URL引用
        const img = new Image()
        img.src = objectUrl
        img.onload = () => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            url: objectUrl, // 使用保存的URL引用
            name: file.name,
            size: file.size,
          })
        }
        img.onerror = () => {
          toast.error(`文件 ${file.name} 无法被识别为图片`)
          URL.revokeObjectURL(objectUrl)
          resolve(null)
        }
      })
    })

    Promise.all(imagePromises).then((results) => {
      const newImages = results.filter((img): img is ImageFile => img !== null)
      setImages((prev) => [...prev, ...newImages])

      if (newImages.length > 0) {
        toast.success(`成功添加 ${newImages.length} 张图片`)
      }
    })
  }, [])

  // Dropzone配置
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"],
    },
    maxFiles: 100,
    multiple: true,
  })

  // 拖拽排序逻辑
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over?.id)

        // 创建新数组，但保留原始URL引用
        const newItems = items.map(item => ({ ...item }))
        return arrayMove(newItems, oldIndex, newIndex)
      })
      toast.success("图片顺序已更新")
    }
    setActiveId(null)
  }

  // 计算PDF中每张图片的尺寸和位置（支持最多6张）
  const calculateImageLayout = (
    pageWidth: number,
    pageHeight: number,
    imageCount: number
  ): ILayout[] => {
    const margin = 10
    const spacing = 5

    // 预先计算常用值
    const availableWidth = pageWidth - 2 * margin
    const availableHeight = pageHeight - 2 * margin

    // 辅助函数：创建单个布局项
    const createLayoutItem = (x: number, y: number, width: number, height: number): ILayout => ({
      x, y, width, height
    })


    // 辅助函数：创建水平布局
    const createHorizontalLayout = (count: number): ILayout[] => {
      const itemWidth = (availableWidth - (count - 1) * spacing) / count
      return Array.from({ length: count }, (_, i) =>
        createLayoutItem(
          margin + i * (itemWidth + spacing),
          margin,
          itemWidth,
          availableHeight
        )
      )
    }

    // 辅助函数：创建网格布局
    const createGridLayout = (rows: number, cols: number): ILayout[] => {
      const cellWidth = (availableWidth - (cols - 1) * spacing) / cols
      const cellHeight = (availableHeight - (rows - 1) * spacing) / rows

      const layout: ILayout[] = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          layout.push(
            createLayoutItem(
              margin + col * (cellWidth + spacing),
              margin + row * (cellHeight + spacing),
              cellWidth,
              cellHeight
            )
          )
        }
      }
      return layout
    }

    // 使用垂直布局
    const isHorizontal = false

    switch (imageCount) {
      case 1:
        return [createLayoutItem(margin, margin, availableWidth, availableHeight)]

      case 2:
        return createHorizontalLayout(2)

      case 3:
        return createHorizontalLayout(3)

      case 4:
        // 2×2 grid layout
        return createGridLayout(2, 2)

      case 5:
        if (isHorizontal) {
          // 水平布局：5张图片并排
          return createHorizontalLayout(5)
        } else {
          // 垂直布局：上2下3
          const topRowHeight = availableHeight * 0.4 - spacing
          const bottomRowHeight = availableHeight * 0.6

          // 第一行：2张图片
          const topRow = createGridLayout(1, 2).map(item => ({
            ...item,
            height: topRowHeight
          }))

          // 第二行：3张图片
          const bottomRow = createGridLayout(1, 3).map(item => ({
            ...item,
            y: item.y + topRowHeight + spacing,
            height: bottomRowHeight
          }))

          return [...topRow, ...bottomRow]
        }

      case 6:
        // 2×3 grid layout (2 rows, 3 columns)
        return createGridLayout(2, 3)

      default:
        return createHorizontalLayout(imageCount)
    }
  }

  // 生成PDF
  const generatePdf = async () => {
    if (images.length === 0) {
      toast.error("请先添加图片")
      return
    }

    try {
      // 创建一个新数组，避免直接修改原始数组
      const sortedImages = [...images]

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // 根据每页图片数量计算布局
      const imagesPerPage = Math.min(pageLayout.imagesPerPage, 6) // 限制最多6张
      const layout = calculateImageLayout(pageWidth, pageHeight, imagesPerPage)

      // 按布局排列图片
      for (let i = 0; i < sortedImages.length; i++) {
        const img = sortedImages[i]
        const layoutIndex = i % imagesPerPage

        // 如果当前页已满或不是第一张图片，且需要换页
        if (i > 0 && layoutIndex === 0) {
          pdf.addPage('a4', 'portrait')
        }

        // 使用 fetch 和 createObjectURL 确保图片数据正确加载
        try {
          const response = await fetch(img.url)
          const blob = await response.blob()
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
          })

          const imgElement = new Image()
          imgElement.src = dataUrl

          await new Promise<void>((resolve, reject) => {
            imgElement.onload = () => {
              try {
                const { x, y, width, height } = layout[layoutIndex]

                // 保持图片比例
                const imgRatio = imgElement.width / imgElement.height
                const layoutRatio = width / height

                let drawWidth = width
                let drawHeight = height
                let drawX = x
                let drawY = y

                if (imgRatio > layoutRatio) {
                  // 图片更宽，以宽度为准
                  drawHeight = width / imgRatio
                  drawY = y + (height - drawHeight) / 2
                } else {
                  // 图片更高，以高度为准
                  drawWidth = height * imgRatio
                  drawX = x + (width - drawWidth) / 2
                }

                pdf.addImage(dataUrl, "JPEG", drawX, drawY, drawWidth, drawHeight)
                resolve()
              } catch (error) {
                reject(error)
              }
            }

            imgElement.onerror = () => {
              reject(new Error(`无法加载图片: ${img.name}`))
            }
          })
        } catch (error) {
          console.error(`处理图片 ${img.name} 时出错:`, error)
          toast.error(`处理图片 ${img.name} 时出错`)
        }
      }

      // 生成文件名
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')
      pdf.save(`图片转PDF-${timestamp}.pdf`)

      toast.success("PDF生成成功！")
    } catch (error) {
      console.error("生成PDF时出错:", error)
      toast.error(`生成PDF失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  // 更新每页图片数量
  const handleImagesPerPageChange = (value: string) => {
    const newValue = parseInt(value)
    setPageLayout(prev => ({
      ...prev,
      imagesPerPage: newValue
    }))

    // 根据选择的数量给出提示
    const layoutTips = {
      1: "全屏显示，适合高质量图片",
      2: "垂直排列，适合对比展示",
      3: "垂直均分，适合连续内容",
      4: "2×2网格，均衡布局",
      5: "2+3布局，上2下3",
      6: "2×3网格，紧凑展示"
    }

    toast.success(`已设置为每页${newValue}张图片 - ${layoutTips[newValue as keyof typeof layoutTips]}`)
  }

  return (
    <div className="h-[calc(100vh-4.2rem)] p-4 md:p-6 p-4 md:p-6">
      <Card className="w-full h-full max-w-6xl px-3 py-2 mx-auto shadow-lg dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="pb-2 from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                🖼️ 图片转PDF工具
                {/* 使用提示 - 悬浮图标 */ }
                <div className="relative inline-block group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
                    <Info className="h-6 w-6" />
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-white border-l border-t border-gray-200"></div>
                    <h4 className="font-medium text-gray-800 mb-2">💡 使用提示</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• 拖拽图片列表中的图片可以调整生成PDF时的顺序</li>
                      <li>• 每页可设置显示1-6张图片，系统会自动调整布局</li>
                      <li>• 生成的PDF会自动保持图片原始比例</li>
                    </ul>
                  </div>
                </div>
              </CardTitle>
            </div>
            <BackButton />

          </div>
        </CardHeader>

        <CardContent className="p-0 h-full">
          <div className="flex flex-col lg:flex-row h-full">
            {/* 左侧区域：上传和设置 */ }
            <div className="lg:w-1/2 px-6 flex  gap-3 border-r border-gray-200 space-y-6">
              {/* 上传区域 */ }
              <div className="w-full flex flex-col gap-2">
                <div
                  { ...getRootProps() }
                  className={ `
                  border-2 border-dashed rounded-xl px-8 py-3 text-center cursor-pointer
                  transition-all duration-300 ease-in-out
                  ${isDragActive
                      ? "border-blue-500 bg-blue-50 scale-[1.02] shadow-lg"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    }
                `}
                >
                  <input { ...getInputProps() } />
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-blue-500" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        { isDragActive ? "松开鼠标上传图片" : "拖放图片到此处或点击上传" }
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        支持 JPG, PNG, GIF, WebP, BMP 格式
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        最多可上传100张图片，单张图片最大10MB
                      </p>
                    </div>
                    <Button variant="outline" className="">
                      选择图片
                    </Button>
                  </div>
                </div>

                <div className="gap-4">
                  {/* 每页图片数量设置 */ }
                  <div className="space-y-2">
                    <label htmlFor="images-per-page" className="text-sm text-gray-700 flex items-center gap-1">
                      <Grid className="h-4 w-4 text-gray-500" />
                      每页数量:
                    </label>
                    <select
                      id="images-per-page"
                      value={ pageLayout.imagesPerPage }
                      onChange={ (e) => handleImagesPerPageChange(e.target.value) }
                      className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="1">1张（全屏显示）</option>
                      <option value="2">2张（垂直排列）</option>
                      <option value="3">3张（垂直均分）</option>
                      <option value="4">4张（2×2网格）</option>
                      <option value="5">5张（上2下3布局）</option>
                      <option value="6">6张（2×3网格）</option>
                    </select>
                  </div>



                </div>
                {/* 操作按钮 */ }
                { images.length > 0 && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={ generatePdf }
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      生成PDF文件
                    </Button>
                    <Button
                      variant="outline"
                      onClick={ () => {
                        setImages([])
                        toast.success("已清空所有图片")
                      } }
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      清空所有
                    </Button>
                  </div>
                ) }
                { images.length > 0 && (
                  <div className=" pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">📐 布局预览</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex justify-between">
                        <span>每页图片数量:</span>
                        <span className="font-medium">{ pageLayout.imagesPerPage }张</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-3">
                        { pageLayout.imagesPerPage === 1 && "单张全屏显示" }
                        { pageLayout.imagesPerPage === 2 && "垂直排列，适合对比展示" }
                        { pageLayout.imagesPerPage === 3 && "垂直均分，适合连续内容" }
                        { pageLayout.imagesPerPage === 4 && "2×2网格，均衡布局" }
                        { pageLayout.imagesPerPage === 5 && "上2下3布局，灵活展示" }
                        { pageLayout.imagesPerPage === 6 && "2×3网格，紧凑展示" }
                      </p>
                    </div>
                    {/* 图片统计 */ }
                    <div className="space-y-2">
                      <label className="text-sm text-gray-700 flex items-center gap-1">
                        <ImageIcon className="h-4 w-4 text-gray-500" />
                        图片统计:
                      </label>
                      <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                        { images.length > 0 ? (
                          <div className="space-y-1">
                            <p>已选择 <span className="font-bold text-blue-600">{ images.length }</span> 张图片</p>
                            <p className="text-xs text-gray-500">
                              预计页数: <span className="font-bold">
                                { Math.ceil(images.length / pageLayout.imagesPerPage) }
                              </span> 页
                            </p>
                          </div>
                        ) : (
                          <p className="text-gray-500">暂无图片</p>
                        ) }
                      </div>
                    </div>
                  </div>
                ) }
              </div>
            </div>

            {/* 右侧区域：图片预览 */ }
            <div className="lg:w-1/2 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">图片预览 ({ images.length }张)</h3>
                { images.length > 0 && (
                  <p className="text-sm text-gray-500">
                    拖拽图片调整顺序
                  </p>
                ) }
              </div>

              { images.length > 0 ? (
                <>
                  <DndContext
                    sensors={ sensors }
                    collisionDetection={ closestCenter }
                    onDragStart={ handleDragStart }
                    onDragEnd={ handleDragEnd }
                  >
                    <SortableContext
                      items={ images.map(img => img.id) }
                      strategy={ verticalListSortingStrategy }
                    >
                      <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                        { images.map((img, index) => (
                          <div key={ img.id } className="relative">
                            {/* 序号标记 */ }
                            <div className="absolute left-[-32px] top-1/2 transform -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium z-10">
                              { index + 1 }
                            </div>
                            <SortableImageItem
                              id={ img.id }
                              image={ img }
                              onDelete={ (id) => {
                                setImages(prev => prev.filter(i => i.id !== id))
                                toast.success("图片已删除")
                              } }
                            />
                          </div>
                        )) }
                      </div>
                    </SortableContext>
                    <DragOverlay>
                      { activeId ? (
                        <div className="border-2 border-blue-500 rounded-lg p-3 bg-white shadow-xl opacity-80 rotate-1 flex items-center gap-3">
                          <div className="w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            { images.findIndex(img => img.id === activeId) + 1 }
                          </div>
                          <img
                            src={ images.find(img => img.id === activeId)?.url || '' }
                            alt="拖拽中"
                            className="h-12 w-12 object-cover rounded"
                          />
                          <span className="font-medium truncate max-w-[200px]">
                            { images.find(img => img.id === activeId)?.name }
                          </span>
                        </div>
                      ) : null }
                    </DragOverlay>
                  </DndContext>

                  {/* 生成按钮（移动端显示） */ }
                  <div className="lg:hidden mt-6">
                    <Button
                      onClick={ generatePdf }
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md"
                      size="lg"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      生成PDF文件 ({ images.length }张)
                    </Button>
                  </div>
                </>
              ) : (
                // 无数据状态
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                    <ImageIcon className="h-16 w-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    暂无图片
                  </h3>
                  <p className="text-gray-500 max-w-md mb-6">
                    上传一些图片来开始创建您的PDF文档。支持JPG、PNG、GIF等多种格式。
                  </p>

                </div>
              ) }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}