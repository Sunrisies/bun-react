import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Copy, File } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";

export const Route = createFileRoute("/fileUploader")({
  component: FileUploaderComponent,
});

function FileUploaderComponent() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);

  // 处理文件上传
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
    toast.success(`成功添加 ${acceptedFiles.length} 个文件`);
  }, []);

  // 处理粘贴上传
  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    const files = Array.from(items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter((file): file is File => file !== null);

    if (files.length > 0) {
      setFiles((prev) => [...prev, ...files]);
      toast.success(`成功粘贴 ${files.length} 个文件`);
    }
  }, []);

  // 监听粘贴事件
  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  // 清空文件列表
  const clearFiles = () => {
    setFiles([]);
    toast.success("已清空文件列表");
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>文件上传工具</CardTitle>
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
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300"}`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-xl font-medium text-gray-700 mb-2">
              {isDragActive ? "松开鼠标上传" : "拖放文件至此或点击选择"}
            </p>
            <p className="text-sm text-gray-500">
              支持拖拽、点击选择或直接粘贴文件
            </p>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="border rounded-lg divide-y">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="p-3 flex items-center gap-3 hover:bg-gray-50"
                  >
                    <File className="h-5 w-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={clearFiles}
                >
                  清空列表
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>提示：您也可以直接粘贴文件到此页面</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}