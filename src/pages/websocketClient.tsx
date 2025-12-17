import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plug, PlugZap, Send, Trash2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/websocketClient")({
  component: RouteComponent,
});

interface Message {
  content: string;
  time: string;
  type: "send" | "receive";
}

function RouteComponent() {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [heartbeatMessage, setHeartbeatMessage] = useState("__HEARTBEAT__");
  const [heartbeatInterval, setHeartbeatInterval] = useState(1);
  const [url, setUrl] = useState("ws://127.0.0.1:18080");
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null);

  // WebSocket连接管理
  const handleConnect = () => {
    if (isConnected) return;

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        startHeartbeat();
        toast.success("连接成功");
      };

      wsRef.current.onmessage = (e) => {
        console.log("收到消息:", e);
        const handleData = (data: string) => {
          setMessages((prev) => [
            ...prev,
            {
              content: data,
              time: new Date().toLocaleTimeString(),
              type: "receive",
            },
          ]);
        };

        // 处理不同数据类型
        if (typeof e.data === "string") {
          handleData(e.data);
        } else if (e.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            handleData(reader.result as string);
          };
          reader.onerror = (error) => {
            console.error("Blob读取错误:", error);
            handleData("[Blob数据读取失败]");
          };
          reader.readAsText(e.data);
        } else {
          handleData(JSON.stringify(e.data));
        }
      };

      wsRef.current.onerror = (e) => {
        toast.error("连接发生错误");
        console.error("WebSocket error:", e);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        stopHeartbeat();
      };
    } catch (error) {
      toast.error("连接失败");
      console.error("连接错误:", error);
    }
  };

  // 心跳机制
  const startHeartbeat = () => {
    if (heartbeatInterval > 0 && heartbeatMessage) {
      heartbeatTimer.current = setInterval(() => {
        wsRef.current?.send(heartbeatMessage);
      }, heartbeatInterval * 1000);
    }
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  };

  // 发送消息
  const sendMessage = () => {
    if (!isConnected || !messageInput) return;

    try {
      wsRef.current?.send(messageInput);
      setMessages((prev) => [
        ...prev,
        {
          content: messageInput,
          time: new Date().toLocaleTimeString(),
          type: "send",
        },
      ]);
      setMessageInput("");
    } catch (error) {
      toast.error("消息发送失败");
      console.error("发送错误:", error);
    }
  };

  // 清理
  useEffect(() => {
    return () => {
      wsRef.current?.close();
      stopHeartbeat();
    };
  }, []);

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-4xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>WebSocket调试工具</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 连接控制 */}
          <div className="flex gap-4">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="WebSocket地址"
              className="flex-1"
            />
            <Button
              onClick={
                isConnected ? () => wsRef.current?.close() : handleConnect
              }
              variant={isConnected ? "destructive" : "default"}
            >
              {isConnected ? (
                <PlugZap className="h-4 w-4 mr-2" />
              ) : (
                <Plug className="h-4 w-4 mr-2" />
              )}
              {isConnected ? "断开连接" : "建立连接"}
            </Button>
          </div>

          {/* 配置和发送区 */}
          <div className="flex gap-4">
            <div className="flex gap-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">心跳间隔 (秒)</label>
                <Input
                  className="w-20"
                  type="number"
                  value={heartbeatInterval}
                  onChange={(e) => setHeartbeatInterval(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">心跳消息</label>
                <Input
                  value={heartbeatMessage}
                  onChange={(e) => setHeartbeatMessage(e.target.value)}
                  placeholder="心跳消息内容"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2 flex-1">
              <label className="text-sm font-medium">发送消息</label>
              <div className="flex gap-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="输入要发送的消息"
                  rows={3}
                />
                <Button onClick={sendMessage} className="h-full">
                  <Send className="h-4 w-4 mr-2" /> 发送
                </Button>
              </div>
            </div>
          </div>

          {/* 消息展示区 */}
          <div className=" grid grid-cols-1 md:grid-cols-2 gap-4 h-96">
            {/* 发送消息记录 */}
            <div className="border rounded p-2 bg-gray-50 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">发送记录</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessages([])}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {messages
                .filter((m) => m.type === "send")
                .reverse()
                .map((msg, i) => (
                  <div key={i} className="p-2 mb-2 bg-white rounded shadow-sm">
                    <div className="text-xs text-gray-500">{msg.time}</div>
                    <pre className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </pre>
                  </div>
                ))}
            </div>

            {/* 接收消息记录 */}
            <div className="border rounded p-2 bg-blue-50 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">接收记录</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMessages([])}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {messages
                .filter((m) => m.type === "receive")
                .reverse()
                .map((msg, i) => (
                  <div key={i} className="p-2 mb-2 bg-white rounded shadow-sm">
                    <div className="text-xs text-gray-500">{msg.time}</div>
                    <pre className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </pre>
                  </div>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
