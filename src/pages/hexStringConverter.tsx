import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Copy, RotateCw } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const Route = createFileRoute("/hexStringConverter")({
  component: RouteComponent,
})

type EncodingType = "utf8" | "unicode"
type FormatType = "compact" | "spaced"

function RouteComponent() {
  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [encoding, setEncoding] = useState<EncodingType>("utf8")
  const [format, setFormat] = useState<FormatType>("spaced")

  // 新增编码处理逻辑
  const convertToHex = (str: string) => {
    try {
      if (encoding === "unicode") {
        return Array.from(str)
          .map((c) => {
            const code = c.charCodeAt(0)
            return code > 0xffff
              ? [(code >>> 10) + 0xd800, (code & 0x3ff) + 0xdc00]
                .map((n) => n.toString(16).padStart(4, "0"))
                .join(" ")
              : code.toString(16).padStart(4, "0")
          })
          .join(format === "spaced" ? " " : "")
      }

      // UTF-8 编码
      const encoder = new TextEncoder()
      const bytes = encoder.encode(str)
      return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(format === "spaced" ? " " : "")
    } catch (error) {
      console.error("转换失败", error)
      toast.error("转换失败")
      return ""
    }
  }

  const convertToString = (hex: string) => {
    try {
      const cleanedHex = hex.replace(/\s+/g, "")
      if (!/^[0-9a-fA-F]*$/.test(cleanedHex))
        throw new Error("无效的十六进制格式")

      if (encoding === "unicode") {
        if (cleanedHex.length % 4 !== 0)
          throw new Error("Unicode格式需要4位一组")
        return (
          cleanedHex
            .match(/.{4}/g)
            ?.map((pair) => {
              const code = parseInt(pair, 16)
              return code >= 0xd800 && code <= 0xdbff
                ? String.fromCodePoint(
                  ((code - 0xd800) << 10) +
                  (parseInt(cleanedHex.substr(pair.length, 4), 16) -
                    0xdc00) +
                  0x10000
                )
                : String.fromCharCode(code)
            })
            .join("") || ""
        )
      }

      // UTF-8 解码
      const decoder = new TextDecoder()
      const bytes = new Uint8Array(
        cleanedHex.match(/.{2}/g)?.map((b) => parseInt(b, 16)) || []
      )
      return decoder.decode(bytes)
    } catch (error) {
      console.error("转换失败", error)
      toast.error("转换失败")
      return ""
    }
  }

  const handleConvert = (direction: "toHex" | "toString") => {
    try {
      if (direction === "toHex") {
        setOutput(convertToHex(input))
      } else {
        setOutput(convertToString(input))
      }
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output)
      toast.success("已复制到剪贴板")
    } catch (error) {
      console.error("复制失败", error)
      toast.error("复制失败")
    }
  }

  return (
    <div className="h-[calc(100vh-4.2rem)] p-4 md:p-6 overflow-hidden">
      <Card className="w-full max-w-3xl mx-auto h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex-shrink-0 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle>十六进制转换器</CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto min-h-0 p-6">
          <div className="flex gap-2">
            <Select
              value={ encoding }
              onValueChange={ (v: EncodingType) => setEncoding(v) }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="编码方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utf8">UTF-8</SelectItem>
                <SelectItem value="unicode">Unicode</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={ format }
              onValueChange={ (v: FormatType) => setFormat(v) }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="格式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="spaced">空格分隔</SelectItem>
                <SelectItem value="compact">连续格式</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Textarea
              value={ input }
              onChange={ (e) => setInput(e.target.value) }
              placeholder="输入字符串或十六进制"
              rows={ 5 }
            />
            <div className="relative">
              <Textarea
                value={ output }
                readOnly
                placeholder="转换结果"
                rows={ 5 }
                className="pr-10"
              />
              { output && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8 w-8 p-2"
                  onClick={ copyToClipboard }
                >
                  <Copy className="h-4 w-4" />
                </Button>
              ) }
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Button onClick={ () => handleConvert("toHex") }>
              <RotateCw className="h-4 w-4 mr-2" /> 字符串转十六进制
            </Button>
            <Button onClick={ () => handleConvert("toString") }>
              <RotateCw className="h-4 w-4 mr-2" /> 十六进制转字符串
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
