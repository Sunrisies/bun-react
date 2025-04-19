import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Upload, Download } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import jsPDF from "jspdf";

export const Route = createFileRoute("/imageToPdf")({
  component: ImageToPdfConverter,
});

interface ImageFile {
  id: string;
  url: string;
  name: string;
}
interface FileError {
  message: string;
  code:
    | "file-too-large"
    | "file-too-small"
    | "too-many-files"
    | "file-invalid-type"
    | string;
}
function ImageToPdfConverter() {
  const navigate = useNavigate();
  const [images, setImages] = useState<ImageFile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 修改后的onDrop处理函数
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`文件 ${file.name} 不是有效的图片类型`);
        return false;
      }
      return true;
    });

    // 添加图片有效性验证
    validFiles.forEach((file) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onerror = () => {
        toast.error(`文件 ${file.name} 无法被识别为图片`);
        URL.revokeObjectURL(img.src);
      };
    });

    const newImages = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  // 更新Dropzone配置，添加文件校验
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    validator: (file): FileError | readonly FileError[] | null => {
      if (!["image/png", "image/jpeg"].includes(file.type)) {
        // 假设 FileError 有 message 属性，根据实际情况调整
        return { message: "仅支持PNG/JPEG格式" } as FileError;
      }
      return null;
    },
  });

  // 拖拽排序逻辑
  const handleDragStart = (event: any) => setActiveId(event.active.id);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  // 生成PDF
  const generatePdf = async () => {
    if (images.length === 0) {
      toast.error("请先添加图片");
      return;
    }
    console.log(images);
    const pdf = new jsPDF();
    for (const [index, img] of images.entries()) {
      if (index > 0) pdf.addPage();

      const imgElement = new Image();
      imgElement.src = img.url;
      await new Promise((resolve) => {
        imgElement.onload = () => {
          const width = pdf.internal.pageSize.getWidth();
          const height = (imgElement.height * width) / imgElement.width;
          pdf.addImage(imgElement, "JPEG", 0, 0, width, height);
          resolve(true);
        };
      });
    }

    pdf.save("combined-images.pdf");
    toast.success("PDF生成成功");
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>图片转PDF工具</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 上传区域 */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2" />
            <p>{isDragActive ? "松开鼠标上传" : "拖放图片至此或点击选择"}</p>
            <p className="text-sm text-gray-500">支持PNG、JPG格式</p>
          </div>

          {/* 图片预览列表 */}
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="border rounded p-2 flex items-center gap-2 bg-gray-50"
                  >
                    <div className="flex-1 flex items-center gap-2">
                      <span className="cursor-move">☰</span>
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <span className="truncate">{img.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setImages((prev) => prev.filter((i) => i.id !== img.id))
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeId ? (
                <div className="border rounded p-2 bg-white shadow-lg opacity-80">
                  {images.find((img) => img.id === activeId)?.name}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* 操作按钮 */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="destructive"
              onClick={() => setImages([])}
              disabled={!images.length}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              清空列表
            </Button>
            <Button onClick={generatePdf} disabled={!images.length}>
              <Download className="h-4 w-4 mr-2" />
              生成PDF
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
