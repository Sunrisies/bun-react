import { createFileRoute } from "@tanstack/react-router"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plug, PlugZap, Send, Trash2, Copy, Check, Info, MessageCircle, History, X } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/BackButton"

export const Route = createFileRoute("/websocketClient")({
  component: RouteComponent,
})

interface Message {
  id: string
  content: string
  time: string
  type: "send" | "receive" | "system"
  size?: number
}

function RouteComponent() {
  const navigate = useNavigate()
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [heartbeatMessage, setHeartbeatMessage] = useState("ping")
  const [heartbeatInterval, setHeartbeatInterval] = useState(30)
  const [url, setUrl] = useState(() => {
    // 从localStorage加载上次使用的URL或者默认值
    const saved = localStorage.getItem("wsLastUrl")
    return saved || "ws://localhost:8080"
  })
  const [urlHistory, setUrlHistory] = useState<string[]>(() => {
    // 从localStorage加载URL历史
    const saved = localStorage.getItem("wsUrlHistory")
    return saved ? JSON.parse(saved) : []
  })
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null)
  const [presetMessages, setPresetMessages] = useState<string[]>(() => {
    // 从localStorage加载预设消息
    const saved = localStorage.getItem("wsPresetMessages")
    return saved ? JSON.parse(saved) : ["ping", "hello", "test message"]
  })
  const [newPreset, setNewPreset] = useState("")
  const [showUrlHistory, setShowUrlHistory] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const heartbeatTimer = useRef<NodeJS.Timeout | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substring(2, 15)

  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 添加系统消息
  const addSystemMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        content,
        time: new Date().toLocaleTimeString(),
        type: "system",
      },
    ])
  }

  // 保存URL到历史记录
  const saveToHistory = (urlToSave: string) => {
    if (!urlToSave.trim()) return

    // 移除重复的URL
    const filtered = urlHistory.filter((item) => item !== urlToSave)

    // 添加到开头
    const newHistory = [urlToSave, ...filtered]

    // 保持最多5条记录
    const limited = newHistory.slice(0, 5)

    setUrlHistory(limited)
    localStorage.setItem("wsUrlHistory", JSON.stringify(limited))
    localStorage.setItem("wsLastUrl", urlToSave)
  }

  // 从历史记录中选择URL
  const selectFromHistory = (urlToSelect: string) => {
    if (isConnected) {
      toast.error("请先断开当前连接")
      return
    }
    setUrl(urlToSelect)
    setShowUrlHistory(false)
    toast.success("已填充URL")
  }

  // 删除历史记录
  const removeFromHistory = (urlToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newHistory = urlHistory.filter((item) => item !== urlToRemove)
    setUrlHistory(newHistory)
    localStorage.setItem("wsUrlHistory", JSON.stringify(newHistory))
    toast.success("已删除历史记录")
  }

  // 清空历史记录
  const clearHistory = () => {
    setUrlHistory([])
    localStorage.removeItem("wsUrlHistory")
    toast.success("历史记录已清空")
  }

  // WebSocket连接管理
  const handleConnect = () => {
    if (isConnected) {
      // 断开连接
      wsRef.current?.close()
      addSystemMessage("主动断开连接")
      return
    }

    try {
      if (!url.trim()) {
        toast.error("请输入WebSocket地址")
        return
      }

      // 保存到历史记录
      saveToHistory(url)

      // 关闭现有连接
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }

      toast.loading("正在连接...", { id: "connecting" })
      addSystemMessage(`尝试连接到: ${url}`)

      wsRef.current = new WebSocket(url)

      wsRef.current.onopen = () => {
        setIsConnected(true)
        startHeartbeat()
        toast.success("连接成功", { id: "connecting" })
        addSystemMessage("✓ 连接成功")
      }

      wsRef.current.onmessage = (e) => {
        const handleData = (data: string) => {
          setMessages((prev) => [
            ...prev,
            {
              id: generateId(),
              content: data,
              time: new Date().toLocaleTimeString(),
              type: "receive",
              size: data.length,
            },
          ])
        }

        // 处理不同数据类型
        if (typeof e.data === "string") {
          handleData(e.data)
        } else if (e.data instanceof Blob) {
          const reader = new FileReader()
          reader.onload = () => {
            handleData(reader.result as string)
          }
          reader.onerror = () => {
            handleData("[Blob数据读取失败]")
          }
          reader.readAsText(e.data)
        } else if (e.data instanceof Uint8Array || e.data instanceof ArrayBuffer) {
          try {
            const decoder = new TextDecoder()
            const buffer = e.data instanceof Uint8Array
              ? e.data.buffer.slice(e.data.byteOffset, e.data.byteOffset + e.data.byteLength)
              : e.data
            const decoded = decoder.decode(buffer)
            handleData(decoded)
          } catch {
            handleData(`[二进制数据]`)
          }
        } else {
          try {
            handleData(JSON.stringify(e.data))
          } catch {
            handleData(String(e.data))
          }
        }
      }

      wsRef.current.onerror = () => {
        toast.error("连接发生错误")
        addSystemMessage("✗ 连接错误")
      }

      wsRef.current.onclose = (e) => {
        setIsConnected(false)
        stopHeartbeat()
        const reason = e.reason || (e.code === 1000 ? "正常关闭" : "异常关闭")
        addSystemMessage(`连接关闭: ${reason}`)

        if (e.code !== 1000) {
          toast.error(`连接关闭: ${reason}`)
        }
      }
    } catch {
      toast.error("连接失败")
      addSystemMessage("✗ 连接失败")
      setIsConnected(false)
      stopHeartbeat()
    }
  }

  // 心跳机制
  const startHeartbeat = () => {
    if (heartbeatInterval > 0 && heartbeatMessage && wsRef.current) {
      heartbeatTimer.current = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(heartbeatMessage)
            addSystemMessage(`心跳: ${heartbeatMessage}`)
          } catch {
            addSystemMessage("心跳发送失败")
          }
        }
      }, heartbeatInterval * 1000)
    }
  }

  const stopHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current)
      heartbeatTimer.current = null
    }
  }

  // 发送消息
  const sendMessage = () => {
    if (!isConnected || !messageInput.trim()) return

    try {
      wsRef.current?.send(messageInput)
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          content: messageInput,
          time: new Date().toLocaleTimeString(),
          type: "send",
          size: messageInput.length,
        },
      ])
      setMessageInput("")
    } catch (error: any) {
      toast.error("消息发送失败")
      addSystemMessage("✗ 消息发送失败")
    }
  }

  // 复制消息内容
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    setCopiedMessage(content)
    toast.success("已复制")
    setTimeout(() => setCopiedMessage(null), 2000)
  }

  // 清空消息
  const clearMessages = () => {
    setMessages([])
    addSystemMessage("消息已清空")
  }

  // 清理资源
  useEffect(() => {
    return () => {
      wsRef.current?.close()
      stopHeartbeat()
    }
  }, [])

  // 获取连接状态显示
  const getStatusDisplay = () => {
    switch (true) {
      case !isConnected:
        return { color: "bg-red-500", text: "未连接", badge: "default" as const }
      case isConnected:
        return { color: "bg-green-500 animate-pulse", text: "已连接", badge: "success" as const }
      default:
        return { color: "bg-gray-500", text: "未知", badge: "secondary" as const }
    }
  }

  const status = getStatusDisplay()

  return (
    <div className="h-[calc(100vh-4.2rem)] flex justify-center p-4 md:p-6 overflow-hidden">
      <Card className="w-full max-w-9xl dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                WebSocket调试工具
              </CardTitle>
              <Badge variant={ status.badge as any } className="flex items-center gap-1">
                <div className={ `w-2 h-2 rounded-full ${status.color}` }></div>
                { status.text }
              </Badge>
            </div>
            <BackButton />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex h-[calc(100vh-12rem)]">
            {/* 左侧控制面板 */ }
            <div className="w-1/2 p-6 border-r dark:border-gray-700 overflow-y-auto">
              <div className="space-y-6">
                {/* 连接配置区 */ }
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label className="flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        WebSocket地址
                      </Label>
                      <Input
                        value={ url }
                        onChange={ (e) => setUrl(e.target.value) }
                        placeholder="ws://localhost:8080 或 wss://example.com"
                        disabled={ isConnected }
                        className="font-mono"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={ handleConnect }
                        variant={ isConnected ? "destructive" : "default" }
                        className="h-10 px-6"
                      >
                        { isConnected ? (
                          <>
                            <PlugZap className="h-4 w-4 mr-2" />
                            断开
                          </>
                        ) : (
                          <>
                            <Plug className="h-4 w-4 mr-2" />
                            连接
                          </>
                        ) }
                      </Button>
                    </div>
                  </div>

                  {/* URL历史记录管理 */ }
                  { urlHistory.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label className="flex items-center gap-2 cursor-pointer" onClick={ () => setShowUrlHistory(!showUrlHistory) }>
                          <History className="h-4 w-4" />
                          历史记录 ({ urlHistory.length }/5)
                          <span className="text-xs text-gray-400">
                            { showUrlHistory ? "▼" : "▶" }
                          </span>
                        </Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={ clearHistory }
                          className="h-6 px-2 text-xs"
                        >
                          清空
                        </Button>
                      </div>

                      { showUrlHistory && (
                        <div className="border rounded-md overflow-hidden">
                          { urlHistory.map((item, index) => (
                            <div
                              key={ index }
                              className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-800 border-b last:border-b-0 cursor-pointer"
                              onClick={ () => selectFromHistory(item) }
                            >
                              <div className="flex-1 overflow-hidden">
                                <div className="font-mono text-xs truncate">{ item }</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={ (e) => removeFromHistory(item, e) }
                                className="h-6 w-6 p-0 ml-2"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )) }
                        </div>
                      ) }
                    </div>
                  ) }
                </div>

                {/* 预设消息区 */ }
                <div className="space-y-2">
                  <Label>预设消息 (点击快速发送)</Label>
                  <div className="flex flex-wrap gap-2">
                    { presetMessages.map((msg, index) => (
                      <Button
                        key={ index }
                        variant="outline"
                        size="sm"
                        onClick={ () => {
                          if (isConnected) {
                            setMessageInput(msg)
                          }
                        } }
                        disabled={ !isConnected }
                        className="font-mono text-xs"
                      >
                        { msg }
                      </Button>
                    )) }
                    { presetMessages.length === 0 && (
                      <span className="text-sm text-gray-400">暂无预设消息</span>
                    ) }
                  </div>

                  {/* 添加新的预设消息 */ }
                  <div className="flex gap-2">
                    <Input
                      value={ newPreset }
                      onChange={ (e) => setNewPreset(e.target.value) }
                      placeholder="输入新预设消息"
                      className="flex-1"
                    />
                    <Button
                      onClick={ () => {
                        if (newPreset.trim()) {
                          const newPresets = [...presetMessages, newPreset.trim()]
                          setPresetMessages(newPresets)
                          localStorage.setItem("wsPresetMessages", JSON.stringify(newPresets))
                          setNewPreset("")
                          toast.success("预设消息已添加")
                        }
                      } }
                      disabled={ !newPreset.trim() }
                      variant="outline"
                    >
                      添加
                    </Button>
                    <Button
                      onClick={ () => {
                        if (presetMessages.length > 0) {
                          const newPresets: string[] = []
                          setPresetMessages(newPresets)
                          localStorage.setItem("wsPresetMessages", JSON.stringify(newPresets))
                          toast.success("预设消息已清空")
                        }
                      } }
                      disabled={ presetMessages.length === 0 }
                      variant="destructive"
                    >
                      清空
                    </Button>
                  </div>
                </div>

                {/* 消息发送区 */ }
                <div className="space-y-2">
                  <Label>发送消息</Label>
                  <div className="flex gap-2">
                    <Textarea
                      value={ messageInput }
                      onChange={ (e) => setMessageInput(e.target.value) }
                      placeholder={ isConnected ? "输入要发送的消息，按 Enter 发送" : "请先建立连接" }
                      disabled={ !isConnected }
                      rows={ 8 }
                      className="font-mono resize-none"
                      onKeyDown={ (e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          sendMessage()
                        }
                      } }
                    />
                    <Button
                      onClick={ sendMessage }
                      disabled={ !isConnected || !messageInput.trim() }
                      className="h-auto px-4"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* 心跳配置 */ }
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>心跳消息</Label>
                    <Input
                      value={ heartbeatMessage }
                      onChange={ (e) => setHeartbeatMessage(e.target.value) }
                      placeholder="心跳内容"
                      disabled={ isConnected }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>心跳间隔 (秒)</Label>
                    <Input
                      type="number"
                      value={ heartbeatInterval }
                      onChange={ (e) => setHeartbeatInterval(Number(e.target.value)) }
                      min="1"
                      disabled={ isConnected }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧消息记录区 */ }
            <div className="w-1/2 p-6 overflow-y-auto">
              <div className="space-y-4 h-full">
                <div className="flex justify-between items-center">
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    消息记录 ({ messages.length })
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={ clearMessages }
                      disabled={ messages.length === 0 }
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      清空
                    </Button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden flex-1">
                  <div className="h-[calc(100vh-18rem)] overflow-y-auto bg-gray-50 dark:bg-gray-900 p-2 space-y-1">
                    { messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                        <div className="text-4xl">📭</div>
                        <div className="text-sm">暂无消息记录</div>
                        <div className="text-xs">连接后消息将显示在这里</div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={ msg.id }
                          className={ `p-2 rounded border text-sm ${msg.type === "send"
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                            : msg.type === "receive"
                              ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                              : "bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                            }` }
                        >
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={ `text-xs ${msg.type === "send"
                                  ? "text-blue-700 border-blue-300"
                                  : msg.type === "receive"
                                    ? "text-green-700 border-green-300"
                                    : "text-gray-600 border-gray-300"
                                  }` }
                              >
                                { msg.type === "send" ? "发送" : msg.type === "receive" ? "接收" : "系统" }
                              </Badge>
                              <span className="text-xs text-gray-500">{ msg.time }</span>
                              { msg.size && (
                                <span className="text-xs text-gray-400">({ msg.size }字节)</span>
                              ) }
                            </div>
                            { msg.type !== "system" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={ () => copyMessage(msg.content) }
                              >
                                { copiedMessage === msg.content ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                ) }
                              </Button>
                            ) }
                          </div>
                          <pre className="whitespace-pre-wrap break-words font-mono text-xs">
                            { msg.content }
                          </pre>
                        </div>
                      ))
                    ) }
                    <div ref={ messagesEndRef } />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
