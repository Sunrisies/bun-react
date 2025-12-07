import { createLazyFileRoute, useNavigate } from "@tanstack/react-router"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useState, useRef } from "react"
import { gcj02ToWgs84, wgs84ToGcj02 } from "sunrise-utils"

export const Route = createLazyFileRoute("/coordinate")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [sourceCoord, setSourceCoord] = useState("")
  const [targetCoord, setTargetCoord] = useState("")
  const [fromFormat, setFromFormat] = useState("WGS84")
  const [toFormat, setToFormat] = useState("GCJ02")
  const [batchSourceCoords, setBatchSourceCoords] = useState("")
  const [batchTargetCoords, setBatchTargetCoords] = useState("")
  const [activeTab, setActiveTab] = useState("single")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理CSV文件上传
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 检查文件大小，限制为5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      toast.error("文件过大", {
        description: "请上传小于5MB的CSV文件",
      })
      event.target.value = '' // 清空文件输入
      return
    }

    // 检查文件类型
    if (!file.name.endsWith('.csv')) {
      toast.error("文件格式错误", {
        description: "请上传CSV文件",
      })
      event.target.value = '' // 清空文件输入
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n')
        const coordinates = lines
          .map(line => line.trim())
          .filter(line => line) // 过滤空行
          .join('\n')

        setBatchSourceCoords(coordinates)
        toast.success("CSV文件导入成功", {
          description: `成功导入 ${lines.filter(line => line.trim()).length} 个坐标点`,
        })
      } catch (error) {
        console.error(error)
        toast.error("文件解析失败", {
          description: "请确保CSV文件格式正确",
        })
      }
    }

    reader.onerror = () => {
      toast.error("文件读取失败", {
        description: "请重试或选择其他文件",
      })
    }

    reader.readAsText(file)
    // 清空文件输入，这样用户可以重复上传同一个文件
    event.target.value = ''
  }

  // 导出结果为CSV
  const handleExportCSV = () => {
    if (!batchTargetCoords) {
      toast.error("没有可导出的结果")
      return
    }

    try {
      // 过滤并验证坐标
      const validCoords = batchTargetCoords
        .split('\n')
        .map(line => line.trim())
        .filter(line => {
          if (!line) return false
          const [lng, lat] = line.split(',').map(Number)
          return !isNaN(lng) && !isNaN(lat)
        })
        .join('\n')

      if (!validCoords) {
        toast.error("没有有效的坐标数据可导出")
        return
      }

      const blob = new Blob([validCoords], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `coordinate_conversion_result_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(link.href) // 清理URL对象

      toast.success("导出成功", {
        description: "结果已保存为CSV文件",
      })
    } catch (error) {
      console.error("导出失败", error)
      toast.error("导出失败", {
        description: "处理坐标数据时出错",
      })
    }
  }

  // 单个坐标转换
  const handleConvert = () => {
    try {
      const [lng, lat] = sourceCoord.split(",").map(Number)
      if (isNaN(lng) || isNaN(lat)) throw new Error("无效坐标格式")
      if (fromFormat === toFormat) {
        toast.error("源格式和目标格式相同", {
          description: "请选择不同的格式进行转换",
        })
        return
      }
      // 先判断当前是什么转什么
      if (fromFormat === "WGS84" && toFormat === "GCJ02") {
        // 84转02
        const [convertedLng, convertedLat] = wgs84ToGcj02(lng, lat)
        setTargetCoord(`${convertedLng},${convertedLat}`)
      }
      if (fromFormat === "GCJ02" && toFormat === "WGS84") {
        // 02转84
        const [convertedLng, convertedLat] = gcj02ToWgs84(lng, lat)
        setTargetCoord(`${convertedLng},${convertedLat}`)
      }
    } catch (error) {
      console.error("坐标转换失败", error)
      toast.error("坐标格式错误", {
        description:
          "请使用 经度,纬度 格式  格式（例如：116.397128,39.916527）",
      })
    }
  }

  // 批量坐标转换
  const handleBatchConvert = () => {
    try {
      // 检查输入是否为空
      if (!batchSourceCoords.trim()) {
        toast.error("输入为空", {
          description: "请输入坐标或导入CSV文件",
        })
        return
      }

      if (fromFormat === toFormat) {
        toast.error("源格式和目标格式相同", {
          description: "请选择不同的格式进行转换",
        })
        return
      }

      // 分割输入的多行坐标
      const coordLines = batchSourceCoords.trim().split("\n")
      const results = []
      let hasError = false

      for (const line of coordLines) {
        if (!line.trim()) continue // 跳过空行

        try {
          const [lng, lat] = line.split(",").map(Number)
          if (isNaN(lng) || isNaN(lat)) {
            results.push(`${line} -> 格式错误`)
            hasError = true
            continue
          }

          let convertedLng, convertedLat
          if (fromFormat === "WGS84" && toFormat === "GCJ02") {
            [convertedLng, convertedLat] = wgs84ToGcj02(lng, lat)
          } else if (fromFormat === "GCJ02" && toFormat === "WGS84") {
            [convertedLng, convertedLat] = gcj02ToWgs84(lng, lat)
          }

          // 限制坐标精度到6位小数
          const formattedLng = Number(convertedLng?.toFixed(6))
          const formattedLat = Number(convertedLat?.toFixed(6))
          results.push(`${formattedLng},${formattedLat}`)
        } catch (e) {
          console.error("转换失败", e)
          results.push(`${line} -> 转换失败`)
          hasError = true
        }
      }

      setBatchTargetCoords(results.join("\n"))

      if (hasError) {
        toast.warning("部分坐标转换失败", {
          description: "请检查输入格式是否正确",
        })
      } else if (results.length > 0) {
        toast.success("批量转换成功", {
          description: `成功转换 ${results.length} 个坐标点`,
        })
      } else {
        toast.error("没有有效的坐标输入", {
          description: "请输入至少一个有效的坐标点",
        })
      }
    } catch (error) {
      console.error("批量转换失败", error)
      toast.error("转换过程中出错", {
        description: "请检查输入格式是否正确",
      })
    }
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardTitle></CardTitle>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-xl">坐标转换工具</CardTitle>
            <CardDescription>将WGS84/GCJ02坐标转换为其他坐标系</CardDescription>
          </div>
          <div className="">
            <Button onClick={ () => navigate({ to: "/" }) }>返回</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={ activeTab } onValueChange={ setActiveTab } className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="single">单个转换</TabsTrigger>
              <TabsTrigger value="batch">批量转换</TabsTrigger>
            </TabsList>

            <TabsContent value="single" className="space-y-4">
              <div className="grid grid-cols-5 gap-4 items-end">
                <div className="col-span-3 space-y-2">
                  <Label>原始坐标</Label>
                  <Input
                    value={ sourceCoord }
                    onChange={ (e) => setSourceCoord(e.target.value) }
                    placeholder="输入经度,纬度（例如：116.397128,39.916527）"
                  />
                </div>

                <div className="space-y-2">
                  <Label>源格式</Label>
                  <Select value={ fromFormat } onValueChange={ setFromFormat }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WGS84">WGS84</SelectItem>
                      <SelectItem value="GCJ02">GCJ02</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>目标格式</Label>
                  <Select value={ toFormat } onValueChange={ setToFormat }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GCJ02">GCJ02</SelectItem>
                      <SelectItem value="WGS84">WGS84</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full" onClick={ handleConvert }>
                立即转换
              </Button>

              <div className="space-y-2">
                <Label>转换结果</Label>
                <div className="flex gap-3">
                  <Input
                    value={ targetCoord }
                    readOnly
                    placeholder="转换结果将在此显示"
                    className="bg-muted"
                  />
                  <Button
                    onClick={ () => {
                      toast.success("复制成功", {
                        description: "结果已复制到剪贴板",
                      })
                      navigator.clipboard.writeText(targetCoord)
                    } }
                    className=""
                  >
                    复制结果
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>批量坐标（每行一个坐标点）</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={ () => {
                        setBatchSourceCoords("")
                        setBatchTargetCoords("")
                      } }
                    >
                      清空
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={ handleFileUpload }
                      ref={ fileInputRef }
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={ () => fileInputRef.current?.click() }
                    >
                      导入CSV
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={ batchSourceCoords }
                  onChange={ (e) => setBatchSourceCoords(e.target.value) }
                  placeholder="输入多个坐标，每行一个（例如：
116.397128,39.916527
116.398128,39.917527）
或者点击'导入CSV'按钮导入CSV文件"
                  rows={ 6 }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>源格式</Label>
                  <Select value={ fromFormat } onValueChange={ setFromFormat }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WGS84">WGS84</SelectItem>
                      <SelectItem value="GCJ02">GCJ02</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>目标格式</Label>
                  <Select value={ toFormat } onValueChange={ setToFormat }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GCJ02">GCJ02</SelectItem>
                      <SelectItem value="WGS84">WGS84</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="w-full" onClick={ handleBatchConvert }>
                批量转换
              </Button>

              { batchTargetCoords && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>转换结果</Label>
                    <span className="text-xs text-muted-foreground">
                      共 { batchTargetCoords.split('\n').filter(line => line.trim()).length } 个坐标
                    </span>
                  </div>
                  <Textarea
                    value={ batchTargetCoords }
                    readOnly
                    className="bg-muted"
                    rows={ 6 }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={ () => {
                        toast.success("复制成功", {
                          description: "批量结果已复制到剪贴板",
                        })
                        navigator.clipboard.writeText(batchTargetCoords)
                      } }
                    >
                      复制结果
                    </Button>
                    <Button
                      variant="outline"
                      onClick={ handleExportCSV }
                    >
                      导出为CSV
                    </Button>
                  </div>
                </div>
              ) }
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}