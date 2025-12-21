import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import QRCode from "qrcode"
import html2canvas from "html2canvas"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

export const Route = createFileRoute("/qrGenerator")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [textInput, setTextInput] = useState("")
  const [qrCodeImage, setQrCodeImage] = useState("")
  const qrCodeImageRef = useRef<HTMLImageElement>(null)
  const [qrOptions, setQrOptions] = useState({
    errorCorrectionLevel: "H",
    version: 2,
    margin: 4,
    color: {
      dark: "#000000",
      light: "#ffffff"
    },
    width: 256,
    // 新增配置项
    style: {
      template: "default",
      dotStyle: "square", // square, rounded, dots
      cornerStyle: "square", // square, rounded, dots
      cornerDotStyle: "square", // square, rounded, dots
      cornerSquareStyle: "square", // square, rounded, dots
    },
    logo: {
      image: null as string | null,
      width: 60,
      height: 60,
      opacity: 0.8,
      margin: 5,
    }
  })

  const generateQrCode = async () => {
    try {
      const response = await QRCode.toDataURL(textInput, {
        errorCorrectionLevel: qrOptions.errorCorrectionLevel as "L" | "M" | "Q" | "H",
        version: qrOptions.version,
        margin: qrOptions.margin,
        color: {
          dark: qrOptions.color.dark,
          light: qrOptions.color.light
        },
        width: qrOptions.width
      })
      setQrCodeImage(response)
    } catch (error) {
      toast.error("生成二维码失败")
      console.error("生成二维码时出错：", error)
    }
  }

  const downloadQrCode = () => {
    if (!qrCodeImageRef.current) return

    html2canvas(qrCodeImageRef.current)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.href = imgData
        link.download = "qrcode.png"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      })
      .catch((error) => {
        toast.error("下载二维码失败")
        console.error("下载二维码时出错：", error)
      })
  }

  const copyQrCode = async () => {
    try {
      const imgData = qrCodeImage
      const blob = await fetch(imgData).then((res) => res.blob())
      const item = new ClipboardItem({ "image/png": blob })
      await navigator.clipboard.write([item])
      toast.success("二维码已复制到剪贴板")
    } catch (error) {
      toast.error("复制二维码失败")
      console.error("复制二维码时出错：", error)
    }
  }

  return (
    <div className="h-[calc(100vh-4.2rem)] p-4 md:p-6 overflow-hidden">
      <Card className="w-full max-w-2xl mx-auto h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex-shrink-0 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="dark:text-gray-100">二维码生成器</CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-y-auto min-h-0 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>内容</Label>
                <Input
                  value={ textInput }
                  onChange={ (e) => setTextInput(e.target.value) }
                  placeholder="输入内容以生成二维码"
                  onKeyUp={ (e) => e.key === "Enter" && generateQrCode() }
                />
              </div>

              <div className="space-y-2">
                <Label>纠错级别</Label>
                <Select
                  value={ qrOptions.errorCorrectionLevel }
                  onValueChange={ (value) =>
                    setQrOptions((prev) => ({ ...prev, errorCorrectionLevel: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">低 (7%)</SelectItem>
                    <SelectItem value="M">中 (15%)</SelectItem>
                    <SelectItem value="Q">较高 (25%)</SelectItem>
                    <SelectItem value="H">高 (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>边距大小 ({ qrOptions.margin })</Label>
                <Slider
                  value={ [qrOptions.margin] }
                  min={ 0 }
                  max={ 10 }
                  step={ 1 }
                  onValueChange={ ([value]) =>
                    setQrOptions((prev) => ({ ...prev, margin: value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>前景色</Label>
                <Input
                  type="color"
                  value={ qrOptions.color.dark }
                  onChange={ (e) =>
                    setQrOptions((prev) => ({
                      ...prev,
                      color: { ...prev.color, dark: e.target.value }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>背景色</Label>
                <Input
                  type="color"
                  value={ qrOptions.color.light }
                  onChange={ (e) =>
                    setQrOptions((prev) => ({
                      ...prev,
                      color: { ...prev.color, light: e.target.value }
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>尺寸 ({ qrOptions.width }px)</Label>
                <Slider
                  value={ [qrOptions.width] }
                  min={ 128 }
                  max={ 512 }
                  step={ 32 }
                  onValueChange={ ([value]) =>
                    setQrOptions((prev) => ({ ...prev, width: value }))
                  }
                />
              </div>

              <Button className="w-full" onClick={ generateQrCode }>
                生成二维码
              </Button>
            </div>

            <div className="space-y-4">
              { qrCodeImage ? (
                <>
                  <div className="border-2 border-dashed rounded-lg p-4 flex justify-center items-center min-h-[300px]">
                    <img
                      ref={ qrCodeImageRef }
                      src={ qrCodeImage }
                      alt="二维码"
                      style={ {
                        width: `${qrOptions.width}px`,
                        height: `${qrOptions.width}px`,
                      } }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={ downloadQrCode }>
                      下载二维码
                    </Button>
                    <Button className="flex-1" onClick={ copyQrCode }>
                      复制二维码
                    </Button>
                  </div>
                </>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 bg-gray-50 flex flex-col items-center justify-center gap-4 text-gray-400 min-h-[300px]">
                  <svg
                    className="w-16 h-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={ 2 }
                      d="M12 4v1m6 11h2m-6 0h-2m4-7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <p className="text-center">等待生成二维码</p>
                </div>
              ) }
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
