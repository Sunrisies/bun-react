import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Upload, Image, Download, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";

export const Route = createFileRoute("/base64Converter")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [base64String, setBase64String] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  // 图片转Base64
  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps } =
    useDropzone({
      accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
      maxFiles: 1,
      onDrop: async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
          setIsConverting(true);
          const reader = new FileReader();
          reader.onload = () => {
            setBase64String(reader.result as string);
            setIsConverting(false);
          };
          reader.readAsDataURL(file);
        }
      },
    });

  // Base64转图片
  const handleBase64ToImage = () => {
    try {
      if (!base64String.startsWith("data:image")) {
        throw new Error("请输入有效的图片Base64字符串");
      }
      setPreviewUrl(base64String);
      toast.success("转换成功");
    } catch (error) {
      toast.error("转换失败: " + (error as Error).message);
    }
  };

  // 下载图片
  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `image_${Date.now()}.${previewUrl.split("/")[1].split(";")[0]}`;
    link.click();
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-screen-xl rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Base64与图片互转工具
            </CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-8 p-8">
          {/* 图片转Base64 */}
          <div className="space-y-6">
            <div
              {...getImageRootProps()}
              className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all hover:border-blue-300"
            >
              <input {...getImageInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <p className="text-xl font-medium text-gray-700 mb-2">
                拖放图片文件至此或点击选择
              </p>
              <p className="text-sm text-gray-500">支持 PNG、JPG、GIF 格式</p>
            </div>

            {base64String && (
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={base64String}
                    readOnly
                    className="w-full h-32 p-3 border rounded-lg bg-gray-50 text-sm font-mono"
                  />
                  <Button
                    variant="ghost"
                    className="absolute top-2 right-2 p-2"
                    onClick={() => {
                      navigator.clipboard.writeText(base64String);
                      toast.success("已复制到剪贴板");
                    }}
                  >
                    <Copy className="h-5 w-5 text-gray-500" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  已生成Base64字符串，点击上方图标复制
                </p>
              </div>
            )}
          </div>

          {/* Base64转图片 */}
          <div className="space-y-6">
            <div className="space-y-4">
              <textarea
                placeholder="在此粘贴Base64字符串..."
                className="w-full h-32 p-3 border rounded-lg bg-gray-50"
                value={base64String}
                onChange={(e) => setBase64String(e.target.value)}
              />
              <Button
                className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600"
                onClick={handleBase64ToImage}
                disabled={isConverting}
              >
                {isConverting ? (
                  <span className="animate-pulse">转换中...</span>
                ) : (
                  <>
                    <Image className="h-5 w-5 mr-2" />
                    Base64转图片
                  </>
                )}
              </Button>
            </div>

            {previewUrl && (
              <div className="border border-gray-200 rounded-2xl p-4 shadow-lg">
                <div className="max-h-96 overflow-y-auto rounded-lg">
                  <img
                    src={previewUrl}
                    alt="Base64预览"
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <Button
                  className="mt-4 w-full py-4 bg-green-500 hover:bg-green-600"
                  onClick={downloadImage}
                >
                  <Download className="h-5 w-5 mr-2" />
                  下载图片
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
