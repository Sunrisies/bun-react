import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        if (window.history && "scrollRestoration" in window.history) {
          window.history.scrollRestoration = "manual"
        }
        const raw = sessionStorage.getItem("HOME_STATE")
        if (raw) {
          const parsed = JSON.parse(raw)
          const y = Number(parsed?.scrollY || 0)
          if (!Number.isNaN(y) && y > 0) {
            requestAnimationFrame(() => {
              window.scrollTo({ top: y, behavior: "auto" })
            })
          }
        }
      }
    } catch { }
  }, [])

  const handleEnterTool = (path: string) => {
    try {
      const state = {
        scrollY: typeof window !== "undefined" ? window.scrollY : 0,
      }
      sessionStorage.setItem("HOME_STATE", JSON.stringify(state))
    } catch { }
    navigate({ to: path })
  }
  const categories = [
    {
      title: "文件处理工具",
      items: [
        {
          title: "PDF合并",
          description: "PDF合并",
          path: "/pdfMerger"
        },
        {
          title: "PDF转Word",
          description: "PDF转Word",
          path: "/pdfToWord"
        },
        {
          title: "图片转PDF",
          description: "合并多张图片为PDF文件",
          path: "/imageToPdf"
        },
        {
          title: "图片压缩工具",
          description: "图片压缩工具",
          path: "/imageCompressor"
        },
        {
          title: "视频转GIF",
          description: "转换视频片段为GIF动图",
          path: "/videoToGif"
        },
        {
          title: "图片转base64",
          description: "图片转base64",
          path: "/base64Converter"
        },
        {
          title: "上传文件",
          description: "上传文件",
          path: "/fileUploader"
        },
        {
          title: "图片信息查看器",
          description: "支持查看图片信息",
          path: "/imageMetadata"
        },
        {
          title: "图片水印工具",
          description: "支持给图片添加文字水印，可批量处理",
          path: "/watermark"
        }
      ]
    },
    {
      title: "编码转换工具",
      items: [
        {
          title: "jsonToTs",
          description: "将JSON转换为TypeScript interface 类型定义",
          path: "/jsonToTs"
        },
        {
          title: "hex跟字符串互转",
          description: "支持hex跟字符串互转",
          path: "/hexStringConverter"
        },
        {
          title: "颜色转换器",
          description: "16进制颜色跟RGB颜色互转",
          path: "/colorConverter"
        },
        {
          title: "时间戳转换",
          description: "支持时间戳转换",
          path: "/timestampConverter"
        },
        {
          title: "YAML/JSON转换",
          description: "支持YAML和JSON格式互转",
          path: "/yamlJsonConverter"
        }
      ]
    },
    {
      title: "网络工具",
      items: [
        {
          title: "websocket客户端",
          description: "支持websocket客户端",
          path: "/websocketClient"
        },
        {
          title: "http状态码",
          description: "http状态码",
          path: "/httpStatus"
        },
        {
          title: "http请求头",
          description: "http请求头",
          path: "/httpHeaders"
        },
        {
          title: "端口工具",
          description: "端口工具",
          path: "/portTable"
        }
      ]
    },
    {
      title: "坐标/地理工具",
      items: [
        {
          title: "经纬度之间距离计算",
          description: "计算两个经纬度之间的距离",
          path: "/calculateDistance"
        },
        {
          title: "WGS84坐标系与GCJ02坐标系互转",
          description: "WGS84坐标系与GCJ02坐标系互转",
          path: "/coordinate"
        }
      ]
    },
    {
      title: "开发辅助工具",
      items: [
        {
          title: "JSON格式化",
          description: "JSON格式化",
          path: "/jsonFormatter"
        },
        {
          title: "CSS格式化",
          description: "CSS代码格式化工具",
          path: "/cssFormatter"
        },
        {
          title: "SCSS转CSS",
          description: "SCSS代码转换为CSS代码",
          path: "/scssConverter"
        },
        {
          title: "ascii码对应表",
          description: "ascii码对应表",
          path: "/asciiTable"
        },
        {
          title: "二维码生成器",
          description: "支持生成二维码",
          path: "/qrGenerator"
        },
        {
          title: "JavaScript格式化",
          description: "JavaScript代码格式化工具",
          path: "/jsFormatter"
        },
        {
          title: "html转js",
          description: "html转js",
          path: "/htmlJsConverter"
        }
      ]
    },
    {
      title: "其他工具",
      items: [
        {
          title: "signature",
          description: "签名生成器",
          path: "/signature"
        },
        {
          title: "浏览器标签",
          description: "支持导入浏览器标签数据",
          path: "/browserTabs"
        }
      ]
    }
  ]

  return (
    <main className="px-6 md:px-10 lg:px-20 py-8 min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={ { animationDelay: "2s" } }></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={ { animationDelay: "4s" } }></div>
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">工具集合</h1>
          <p className="text-gray-600">一站式解决您的日常需求</p>
        </div>

        <div className="max-w-7xl mx-auto space-y-10">
          { categories.map((category) => (
            <div key={ category.title } className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-800">{ category.title }</h2>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{ category.items.length } 个工具</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                { category.items.map((item) => (
                  <Card
                    key={ item.path }
                    className="cursor-pointer bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 rounded-lg overflow-hidden"
                    onClick={ () => handleEnterTool(item.path) }
                  >
                    <CardHeader className="p-4 pb-3">
                      <CardTitle className="text-base font-medium text-gray-800 mb-1">{ item.title }</CardTitle>
                      <CardDescription className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        { item.description }
                      </CardDescription>
                    </CardHeader>
                    <div className="h-0.5 bg-gray-100"></div>
                  </Card>
                )) }
              </div>
            </div>
          )) }
        </div>
      </div>
    </main>
  )
}
