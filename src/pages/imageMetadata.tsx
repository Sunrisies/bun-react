import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
// import * as EXIF from "exif-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/imageMetadata")({
  component: RouteComponent,
});

interface Metadata {
  fileName: string;
  format: string;
  dimensions: string;
  fileSize: string;
  make?: string;
  model?: string;
  dateTime?: string;
  exposureTime?: string;
  fNumber?: string;
  iso?: string;
  latitude?: string;
  longitude?: string;
  altitude?: string;
}

function RouteComponent() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false); // 新增全屏状态
  const parseGPS = (gpsArray: number[]) => {
    const [degrees, minutes, seconds] = gpsArray;
    return degrees + minutes / 60 + seconds / 3600;
  };
  // 为解决元素隐式具有 "any" 类型的问题，将 window 类型断言为 Record<string, any>
  const EXIF = (window as Record<string, any>)["EXIF"];
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 读取文件预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    EXIF.getData(file as any, function () {
      try {
        // 为解决 "this" 隐式具有类型 "any" 的问题，明确指定 this 的类型为 File
        const exifData = EXIF.getAllTags(file as File);

        const newMetadata: Metadata = {
          fileName: file.name,
          format: file.type.split("/")[1].toUpperCase(),
          dimensions: `${exifData.PixelXDimension} x ${exifData.PixelYDimension}`,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          make: exifData.Make,
          model: exifData.Model,
          dateTime: exifData.DateTimeOriginal,
          exposureTime: exifData.ExposureTime
            ? `1/${Math.round(1 / exifData.ExposureTime)}`
            : undefined,
          fNumber: exifData.FNumber
            ? `f/${exifData.FNumber.toFixed(1)}`
            : undefined,
          iso: exifData.ISOSpeedRatings?.toString(),
        };

        // 处理GPS数据
        if (exifData.GPSLatitude && exifData.GPSLongitude) {
          const lat = parseGPS(exifData.GPSLatitude);
          const lng = parseGPS(exifData.GPSLongitude);
          newMetadata.latitude = `${lat.toFixed(6)}° ${exifData.GPSLatitudeRef || ""}`;
          newMetadata.longitude = `${lng.toFixed(6)}° ${exifData.GPSLongitudeRef || ""}`;
        }

        if (exifData.GPSAltitude) {
          newMetadata.altitude = `${exifData.GPSAltitude.toFixed(2)} 米`;
        }

        setMetadata(newMetadata);
      } catch (error) {
        toast.error("解析元数据失败");
      }
    });
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>图片信息查看器</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 文件上传 */}
          <div className="flex flex-col gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <Button asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                选择图片文件
              </label>
            </Button>
            <span className="text-sm text-muted-foreground">
              支持JPEG、PNG等常见图片格式
            </span>
          </div>

          {/* 图片和元数据容器 */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* 图片预览区域 */}
            <div className="md:w-1/2">
              {previewUrl ? (
                <div className="border rounded-lg p-4 bg-gray-100 h-full flex justify-center items-center">
                  <img
                    src={previewUrl}
                    alt="图片预览"
                    className="w-full h-96 object-contain rounded-lg shadow-sm cursor-zoom-in"
                    onClick={() => setIsFullscreen(true)}
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 bg-gray-50 h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-center">尚未选择图片</p>
                </div>
              )}
            </div>

            {/* 元数据区域 */}
            <div className="md:w-1/2">
              {metadata ? (
                <div className="grid grid-cols-1 gap-4 h-full">
                  <div className="space-y-2">
                    <h3 className="font-medium">基本信息</h3>
                    <MetadataItem label="文件名称" value={metadata.fileName} />
                    <MetadataItem label="文件格式" value={metadata.format} />
                    <MetadataItem label="分辨率" value={metadata.dimensions} />
                    <MetadataItem label="文件大小" value={metadata.fileSize} />
                    <MetadataItem label="拍摄时间" value={metadata.dateTime} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium">拍摄参数</h3>
                    <MetadataItem label="相机品牌" value={metadata.make} />
                    <MetadataItem label="相机型号" value={metadata.model} />
                    <MetadataItem
                      label="曝光时间"
                      value={metadata.exposureTime}
                    />
                    <MetadataItem label="光圈值" value={metadata.fNumber} />
                    <MetadataItem label="ISO" value={metadata.iso} />
                    <MetadataItem label="海拔高度" value={metadata.altitude} />
                  </div>

                  {(metadata.latitude || metadata.longitude) && (
                    <div className="space-y-2">
                      <h3 className="font-medium">位置信息</h3>
                      <MetadataItem label="纬度" value={metadata.latitude} />
                      <MetadataItem label="经度" value={metadata.longitude} />
                      {metadata.latitude && metadata.longitude && (
                        <a
                          href={`https://www.google.com/maps?q=${metadata.latitude},${metadata.longitude}`}
                          target="_blank"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          查看地图位置 →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 bg-gray-50 h-full flex flex-col items-center justify-center gap-4 text-gray-400">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-center">选择图片后显示元数据信息</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* 全屏预览模态 */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="relative max-h-full max-w-full">
            <img
              src={previewUrl}
              alt="全屏预览"
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="ghost"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={() => setIsFullscreen(false)}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const MetadataItem = ({ label, value }: { label: string; value?: string }) => (
  <div className="flex justify-between items-center text-sm hover:bg-gray-50 rounded">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium">{value || "无数据"}</span>
  </div>
);
