import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";

export const Route = createFileRoute("/SpeechToText")({
  component: RouteComponent,
});

function RouteComponent() {
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [textResult, setTextResult] = useState("");
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  // 初始化FFmpeg
  useEffect(() => {
    const loadFFmpeg = async () => {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
      const ffmpeg = ffmpegRef.current;

      await ffmpeg.load({
        coreURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.js`,
          "text/javascript"
        ),
        wasmURL: await toBlobURL(
          `${baseURL}/ffmpeg-core.wasm`,
          "application/wasm"
        ),
      });
      //   setLoaded(true);
    };
    loadFFmpeg();
  }, []);

  // 文件上传处理
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "video/*": [".mp4", ".avi"],
      "audio/*": [".mp3", ".wav"],
    },
    maxFiles: 1,
    onDrop: (files) => files[0] && setMediaFile(files[0]),
  });

  // 文字提取处理
  const extractText = async () => {
    if (!mediaFile) return;

    try {
      setIsProcessing(true);
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on("progress", ({ progress }) =>
        setProgress(Math.round(progress * 100))
      );
      console.log("开始转换");
      console.log(await mediaFile.arrayBuffer()); // 这里的mediaFile是File类型，但是没有type属性，需要自己添加
      // 转换音频为wav格式
      // await ffmpeg.writeFile("input", await mediaFile.arrayBuffer());
      await ffmpeg.exec([
        "-i",
        "input",
        "-ar",
        "16000",
        "-ac",
        "1",
        "output.wav",
      ]);

      // 调用语音识别API（示例使用伪代码）
      const wavData = await ffmpeg.readFile("output.wav");
      // const result = await callSpeechToTextAPI(wavData); // 需要实际集成STT服务
      console.log(wavData, 'wavData')
      setTextResult('===');
    } catch (error) {
      console.log(error); // 这里的error是unknow
      toast.error("转换失败: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 h-[calc(100vh-4.2rem)] p-4 md:p-6 overflow-hidden">
      <Card className="w-full max-w-screen-xl mx-auto rounded-2xl shadow-xl h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex-shrink-0 border-b dark:border-gray-700">
          <CardTitle className="text-3xl font-bold text-gray-800 px-6 pt-6">
            音视频文字提取工具
          </CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-8 p-8 flex-1 overflow-y-auto min-h-0">
          {/* 左侧上传区域 */}
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all 
                ${isDragActive ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:border-blue-300"}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <p className="text-xl font-medium text-gray-700 mb-2">
                拖放音视频文件或点击选择
              </p>
              <p className="text-sm text-gray-500">
                支持MP4, AVI, MP3, WAV格式
              </p>
            </div>

            {mediaFile && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  已选择文件: {mediaFile.name}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setMediaFile(null)}
                >
                  重新选择文件
                </Button>
              </div>
            )}
          </div>

          {/* 右侧处理区域 */}
          <div className="space-y-6">
            <div className="space-y-4">
              {progress > 0 && (
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <Button
                className="w-full py-6 text-base bg-blue-500 hover:bg-blue-600"
                onClick={extractText}
                disabled={!mediaFile || isProcessing}
              >
                {isProcessing ? "处理中..." : "开始提取文字"}
              </Button>

              {textResult && (
                <div className="border rounded-2xl p-4 space-y-4">
                  <div className="relative">
                    <textarea
                      value={textResult}
                      readOnly
                      className="w-full h-48 p-3 border rounded-lg bg-gray-50"
                    />
                    <Button
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        navigator.clipboard.writeText(textResult);
                        toast.success("已复制到剪贴板");
                      }}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                  </div>
                  <Button
                    className="w-full bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      const blob = new Blob([textResult], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "transcription.txt";
                      link.click();
                    }}
                  >
                    <Download className="h-5 w-5 mr-2" />
                    下载文字稿
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 伪代码示例 - 需要替换为实际的语音识别服务集成
// async function callSpeechToTextAPI(audioData: ArrayBuffer) {
//   // 这里应调用实际的语音识别API（如Whisper、Azure等）
//   console.log("调用语音识别API", audioData);
//   return "示例文字稿：此处显示从音视频中提取的文字内容...";
// }
