import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, ArrowLeft, Download, Trash2, MoveUp, MoveDown } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from 'pdf-lib';

export const Route = createFileRoute("/pdfMerger")({
  component: PdfMergerComponent,
});

function PdfMergerComponent() {
  const navigate = useNavigate();
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop: (acceptedFiles) => {
      setPdfFiles(prev => [...prev, ...acceptedFiles]);
      toast.success(`成功添加 ${acceptedFiles.length} 个PDF文件`);
    },
  });

  const handleRemoveFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, i) => i !== index));
    toast.success("已移除文件");
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    setPdfFiles(prev => {
      const newFiles = [...prev];
      if (direction === 'up' && index > 0) {
        [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
      }
      return newFiles;
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      toast.error("请至少添加两个PDF文件");
      return;
    }

    try {
      setIsProcessing(true);
      const mergedPdf = await PDFDocument.create();

      for (const file of pdfFiles) {
        const fileBuffer = await file.arrayBuffer();
        // 修改这里：添加 ignoreEncryption 选项
        const pdf = await PDFDocument.load(fileBuffer, { 
          ignoreEncryption: true 
        });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }

      const mergedPdfFile = await mergedPdf.save();
      const blob = new Blob([mergedPdfFile], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${Date.now()}.pdf`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success("PDF合并成功！");
    } catch (error) {
      toast.error("PDF合并失败：" + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-3xl rounded-2xl shadow-xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              PDF合并工具
            </CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div
            {...getRootProps()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-blue-300"
          >
            <input {...getInputProps()} />
            <FileUp className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-xl font-medium text-gray-700 mb-2">
              拖放PDF文件至此或点击选择
            </p>
            <p className="text-sm text-gray-500">支持多个PDF文件</p>
          </div>

          {pdfFiles.length > 0 && (
            <div className="space-y-4">
              <div className="border rounded-lg divide-y">
                {pdfFiles.map((file, index) => (
                  <div
                    key={index}
                    className="p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveFile(index, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveFile(index, 'down')}
                        disabled={index === pdfFiles.length - 1}
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="destructive"
                  onClick={() => setPdfFiles([])}
                >
                  清空列表
                </Button>
                <Button
                  className="bg-blue-500 hover:bg-blue-600"
                  onClick={mergePDFs}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="animate-pulse">处理中...</span>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      合并并下载
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}