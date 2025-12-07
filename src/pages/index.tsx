import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { createFileRoute, useNavigate } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const navigate = useNavigate()
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
    <main className="px-60 h-full box-border p-4">
      <div className="flex flex-col gap-8 w-full max-w-[1440px]">
        { categories.map((category) => (
          <div key={ category.title } className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">{ category.title }</h2>
            <div className="flex flex-wrap gap-4">
              { category.items.map((item) => (
                <Card
                  key={ item.path }
                  className="h-[120px] w-[270px] cursor-pointer hover:translate-y-[-5px] transition-all duration-300 border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md"
                  onClick={ () => navigate({ to: item.path }) }
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-base mb-1">{ item.title }</CardTitle>
                    <CardDescription className="text-sm text-gray-500 line-clamp-2">
                      { item.description }
                    </CardDescription>
                  </CardHeader>
                </Card>
              )) }
            </div>
          </div>
        )) }
      </div>
    </main>
  )
}
