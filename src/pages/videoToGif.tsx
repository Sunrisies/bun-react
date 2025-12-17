import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2, Upload, Download } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import { Slider } from "@/components/ui/slider";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export const Route = createFileRoute("/videoToGif")({
  component: VideoToGifConverter,
});

function VideoToGifConverter() {
  const navigate = useNavigate();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [range, setRange] = useState<[number, number]>([0, 10]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [fps, setFps] = useState(15);
  const [scaleWidth, setScaleWidth] = useState(480);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 在组件顶部添加useMemo
  const videoUrl = useMemo(() => {
    return videoFile ? URL.createObjectURL(videoFile) : null;
  }, [videoFile]);
  // 在组件卸载时清理Blob URL
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);
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
      setLoaded(true);
    };
    loadFFmpeg();
  }, []);

  // 视频上传处理
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    console.log(file); // 打印文件对象以检查其属性和方法
    if (!file?.type.startsWith("video/")) {
      toast.error("仅支持视频文件");
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;

    // ... 在视频元数据获取部分添加尺寸获取 ...
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      setOriginalDimensions({
        width: video.videoWidth,
        height: video.videoHeight,
      });
      setRange([0, Math.min(10, video.duration)]);
      URL.revokeObjectURL(url);
    };
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "video/*": [".mp4", ".webm"] },
    // maxFiles: 1,
  });

  // 生成GIF
  const generateGif = async () => {
    if (!videoFile || !loaded) return;

    try {
      setIsProcessing(true);
      setProgress(0);
      const ffmpeg = ffmpegRef.current;
      console.log(videoFile, "============="); // 打印文件对象以检查其属性和方法
      // 添加进度监听
      const progressHandler = ({ progress }: { progress: number }) => {
        setProgress(Math.round(progress * 100));
      };
      ffmpeg.on("progress", progressHandler);

      // 写入视频文件到FFmpeg文件系统
      await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

      // 执行转换命令
      await ffmpeg.exec([
        "-ss",
        range[0].toFixed(1),
        "-to",
        range[1].toFixed(1),
        "-i",
        "input.mp4",
        "-vf",
        `fps=${fps},scale=${scaleWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`,
        // "fps=15,scale=480:-1:flags=lanczos",
        "-c:v",
        "gif",
        "output.gif",
      ]);

      // 读取并显示结果
      const data = await ffmpeg.readFile("output.gif");
      const url = URL.createObjectURL(new Blob([data], { type: "image/gif" }));

      setGifUrl(url);
      toast.success("转换成功");
    } catch (error) {
      toast.error("转换失败: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-screen-xl rounded-2xl shadow-xl gap-0 py-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center px-6 pt-6 ">
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              视频转GIF工具
            </CardTitle>
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="ghost"
              className="gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
            >
              <ArrowLeft className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                返回首页
              </span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-8 p-4">
          {/* 左侧区域 */}
          <div className="space-y-8">
            {!videoFile ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                  ${isDragActive
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500"
                  }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500 dark:text-blue-400" />
                <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isDragActive ? "松开鼠标上传" : "拖放视频文件至此或点击选择"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  支持 MP4、WebM 格式视频文件
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <input {...getInputProps()} />
                <Button
                  {...getRootProps()}
                  variant="outline"
                  className="w-full py-4 text-blue-500 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  重新选择视频
                </Button>
                <video
                  ref={videoRef}
                  src={videoUrl!}
                  controls
                  className="w-full h-96 rounded-xl object-cover shadow-lg"
                />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      截取时长: {duration.toFixed(1)}秒
                    </span>
                    <span className="text-sm text-blue-500 dark:text-blue-400">
                      {range[1] - range[0]}秒片段
                    </span>
                  </div>
                  <Slider
                    value={range}
                    min={0}
                    max={duration}
                    step={0.1}
                    onValueChange={(value) =>
                      setRange(value as [number, number])
                    }
                    minStepsBetweenThumbs={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>开始: {range[0].toFixed(1)}s</span>
                    <span>结束: {range[1].toFixed(1)}s</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧区域 */}
          <div className="space-y-2 min-w-[480px]">
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-2 rounded-2xl">
              <div className="">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  帧率 (当前: {fps}fps)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={fps}
                  onChange={(e) =>
                    setFps(Math.min(60, Math.max(1, +e.target.value)))
                  }
                  className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  缩放宽度 (原始: {originalDimensions.width}px)
                </label>
                <input
                  type="number"
                  min="100"
                  max="1920"
                  value={scaleWidth}
                  onChange={(e) => setScaleWidth(+e.target.value)}
                  className="w-full p-2 border dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-gray-100"
                />
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                高度将按原始比例自动计算，当前高度:{" "}
                {originalDimensions.width > 0
                  ? `${Math.round((scaleWidth * originalDimensions.height) / originalDimensions.width)}px`
                  : "--"}
              </div>
              {progress > 0 && (
                <div className="space-y-4">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 dark:text-gray-300">转换进度</span>
                    <span className="text-blue-500 dark:text-blue-400 font-medium">
                      {progress}% 已完成
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4 justify-end">
                <Button
                  variant="destructive"
                  className="px-6 py-3 rounded-xl text-base font-medium shadow-sm hover:shadow-md transition-all"
                  onClick={() => {
                    setVideoFile(null);
                    setGifUrl(null);
                    setProgress(0); // 添加这行重置进度
                  }}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  清空内容
                </Button>
                <Button
                  className="px-8 py-3 rounded-xl text-base font-medium bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
                  onClick={generateGif}
                  disabled={!videoFile || isProcessing}
                >
                  {isProcessing ? (
                    <span className="animate-pulse">转换进行中...</span>
                  ) : (
                    "立即生成GIF"
                  )}
                </Button>
              </div>
            </div>

            {gifUrl ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-lg dark:bg-gray-800">
                <div className="max-h-[560px] overflow-y-auto rounded-lg">
                  <img
                    src={gifUrl}
                    alt="生成的GIF预览"
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
                <Button
                  className="mt-4 w-full py-4 rounded-xl text-base font-medium bg-green-500 hover:bg-green-600 text-white shadow-md transition-colors"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = gifUrl;
                    link.download = `animation_${Date.now()}.gif`;
                    link.click();
                  }}
                >
                  <Download className="h-5 w-5 mr-2" />
                  下载GIF文件
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                <div className="mb-4 text-blue-500 dark:text-blue-400">
                  <svg
                    className="w-12 h-12 mx-auto"
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
                </div>
                <p className="text-lg font-medium text-gray-500 dark:text-gray-400 mb-2">
                  等待生成GIF预览
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  转换完成后将在此处显示预览
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
