// components/ui/sortable-item.tsx
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "./ui/button"
import { GripVertical, Trash2, Eye } from "lucide-react"
import { useState } from "react"

interface SortableImageItemProps {
    id: string
    image: {
        url: string
        name: string
        size?: number
    }
    onDelete: (id: string) => void
}

export function SortableImageItem({ id, image, onDelete }: SortableImageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const [showPreview, setShowPreview] = useState(false)
    const [showLargePreview, setShowLargePreview] = useState(false)
    const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return "未知大小"
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <>
            <div
                ref={ setNodeRef }
                style={ style }
                className={ `
          flex items-center gap-3 p-3 border rounded-lg
          ${isDragging
                        ? "border-blue-500 bg-blue-50 shadow-lg z-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }
          transition-all duration-200
        `}
            >
                {/* 拖拽手柄 */ }
                <div
                    { ...attributes }
                    { ...listeners }
                    className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                >
                    <GripVertical className="h-5 w-5" />
                </div>

                {/* 图片缩略图 */ }
                <div className="flex-shrink-0 relative">
                    <img
                        src={ image.url }
                        alt={ image.name }
                        className="h-12 w-12 object-cover rounded border cursor-pointer"
                        onMouseEnter={ (e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            // 计算预览框位置，确保不超出视窗
                            const previewWidth = 500
                            const previewHeight = 500

                            let x = rect.right + 10
                            let y = rect.top

                            // 如果右侧空间不足，显示在左侧
                            if (x + previewWidth > window.innerWidth) {
                                x = rect.left - previewWidth - 10
                            }

                            // 如果底部空间不足，向上调整
                            if (y + previewHeight > window.innerHeight) {
                                y = window.innerHeight - previewHeight - 10
                            }

                            setPreviewPosition({ x, y })
                            setShowPreview(true)
                        } }
                        onMouseLeave={ () => setShowPreview(false) }
                        onClick={ () => setShowLargePreview(true) }
                    />
                </div>

                {/* 文件信息 */ }
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{ image.name }</p>
                    <p className="text-xs text-gray-500">
                        { formatFileSize(image.size) }
                    </p>
                </div>

                {/* 操作按钮 */ }
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={ () => {
                            // 打开新窗口显示大图
                            const newWindow = window.open()
                            if (newWindow) {
                                newWindow.document.write(`
                                    <html>
                                        <head>
                                            <title>${image.name}</title>
                                            <style>
                                                body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; }
                                                img { max-width: 90vw; max-height: 90vh; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                                            </style>
                                        </head>
                                        <body>
                                            <img src="${image.url}" alt="${image.name}" />
                                        </body>
                                    </html>
                                `)
                            }
                        } }
                        className="h-8 w-8 p-0"
                        title="在新窗口中查看大图"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={ () => onDelete(id) }
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* 图片悬浮预览 */ }
            { showPreview && (
                <div
                    className="fixed z-50 bg-white rounded-lg shadow-xl border overflow-hidden"
                    style={ {
                        left: `${previewPosition.x}px`,
                        top: `${previewPosition.y}px`,
                        width: '500px',
                        maxHeight: '600px'
                    } }
                    onMouseEnter={ () => setShowPreview(true) }
                    onMouseLeave={ () => setShowPreview(false) }
                >
                    <div className="relative" style={ { paddingBottom: '75%' } }>
                        <img
                            src={ image.url }
                            alt={ image.name }
                            className="absolute inset-0 w-full h-full object-contain bg-gray-50"
                        />
                    </div>
                    <div className="p-2 bg-white border-t">
                        <p className="text-xs font-medium truncate">{ image.name }</p>
                        <p className="text-xs text-gray-500">
                            { formatFileSize(image.size) }
                        </p>
                    </div>
                </div>
            ) }

            {/* 点击缩略图显示的大图弹窗 */ }
            { showLargePreview && (
                <div className="fixed inset-0  bg-black/70 z-50 flex items-center justify-center p-4"
                    onClick={ () => setShowLargePreview(false) }>
                    <div className="relative bg-white rounded-lg max-w-5xl max-h-[90vh] overflow-auto"
                        onClick={ (e) => e.stopPropagation() }>
                        <img
                            src={ image.url }
                            alt={ image.name }
                            className="w-[400px] object-contain"
                        />
                        <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                                onClick={ () => {
                                    // 下载图片
                                    const link = document.createElement('a')
                                    link.href = image.url
                                    link.download = image.name
                                    document.body.appendChild(link)
                                    link.click()
                                    document.body.removeChild(link)
                                    toast.success("图片已开始下载")
                                } }
                                variant="secondary"
                                size="sm"
                            >
                                下载图片
                            </Button>
                            <Button
                                onClick={ () => setShowLargePreview(false) }
                                variant="secondary"
                                size="sm"
                            >
                                关闭
                            </Button>
                        </div>
                    </div>
                </div>
            ) }
        </>
    )
}

export { SortableContext } from "@dnd-kit/sortable"