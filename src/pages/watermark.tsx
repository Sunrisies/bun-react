import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Slider,
} from "@/components/ui/slider";

export const Route = createFileRoute("/watermark")({
  component: Watermark,
});

interface WatermarkSettings {
  text: string;
  fontSize: number;
  opacity: number;
  color: string;
  position: string;
  rotation: number;
}

function Watermark() {
  const navigate = useNavigate();
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [processedUrls, setProcessedUrls] = useState<string[]>([]);
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: "水印文字",
    fontSize: 24,
    opacity: 0.5,
    color: "#000000",
    position: "center",
    rotation: -45,
  });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error("请选择图片文件");
      return;
    }

    setImages(imageFiles);

    // 生成预览URL
    const urls = imageFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setProcessedUrls([]);
  };

  const addWatermark = async () => {
    if (images.length === 0) {
      toast.error("请先选择图片");
      return;
    }

    const processedImages: string[] = [];

    for (const image of images) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      // 加载图片
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = URL.createObjectURL(image);
      });

      // 设置画布大小
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      // 设置水印样式
      ctx.font = `${settings.fontSize}px Arial`;
      ctx.fillStyle = `${settings.color}${Math.round(settings.opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.rotate((settings.rotation * Math.PI) / 180);

      // 计算水印位置
      let x = 0;
      let y = 0;
      const textMetrics = ctx.measureText(settings.text);

      switch (settings.position) {
        case "topLeft":
          x = 20;
          y = 20;
          break;
        case "topRight":
          x = canvas.width - textMetrics.width - 20;
          y = 20;
          break;
        case "bottomLeft":
          x = 20;
          y = canvas.height - 20;
          break;
        case "bottomRight":
          x = canvas.width - textMetrics.width - 20;
          y = canvas.height - 20;
          break;
        default: // center
          x = (canvas.width - textMetrics.width) / 2;
          y = canvas.height / 2;
      }

      // 绘制水印
      ctx.fillText(settings.text, x, y);

      // 获取处理后的图片URL
      const processedUrl = canvas.toDataURL(image.type);
      processedImages.push(processedUrl);
    }

    setProcessedUrls(processedImages);
    toast.success("水印添加完成");
  };

  const downloadImages = () => {
    processedUrls.forEach((url, index) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `watermarked_${images[index].name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    toast.success("下载完成");
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>图片水印工具</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 文件上传区域 */}
            <div className="flex gap-4">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="max-w-sm"
              />
              <Button onClick={addWatermark}>
                <Settings className="h-4 w-4 mr-2" />
                添加水印
              </Button>
              <Button
                onClick={downloadImages}
                disabled={processedUrls.length === 0}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>

            {/* 水印设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">水印文字</label>
                  <Input
                    value={settings.text}
                    onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">字体大小</label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={(value) => setSettings({ ...settings, fontSize: value[0] })}
                    min={12}
                    max={72}
                    step={1}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">透明度</label>
                  <Slider
                    value={[settings.opacity]}
                    onValueChange={(value) => setSettings({ ...settings, opacity: value[0] })}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">水印颜色</label>
                  <Input
                    type="color"
                    value={settings.color}
                    onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">位置</label>
                  <Select
                    value={settings.position}
                    onValueChange={(value) => setSettings({ ...settings, position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">居中</SelectItem>
                      <SelectItem value="topLeft">左上角</SelectItem>
                      <SelectItem value="topRight">右上角</SelectItem>
                      <SelectItem value="bottomLeft">左下角</SelectItem>
                      <SelectItem value="bottomRight">右下角</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">旋转角度</label>
                  <Slider
                    value={[settings.rotation]}
                    onValueChange={(value) => setSettings({ ...settings, rotation: value[0] })}
                    min={-180}
                    max={180}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* 预览区域 */}
            <div>
              <h3 className="text-lg font-medium mb-4">预览</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">原图</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {previewUrls.map((url, index) => (
                      <img
                        key={`preview-${index}`}
                        src={url}
                        alt={`预览图 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">处理后</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {processedUrls.map((url, index) => (
                      <img
                        key={`processed-${index}`}
                        src={url}
                        alt={`处理后图片 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 隐藏的Canvas用于处理图片 */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* 提示信息 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                提示：支持批量添加水印，可以自定义水印文字、大小、颜色、位置和旋转角度。处理完成后可以预览效果并下载处理后的图片。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}