import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { copyToClipboard } from "@/lib/utils"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Clock, Copy, RotateCw } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/timestampConverter")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [timestamp, setTimestamp] = useState("")
  const [datetime, setDatetime] = useState("")
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds")
  const [isAutoUpdate, setIsAutoUpdate] = useState(true)
  const [currentTimestamp, setCurrentTimestamp] = useState(Date.now())

  // 实时更新逻辑增加开关
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoUpdate) {
      interval = setInterval(() => {
        setCurrentTimestamp(Date.now())
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isAutoUpdate])

  // 新增单位切换功能
  const toggleUnit = () => {
    setUnit((prev) => (prev === "seconds" ? "milliseconds" : "seconds"))
  }

  // 新增复制当前时间戳
  const copyCurrentTimestamp = () => {
    const value =
      unit === "seconds"
        ? Math.floor(currentTimestamp / 1000).toString()
        : currentTimestamp.toString()
    navigator.clipboard.writeText(value)
    toast.success("已复制当前时间戳")
  }

  // 调整后的转换函数
  const convertToDatetime = () => {
    try {
      const num =
        unit === "seconds" ? Number(timestamp) * 1000 : Number(timestamp)
      return new Date(num).toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
        dateStyle: "full",
        timeStyle: "long",
      })
    } catch (error) {
      console.error("时间戳转换失败", error)
      return "无效时间戳"
    }
  }

  // 调整后的转换函数
  const convertToTimestamp = () => {
    try {
      const date = new Date(datetime)
      return unit === "seconds"
        ? Math.floor(date.getTime() / 1000).toString()
        : date.getTime().toString()
    } catch (error) {
      console.error("日期转换失败", error)
      return "无效日期格式"
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>时间戳转换器</CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 col-span-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">当前时间戳：</span>
              <div className="flex gap-2">
                <span>
                  { unit === "seconds"
                    ? Math.floor(currentTimestamp / 1000)
                    : currentTimestamp }
                </span>
                <span>({ unit === "seconds" ? "秒" : "毫秒" })</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={ toggleUnit }>
                <RotateCw className="h-4 w-4 mr-2" />
                切换单位
              </Button>
              <Button onClick={ copyCurrentTimestamp }>复制</Button>
              <Button
                variant={ isAutoUpdate ? "destructive" : "outline" }
                onClick={ () => setIsAutoUpdate(!isAutoUpdate) }
              >
                { isAutoUpdate ? "停止更新" : "恢复更新" }
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex gap-3 items-center">
              <div className="flex gap-2">
                <Input
                  value={ timestamp }
                  onChange={ (e) => setTimestamp(e.target.value) }
                  placeholder="输入时间戳"
                  className="flex-1"
                />
                <Button
                  onClick={ () =>
                    setTimestamp(
                      unit === "seconds"
                        ? Math.floor(Date.now() / 1000).toString()
                        : Date.now().toString()
                    )
                  }
                >
                  当前
                </Button>
              </div>
              <div className="border rounded p-3 bg-gray-50 relative flex flex-1">
                <pre>{ convertToDatetime() }</pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-8 w-8 p-2"
                  onClick={ () => copyToClipboard(convertToDatetime()) }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  type="datetime-local"
                  value={ datetime }
                  onChange={ (e) => setDatetime(e.target.value) }
                />
                <Button
                  onClick={ () =>
                    setDatetime(new Date().toISOString().slice(0, 16))
                  }
                >
                  当前
                </Button>
              </div>
              <div className="border rounded p-3 bg-gray-50 relative flex flex-1">
                <pre className="flex-1 ">{ convertToTimestamp() }</pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 h-8 w-8 p-2"
                  onClick={ () => copyToClipboard(convertToTimestamp()) }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
