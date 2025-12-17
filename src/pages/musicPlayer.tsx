import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/musicPlayer")({
  component: RouteComponent,
});

interface Song {
  id: string;
  name: string;
  url: string;
  duration?: number;
}

function RouteComponent() {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);

  // 处理音频文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newSongs = files
      .filter((file) => file.type.startsWith("audio/"))
      .map((file) => ({
        id: URL.createObjectURL(file),
        name: file.name,
        url: URL.createObjectURL(file),
        duration: 0,
      }));

    if (newSongs.length === 0) {
      toast.error("请选择有效的音频文件");
      return;
    }

    setPlaylist((prev) => [...prev, ...newSongs]);
    if (playlist.length === 0) setCurrentSongIndex(0);
  };

  // 控制播放/暂停
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 切换歌曲
  const changeSong = (index: number) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
    setTimeout(() => audioRef.current?.play(), 0);
  };

  // 更新播放进度
  const updateProgress = (e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  // 拖动进度条
  const seekTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // 音量控制
  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  };

  // 自动下一首
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      if (currentSongIndex < playlist.length - 1) {
        setCurrentSongIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audioRef.current.addEventListener("ended", handleEnded);
    return () => audioRef.current?.removeEventListener("ended", handleEnded);
  }, [currentSongIndex, playlist.length]);

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 h-[calc(100vh-4.2rem)] p-4 md:p-6 overflow-hidden">
      <Card className="w-full max-w-2xl mx-auto h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex-shrink-0 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="dark:text-gray-100">音乐播放器</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 文件上传 */}
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              id="music-upload"
            />
            <Button asChild>
              <label htmlFor="music-upload" className="cursor-pointer">
                导入音乐文件
              </label>
            </Button>
            <span className="text-sm text-muted-foreground">
              支持MP3, WAV等音频格式
            </span>
          </div>

          {/* 播放器控制 */}
          {playlist.length > 0 && (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={playlist[currentSongIndex]?.url}
                onTimeUpdate={updateProgress}
                onLoadedMetadata={(e) => {
                  const songs = [...playlist];
                  songs[currentSongIndex].duration = e.currentTarget.duration;
                  setPlaylist(songs);
                }}
              />

              {/* 歌曲信息 */}
              <div className="text-center">
                <h3 className="text-lg font-medium">
                  {playlist[currentSongIndex]?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {`${Math.floor(currentTime / 60)}:${Math.floor(
                    currentTime % 60
                  )
                    .toString()
                    .padStart(2, "0")} / 
                  ${playlist[currentSongIndex]?.duration
                      ? `${Math.floor(playlist[currentSongIndex].duration / 60)}:${Math.floor(
                        playlist[currentSongIndex].duration % 60
                      )
                        .toString()
                        .padStart(2, "0")}`
                      : "0:00"
                    }`}
                </p>
              </div>

              {/* 播放进度条 */}
              <input
                type="range"
                min="0"
                max={playlist[currentSongIndex]?.duration || 0}
                value={currentTime}
                onChange={seekTime}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />

              {/* 控制按钮 */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => changeSong(Math.max(currentSongIndex - 1, 0))}
                >
                  <SkipBack className="h-6 w-6" />
                </Button>
                <Button className="h-12 w-12 rounded-full" onClick={togglePlay}>
                  {isPlaying ? (
                    <Pause className="h-6 w-6" />
                  ) : (
                    <Play className="h-6 w-6" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    changeSong(
                      Math.min(currentSongIndex + 1, playlist.length - 1)
                    )
                  }
                >
                  <SkipForward className="h-6 w-6" />
                </Button>
              </div>

              {/* 音量控制 */}
              <div className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={changeVolume}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* 播放列表 */}
          {playlist.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">播放列表</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {playlist.map((song, index) => (
                  <div
                    key={song.id}
                    onClick={() => changeSong(index)}
                    className={`p-2 rounded cursor-pointer ${index === currentSongIndex ? "bg-blue-50" : "hover:bg-gray-100"}`}
                  >
                    <p className="text-sm truncate">{song.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
