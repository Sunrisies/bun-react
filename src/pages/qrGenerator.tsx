import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const Route = createFileRoute("/qrGenerator")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");
  const [qrCodeImage, setQrCodeImage] = useState("");
  const qrCodeImageRef = useRef<HTMLImageElement>(null);

  const generateQrCode = async () => {
    try {
      const response = await QRCode.toDataURL(textInput, {
        errorCorrectionLevel: "H",
        version: 2,
      });
      setQrCodeImage(response);
    } catch (error) {
      toast.error("生成二维码失败");
      console.error("生成二维码时出错：", error);
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeImageRef.current) return;

    html2canvas(qrCodeImageRef.current)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = "qrcode.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        toast.error("下载二维码失败");
        console.error("下载二维码时出错：", error);
      });
  };

  const copyQrCode = async () => {
    try {
      const imgData = qrCodeImage;
      const blob = await fetch(imgData).then((res) => res.blob());
      const item = new ClipboardItem({ "image/png": blob });
      await navigator.clipboard.write([item]);
      toast.success("二维码已复制到剪贴板");
    } catch (error) {
      toast.error("复制二维码失败");
      console.error("复制二维码时出错：", error);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>二维码生成器</CardTitle>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="gap-2"
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="输入内容以生成二维码"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onKeyUp={(e) => e.key === "Enter" && generateQrCode()}
            />
            <Button className="w-full" onClick={generateQrCode}>
              生成二维码
            </Button>
          </div>

          {qrCodeImage ? (
            <>
              <div className="border-2 border-dashed rounded-lg p-4 flex justify-center">
                <img
                  ref={qrCodeImageRef}
                  src={qrCodeImage}
                  alt="二维码"
                  className="w-64 h-64"
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={downloadQrCode}>
                  下载二维码
                </Button>
                <Button className="flex-1" onClick={copyQrCode}>
                  复制二维码
                </Button>
              </div>
            </>
          ) : (
            <div className="border-2 border-dashed rounded-lg p-8 bg-gray-50 flex flex-col items-center justify-center gap-4 text-gray-400 h-64">
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
                  d="M12 4v1m6 11h2m-6 0h-2m4-7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <p className="text-center">等待生成二维码</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
