import { createFileRoute } from "@tanstack/react-router"
import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plug, PlugZap, Send, Trash2, Copy, Check, Info, MessageCircle, History, X } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import mqtt, { MqttClient } from "mqtt"
import { BackButton } from "@/components/BackButton"

export const Route = createFileRoute("/mqttClient")({
    component: MqttClientComponent,
})

interface Message {
    id: string
    content: string
    time: string
    type: "send" | "receive" | "system"
    topic?: string
    qos?: 0 | 1 | 2
    size?: number
}

function MqttClientComponent() {
    const navigate = useNavigate()
    const [isConnected, setIsConnected] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [messageInput, setMessageInput] = useState("")
    const [topicInput, setTopicInput] = useState("test/topic")
    const [qos, setQos] = useState<0 | 1 | 2>(0)

    // MQTT配置
    const [brokerUrl, setBrokerUrl] = useState(() => {
        const saved = localStorage.getItem("mqttLastBroker")
        return saved || "ws://broker.emqx.io:8083/mqtt"
    })
    const [clientId, setClientId] = useState(() => {
        const saved = localStorage.getItem("mqttLastClientId")
        return saved || `mqttjs_${Math.random().toString(16).substr(2, 8)}`
    })
    const [username, setUsername] = useState(() => localStorage.getItem("mqttLastUsername") || "")
    const [password, setPassword] = useState(() => localStorage.getItem("mqttLastPassword") || "")
    const [keepAlive, setKeepAlive] = useState(60)
    const [cleanSession, setCleanSession] = useState(true)

    // 历史记录
    const [brokerHistory, setBrokerHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem("mqttBrokerHistory")
        return saved ? JSON.parse(saved) : []
    })
    const [topicHistory, setTopicHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem("mqttTopicHistory")
        return saved ? JSON.parse(saved) : []
    })
    const [presetMessages, setPresetMessages] = useState<string[]>(() => {
        const saved = localStorage.getItem("mqttPresetMessages")
        return saved ? JSON.parse(saved) : ["ping", "hello", "test message"]
    })

    // UI状态
    const [showBrokerHistory, setShowBrokerHistory] = useState(false)
    const [showTopicHistory, setShowTopicHistory] = useState(false)
    const [newPreset, setNewPreset] = useState("")
    const [copiedMessage, setCopiedMessage] = useState<string | null>(null)

    const mqttRef = useRef<MqttClient | null>(null)
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

    // 保存到历史记录
    const saveToHistory = (type: "broker" | "topic", value: string) => {
        if (!value.trim()) return

        if (type === "broker") {
            const filtered = brokerHistory.filter((item) => item !== value)
            const newHistory = [value, ...filtered].slice(0, 5)
            setBrokerHistory(newHistory)
            localStorage.setItem("mqttBrokerHistory", JSON.stringify(newHistory))
            localStorage.setItem("mqttLastBroker", value)
        } else {
            const filtered = topicHistory.filter((item) => item !== value)
            const newHistory = [value, ...filtered].slice(0, 5)
            setTopicHistory(newHistory)
            localStorage.setItem("mqttTopicHistory", JSON.stringify(newHistory))
        }
    }

    // 保存配置
    const saveConfig = () => {
        localStorage.setItem("mqttLastBroker", brokerUrl)
        localStorage.setItem("mqttLastClientId", clientId)
        localStorage.setItem("mqttLastUsername", username)
        localStorage.setItem("mqttLastPassword", password)
    }

    // MQTT连接管理
    const handleConnect = () => {
        if (isConnected) {
            // 断开连接
            mqttRef.current?.end()
            addSystemMessage("主动断开连接")
            return
        }

        try {
            if (!brokerUrl.trim()) {
                toast.error("请输入MQTT broker地址")
                return
            }

            // 保存配置和历史记录
            saveConfig()
            saveToHistory("broker", brokerUrl)

            toast.loading("正在连接MQTT...", { id: "connecting" })
            addSystemMessage(`尝试连接到: ${brokerUrl}`)

            // 连接选项
            const options: mqtt.IClientOptions = {
                clientId: clientId || `mqttjs_${Math.random().toString(16).substr(2, 8)}`,
                keepalive: keepAlive,
                clean: cleanSession,
                reconnectPeriod: 0, // 禁用自动重连，手动控制
            }

            if (username.trim()) {
                options.username = username
            }
            if (password.trim()) {
                options.password = password
            }

            // 建立连接
            mqttRef.current = mqtt.connect(brokerUrl, options)

            mqttRef.current.on("connect", () => {
                setIsConnected(true)
                toast.success("MQTT连接成功", { id: "connecting" })
                addSystemMessage("✓ MQTT连接成功")
            })

            mqttRef.current.on("message", (topic: string, payload: Buffer) => {
                const data = payload.toString()
                setMessages((prev) => [
                    ...prev,
                    {
                        id: generateId(),
                        content: data,
                        time: new Date().toLocaleTimeString(),
                        type: "receive",
                        topic: topic,
                        size: data.length,
                    },
                ])
            })

            mqttRef.current.on("error", () => {
                toast.error("MQTT连接错误")
                addSystemMessage("✗ 连接错误")
            })

            mqttRef.current.on("close", () => {
                setIsConnected(false)
                addSystemMessage("MQTT连接关闭")
            })

            mqttRef.current.on("offline", () => {
                addSystemMessage("MQTT客户端离线")
            })

            mqttRef.current.on("reconnect", () => {
                addSystemMessage("尝试重新连接...")
            })

        } catch {
            toast.error("MQTT连接失败")
            addSystemMessage("✗ 连接失败")
            setIsConnected(false)
        }
    }

    // 发送消息
    const sendMessage = () => {
        if (!isConnected || !messageInput.trim() || !topicInput.trim()) {
            if (!topicInput.trim()) {
                toast.error("请输入主题")
            }
            return
        }

        try {
            mqttRef.current?.publish(topicInput, messageInput, { qos }, (error) => {
                if (error) {
                    toast.error("消息发送失败")
                    addSystemMessage("✗ 消息发送失败")
                } else {
                    // 保存主题到历史
                    saveToHistory("topic", topicInput)

                    setMessages((prev) => [
                        ...prev,
                        {
                            id: generateId(),
                            content: messageInput,
                            time: new Date().toLocaleTimeString(),
                            type: "send",
                            topic: topicInput,
                            qos: qos,
                            size: messageInput.length,
                        },
                    ])
                    setMessageInput("")
                    toast.success("消息已发送")
                }
            })
        } catch {
            toast.error("消息发送失败")
            addSystemMessage("✗ 消息发送失败")
        }
    }

    // 订阅主题
    const subscribeToTopic = () => {
        if (!isConnected || !topicInput.trim()) {
            toast.error("请先连接并输入主题")
            return
        }

        try {
            mqttRef.current?.subscribe(topicInput, { qos }, (error) => {
                if (error) {
                    toast.error("订阅失败")
                    addSystemMessage(`✗ 订阅失败`)
                } else {
                    saveToHistory("topic", topicInput)
                    toast.success(`已订阅: ${topicInput}`)
                    addSystemMessage(`✓ 订阅主题: ${topicInput}`)
                }
            })
        } catch {
            toast.error("订阅失败")
            addSystemMessage("✗ 订阅失败")
        }
    }

    // 取消订阅
    const unsubscribeFromTopic = () => {
        if (!isConnected || !topicInput.trim()) {
            toast.error("请先连接并输入主题")
            return
        }

        try {
            mqttRef.current?.unsubscribe(topicInput, (error) => {
                if (error) {
                    toast.error("取消订阅失败")
                    addSystemMessage("✗ 取消订阅失败")
                } else {
                    toast.success(`已取消订阅: ${topicInput}`)
                    addSystemMessage(`✓ 取消订阅: ${topicInput}`)
                }
            })
        } catch {
            toast.error("取消订阅失败")
            addSystemMessage("✗ 取消订阅失败")
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

    // 清空历史记录
    const clearHistory = (type: "broker" | "topic") => {
        if (type === "broker") {
            setBrokerHistory([])
            localStorage.removeItem("mqttBrokerHistory")
        } else {
            setTopicHistory([])
            localStorage.removeItem("mqttTopicHistory")
        }
        toast.success("历史记录已清空")
    }

    // 清理资源
    useEffect(() => {
        return () => {
            mqttRef.current?.end()
        }
    }, [])

    // 获取连接状态显示
    const getStatusDisplay = () => {
        switch (true) {
            case !isConnected:
                return { color: "bg-red-500", text: "未连接", badge: "default" as const }
            case isConnected:
                return { color: "bg-green-500 animate-pulse", text: "已连接", badge: "outline" as const }
            default:
                return { color: "bg-gray-500", text: "未知", badge: "secondary" as const }
        }
    }

    const status = getStatusDisplay()

    return (
        <div className="h-[calc(100vh-4.2rem)] flex justify-center md:p-6 overflow-hidden">
            <Card className="w-full p-0 gap-0 max-w-9xl dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="border-b dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <Plug className="h-5 w-5" />
                                MQTT客户端工具
                            </CardTitle>
                            <Badge variant={ status.badge } className="flex items-center gap-1">
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
                                    <Label className="flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        连接配置
                                    </Label>

                                    <Input
                                        value={ brokerUrl }
                                        onChange={ (e: ChangeEvent<HTMLInputElement>) => setBrokerUrl(e.target.value) }
                                        placeholder="MQTT Broker地址 (ws://broker:8083/mqtt)"
                                        disabled={ isConnected }
                                        className="font-mono"
                                    />

                                    {/* Broker历史记录 */ }
                                    { brokerHistory.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <Label className="flex items-center gap-1 cursor-pointer text-xs" onClick={ () => setShowBrokerHistory(!showBrokerHistory) }>
                                                    <History className="h-3 w-3" />
                                                    Broker历史 ({ brokerHistory.length }/5)
                                                    <span className="text-gray-400">
                                                        { showBrokerHistory ? "▼" : "▶" }
                                                    </span>
                                                </Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={ () => clearHistory("broker") }
                                                    className="h-5 px-1 text-xs"
                                                >
                                                    清空
                                                </Button>
                                            </div>

                                            { showBrokerHistory && (
                                                <div className="border rounded-md overflow-hidden">
                                                    { brokerHistory.map((item, index) => (
                                                        <div
                                                            key={ index }
                                                            className="flex items-center justify-between p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 border-b last:border-b-0 cursor-pointer text-xs"
                                                            onClick={ () => !isConnected && setBrokerUrl(item) }
                                                        >
                                                            <div className="flex-1 overflow-hidden">
                                                                <div className="font-mono truncate">{ item }</div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={ (e) => {
                                                                    e.stopPropagation()
                                                                    const newHistory = brokerHistory.filter((_, i) => i !== index)
                                                                    setBrokerHistory(newHistory)
                                                                    localStorage.setItem("mqttBrokerHistory", JSON.stringify(newHistory))
                                                                } }
                                                                className="h-5 w-5 p-0 ml-1"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )) }
                                                </div>
                                            ) }
                                        </div>
                                    ) }

                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            value={ clientId }
                                            onChange={ (e: ChangeEvent<HTMLInputElement>) => setClientId(e.target.value) }
                                            placeholder="Client ID"
                                            disabled={ isConnected }
                                            className="font-mono text-xs"
                                        />
                                        <Input
                                            type="number"
                                            value={ keepAlive }
                                            onChange={ (e: ChangeEvent<HTMLInputElement>) => setKeepAlive(Number(e.target.value)) }
                                            placeholder="保活(秒)"
                                            disabled={ isConnected }
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Input
                                            value={ username }
                                            onChange={ (e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value) }
                                            placeholder="用户名(可选)"
                                            disabled={ isConnected }
                                            className="text-xs"
                                        />
                                        <Input
                                            value={ password }
                                            onChange={ (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value) }
                                            placeholder="密码(可选)"
                                            type="password"
                                            disabled={ isConnected }
                                            className="text-xs"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            id="cleanSession"
                                            checked={ cleanSession }
                                            onChange={ (e: ChangeEvent<HTMLInputElement>) => setCleanSession(e.target.checked) }
                                            disabled={ isConnected }
                                        />
                                        <Label htmlFor="cleanSession" className="text-sm">清除会话</Label>
                                    </div>

                                    <Button
                                        onClick={ handleConnect }
                                        variant={ isConnected ? "destructive" : "default" }
                                        className="w-full"
                                    >
                                        { isConnected ? (
                                            <>
                                                <PlugZap className="h-4 w-4 mr-2" />
                                                断开连接
                                            </>
                                        ) : (
                                            <>
                                                <Plug className="h-4 w-4 mr-2" />
                                                连接MQTT
                                            </>
                                        ) }
                                    </Button>
                                </div>

                                {/* 主题和QoS配置 */ }
                                <div className="space-y-2">
                                    <Label>主题配置</Label>
                                    <Input
                                        value={ topicInput }
                                        onChange={ (e: ChangeEvent<HTMLInputElement>) => setTopicInput(e.target.value) }
                                        placeholder="主题 (如: test/topic)"
                                        disabled={ !isConnected }
                                        className="font-mono"
                                    />

                                    {/* 主题历史记录 */ }
                                    { topicHistory.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <Label className="flex items-center gap-1 cursor-pointer text-xs" onClick={ () => setShowTopicHistory(!showTopicHistory) }>
                                                    <History className="h-3 w-3" />
                                                    主题历史 ({ topicHistory.length }/5)
                                                    <span className="text-gray-400">
                                                        { showTopicHistory ? "▼" : "▶" }
                                                    </span>
                                                </Label>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={ () => clearHistory("topic") }
                                                    className="h-5 px-1 text-xs"
                                                >
                                                    清空
                                                </Button>
                                            </div>

                                            { showTopicHistory && (
                                                <div className="border rounded-md overflow-hidden">
                                                    { topicHistory.map((item, index) => (
                                                        <div
                                                            key={ index }
                                                            className="flex items-center justify-between p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 border-b last:border-b-0 cursor-pointer text-xs"
                                                            onClick={ () => setTopicInput(item) }
                                                        >
                                                            <div className="flex-1 overflow-hidden">
                                                                <div className="font-mono truncate">{ item }</div>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={ (e) => {
                                                                    e.stopPropagation()
                                                                    const newHistory = topicHistory.filter((_, i) => i !== index)
                                                                    setTopicHistory(newHistory)
                                                                    localStorage.setItem("mqttTopicHistory", JSON.stringify(newHistory))
                                                                } }
                                                                className="h-5 w-5 p-0 ml-1"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )) }
                                                </div>
                                            ) }
                                        </div>
                                    ) }

                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label>QoS: { qos }</Label>
                                            <div className="flex gap-1">
                                                { [0, 1, 2].map((level) => (
                                                    <Button
                                                        key={ level }
                                                        size="sm"
                                                        variant={ qos === level ? "default" : "outline" }
                                                        onClick={ () => setQos(level as 0 | 1 | 2) }
                                                        disabled={ !isConnected }
                                                        className="flex-1"
                                                    >
                                                        { level }
                                                    </Button>
                                                )) }
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={ subscribeToTopic }
                                            disabled={ !isConnected || !topicInput.trim() }
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            订阅
                                        </Button>
                                        <Button
                                            onClick={ unsubscribeFromTopic }
                                            disabled={ !isConnected || !topicInput.trim() }
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            取消订阅
                                        </Button>
                                    </div>
                                </div>

                                {/* 消息发送区 */ }
                                <div className="space-y-2">
                                    <Label>发送消息</Label>
                                    <Textarea
                                        value={ messageInput }
                                        onChange={ (e: ChangeEvent<HTMLTextAreaElement>) => setMessageInput(e.target.value) }
                                        placeholder={ isConnected ? "输入消息内容，按 Enter 发送" : "请先建立连接" }
                                        disabled={ !isConnected }
                                        rows={ 6 }
                                        className="font-mono resize-none"
                                        onKeyDown={ (e: KeyboardEvent<HTMLTextAreaElement>) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault()
                                                sendMessage()
                                            }
                                        } }
                                    />
                                    <Button
                                        onClick={ sendMessage }
                                        disabled={ !isConnected || !messageInput.trim() || !topicInput.trim() }
                                        className="w-full"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        发送到 { topicInput || "主题" }
                                    </Button>
                                </div>

                                {/* 预设消息区 */ }
                                <div className="space-y-2">
                                    <Label>预设消息 (点击快速填充)</Label>
                                    <div className="flex flex-wrap gap-1">
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

                                    <div className="flex gap-2">
                                        <Input
                                            value={ newPreset }
                                            onChange={ (e: ChangeEvent<HTMLInputElement>) => setNewPreset(e.target.value) }
                                            placeholder="输入新预设消息"
                                            className="flex-1 text-xs"
                                        />
                                        <Button
                                            onClick={ () => {
                                                if (newPreset.trim()) {
                                                    const newPresets = [...presetMessages, newPreset.trim()]
                                                    setPresetMessages(newPresets)
                                                    localStorage.setItem("mqttPresetMessages", JSON.stringify(newPresets))
                                                    setNewPreset("")
                                                    toast.success("预设消息已添加")
                                                }
                                            } }
                                            disabled={ !newPreset.trim() }
                                            variant="outline"
                                            size="sm"
                                        >
                                            添加
                                        </Button>
                                        <Button
                                            onClick={ () => {
                                                if (presetMessages.length > 0) {
                                                    const newPresets: string[] = []
                                                    setPresetMessages(newPresets)
                                                    localStorage.setItem("mqttPresetMessages", JSON.stringify(newPresets))
                                                    toast.success("预设消息已清空")
                                                }
                                            } }
                                            disabled={ presetMessages.length === 0 }
                                            variant="destructive"
                                            size="sm"
                                        >
                                            清空
                                        </Button>
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
                                                <div className="text-xs">连接并订阅后消息将显示在这里</div>
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
                                                            { msg.topic && (
                                                                <span className="text-xs text-purple-600 dark:text-purple-400 font-mono">
                                                                    { msg.topic }
                                                                </span>
                                                            ) }
                                                            { msg.qos !== undefined && (
                                                                <span className="text-xs text-gray-500">QoS:{ msg.qos }</span>
                                                            ) }
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
