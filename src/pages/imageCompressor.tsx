import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Download } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useDropzone } from "react-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/imageCompressor")({
  component: ImageCompressor,
});

function ImageCompressor() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [compressedUrl, setCompressedUrl] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionOptions, setCompressionOptions] = useState({
    quality: 0.8,
    maxWidth: 1920,
    format: "jpeg" as "jpeg" | "png" | "webp",
    maintainRatio: true,
  });
  const [originalSize, setOriginalSize] = useState<string>("");
  const [compressedSize, setCompressedSize] = useState<string>("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setImageFile(file);
      setOriginalSize(formatFileSize(file.size));
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
      setCompressedUrl("");
      setCompressedSize("");
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const parseFileSize = (sizeStr: string): number => {
    try {
      const [value, unit] = sizeStr.split(' ');
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return 0;

      const units = {
        'BYTES': 1,
        'KB': 1024,
        'MB': 1024 * 1024,
        'GB': 1024 * 1024 * 1024
      };

      const multiplier = units[unit.toUpperCase() as keyof typeof units] || 1;
      return numValue * multiplier;
    } catch (error) {
      console.error('解析文件大小失败:', error);
      return 0;
    }
  };

  const compressImage = async () => {
    if (!imageFile) return;

    setIsCompressing(true);
    try {
      const image = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = previewUrl;
      });

      let width = image.width;
      let height = image.height;

      if (width > compressionOptions.maxWidth) {
        const ratio = compressionOptions.maxWidth / width;
        width = compressionOptions.maxWidth;
        height = compressionOptions.maintainRatio ? Math.round(height * ratio) : height;
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(image, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL(
        `image/${compressionOptions.format}`,
        compressionOptions.quality
      );

      setCompressedUrl(compressedDataUrl);

      // 计算压缩后的大小
      const base64str = compressedDataUrl.split(',')[1];
      const compressedBytes = atob(base64str).length;
      setCompressedSize(formatFileSize(compressedBytes));

      toast.success("图片压缩成功");
    } catch (error) {
      toast.error("压缩失败：" + (error as Error).message);
    } finally {
      setIsCompressing(false);
    }
  };

  const downloadCompressedImage = () => {
    if (!compressedUrl || !imageFile) return;

    const timestamp = Date.now();
    const originalName = imageFile.name;
    const extension = compressionOptions.format;
    const nameWithoutExtension = originalName.split('.').slice(0, -1).join('.');

    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `${nameWithoutExtension}_${timestamp}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>图片压缩工具</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧控制面板 */}
            <div className="lg:w-1/3 space-y-6">
              <div
                {...getRootProps()}
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all hover:border-blue-300"
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 mx-auto mb-3 text-blue-500" />
                <p className="text-lg font-medium text-gray-700 mb-1">
                  拖放图片文件至此或点击选择
                </p>
                <p className="text-sm text-gray-500">
                  支持 PNG、JPG、WEBP 格式
                </p>
              </div>

              {imageFile && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>压缩质量 ({Math.round(compressionOptions.quality * 100)}%)</Label>
                    <Slider
                      value={[compressionOptions.quality * 100]}
                      min={1}
                      max={100}
                      step={1}
                      onValueChange={([value]) =>
                        setCompressionOptions(prev => ({
                          ...prev,
                          quality: value / 100
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>最大宽度 ({compressionOptions.maxWidth}px)</Label>
                    <Slider
                      value={[compressionOptions.maxWidth]}
                      min={100}
                      max={3840}
                      step={100}
                      onValueChange={([value]) =>
                        setCompressionOptions(prev => ({
                          ...prev,
                          maxWidth: value
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>输出格式</Label>
                    <Select
                      value={compressionOptions.format}
                      onValueChange={(value: "jpeg" | "png" | "webp") =>
                        setCompressionOptions(prev => ({ ...prev, format: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="webp">WebP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    className="w-full"
                    onClick={compressImage}
                    disabled={isCompressing}
                  >
                    {isCompressing ? (
                      <span className="animate-pulse">压缩中...</span>
                    ) : (
                      "开始压缩"
                    )}
                  </Button>

                  <Button
                    onClick={downloadCompressedImage}
                    disabled={!compressedUrl}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载压缩后的图片
                  </Button>
                </div>
              )}
            </div>

            {/* 右侧预览区域 */}
            <div className="lg:w-2/3 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 原始图片 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">原始图片</p>
                  <div className="max-h-[400px] overflow-auto">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="预览"
                        className="w-full h-auto rounded"
                      />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-400">
                        暂无图片
                      </div>
                    )}
                  </div>
                  {originalSize && (
                    <p className="mt-2 text-sm text-gray-500">大小：{originalSize}</p>
                  )}
                </div>

                {/* 压缩后图片 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">压缩后</p>
                  <div className="max-h-[400px] overflow-auto">
                    {compressedUrl ? (
                      <img
                        src={compressedUrl}
                        alt="压缩后"
                        className="w-full h-auto rounded"
                      />
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-400">
                        等待压缩
                      </div>
                    )}
                  </div>
                  {compressedSize && (
                    <p className="mt-2 text-sm text-gray-500">大小：{compressedSize}</p>
                  )}
                </div>
              </div>

              {/* 压缩信息 */}
              {originalSize && compressedSize && (
                <div className="flex justify-center items-center gap-8 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-600">压缩比例</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(() => {
                        const originalBytes = parseFileSize(originalSize);
                        const compressedBytes = parseFileSize(compressedSize);
                        if (originalBytes === 0) return '0%';
                        return Math.round((1 - compressedBytes / originalBytes) * 100) + '%';
                      })()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-blue-600">节省空间</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {(() => {
                        const originalBytes = parseFileSize(originalSize);
                        const compressedBytes = parseFileSize(compressedSize);
                        return formatFileSize(Math.max(0, originalBytes - compressedBytes));
                      })()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}