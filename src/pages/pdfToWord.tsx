import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as pdfjsLib from 'pdfjs-dist';

export const Route = createFileRoute("/pdfToWord")({
  component: PdfToWord,
});

function PdfToWord() {
  const navigate = useNavigate();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedUrl, setConvertedUrl] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPdfFile(file);
      setFileSize(formatFileSize(file.size));
      setConvertedUrl("");
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
  });

  const convertPdfToWord = async () => {
    if (!pdfFile) return;

    setIsConverting(true);
    try {
      // 读取PDF文件内容
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
      const numPages = pdfDoc.numPages;

      // 存储所有文本内容
      const paragraphs: Paragraph[] = [];

      // 遍历每一页提取文本
      for (let i = 1; i <= numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();

        // 添加页面标题
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `第 ${i} 页`,
                bold: true,
                size: 28,
                break: 1
              })
            ]
          })
        );

        // 处理页面内容
        let currentText = '';
        for (const item of content.items) {
          if ('str' in item) {
            currentText += item.str + ' ';

            // 当遇到换行或段落结束时创建新段落
            if (currentText.includes('\n') || item.str.endsWith('.')) {
              if (currentText.trim()) {
                paragraphs.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: currentText.trim(),
                        size: 24
                      })
                    ]
                  })
                );
              }
              currentText = '';
            }
          }
        }

        // 处理最后一段文本
        if (currentText.trim()) {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: currentText.trim(),
                  size: 24
                })
              ]
            })
          );
        }
      }

      // 创建Word文档
      const doc = new Document({
        sections: [{
          properties: {},
          children: paragraphs
        }]
      });

      // 生成Word文件
      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      const url = URL.createObjectURL(blob);

      setConvertedUrl(url);
      toast.success("转换成功");
    } catch (error) {
      console.error('转换错误:', error);
      toast.error("转换失败：" + (error as Error).message);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadWord = () => {
    if (!convertedUrl) return;

    const link = document.createElement('a');
    link.href = convertedUrl;
    const timestamp = Date.now();
    const originalName = pdfFile?.name.replace('.pdf', '') || 'document';
    link.download = `${originalName}_${timestamp}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>PDF转Word工具</CardTitle>
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
                  拖放PDF文件至此或点击选择
                </p>
                <p className="text-sm text-gray-500">
                  支持 PDF 格式
                </p>
              </div>

              {pdfFile && (
                <div className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={convertPdfToWord}
                    disabled={isConverting}
                  >
                    {isConverting ? (
                      <span className="animate-pulse">转换中...</span>
                    ) : (
                      "开始转换"
                    )}
                  </Button>

                  <Button
                    onClick={downloadWord}
                    disabled={!convertedUrl}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    下载Word文档
                  </Button>
                </div>
              )}
            </div>

            {/* 右侧预览区域 */}
            <div className="lg:w-2/3 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* PDF文件信息 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">PDF文件</p>
                  <div className="h-[300px] flex items-center justify-center">
                    {pdfFile ? (
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                        <p className="font-medium text-gray-700">{pdfFile.name}</p>
                        <p className="text-sm text-gray-500 mt-2">大小：{fileSize}</p>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        暂无文件
                      </div>
                    )}
                  </div>
                </div>

                {/* 转换状态 */}
                <div className="border rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">转换状态</p>
                  <div className="h-[300px] flex items-center justify-center">
                    {convertedUrl ? (
                      <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto mb-4 text-green-500" />
                        <p className="font-medium text-gray-700">转换完成</p>
                        <p className="text-sm text-gray-500 mt-2">
                          点击下载按钮获取Word文档
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-400">
                        等待转换
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 转换提示 */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">
                  提示：转换过程可能需要一些时间，请耐心等待。转换完成后，文档将保持原有格式，但可能需要微调部分样式。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}