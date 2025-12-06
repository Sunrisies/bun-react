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
                <div className="flex-shrink-0">
                    <img
                        src={ image.url }
                        alt={ image.name }
                        className="h-12 w-12 object-cover rounded border"
                        onClick={ () => setShowPreview(true) }
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
                        onClick={ () => setShowPreview(true) }
                        className="h-8 w-8 p-0"
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

            {/* 图片预览模态框 */ }
            { showPreview && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="relative bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
                        <img
                            src={ image.url }
                            alt={ image.name }
                            className="w-full h-auto"
                        />
                        <div className="absolute top-4 right-4">
                            <Button
                                onClick={ () => setShowPreview(false) }
                                variant="secondary"
                                size="sm"
                            >
                                关闭预览
                            </Button>
                        </div>
                        <div className="p-4 bg-white">
                            <p className="font-medium">{ image.name }</p>
                            <p className="text-sm text-gray-500">
                                尺寸: { formatFileSize(image.size) }
                            </p>
                        </div>
                    </div>
                </div>
            ) }
        </>
    )
}

export { SortableContext } from "@dnd-kit/sortable"