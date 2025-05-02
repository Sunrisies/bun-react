import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const list = [
    {
      title: "jsonToTs",
      description: "将JSON转换为TypeScript interface 类型定义",
      path: "/jsonToTs",
    },
    { title: "signature", description: "签名生成器", path: "/signature" },
    {
      title: "经纬度之间距离计算",
      description: "计算两个经纬度之间的距离",
      path: "/calculateDistance",
    },
    {
      title: "WGS84坐标系与GCJ02坐标系互转",
      description: "WGS84坐标系与GCJ02坐标系互转",
      path: "/coordinate",
    },
    {
      title: "浏览器标签",
      description: "支持导入浏览器标签数据",
      path: "/browserTabs",
    },
    {
      title: "颜色转换器",
      description: "16进制颜色跟RGB颜色互转",
      path: "/colorConverter",
    },
    {
      title: "二维码生成器",
      description: "支持生成二维码",
      path: "/qrGenerator",
    },
    {
      title: "图片信息查看器",
      description: "支持查看图片信息",
      path: "/imageMetadata",
    },
    {
      title: "websocket客户端",
      description: "支持websocket客户端",
      path: "/websocketClient",
    },
    {
      title: "hex跟字符串互转",
      description: "支持hex跟字符串互转",
      path: "/hexStringConverter",
    },
    {
      title: "时间戳转换",
      description: "支持时间戳转换",
      path: "/timestampConverter",
    },
    {
      title: "图片转PDF",
      description: "合并多张图片为PDF文件",
      path: "/imageToPdf",
    },
    {
      title: "视频转GIF",
      description: "转换视频片段为GIF动图",
      path: "/videoToGif",
    },
    {
      title: "图片转base64",
      description: "图片转base64",
      path: "/base64Converter",
    },
    {
      title: '上传文件',
      description: '上传文件',
      path: '/fileUploader'
    },
    {
      title:'PDF合并',
      description: 'PDF合并',
      path: '/pdfMerger'
    },
    {
      title:"图片压缩工具",
      description: '图片压缩工具',
      path: '/imageCompressor'
    }, {
      title:"PDF转Word",
      description: 'PDF转Word',
      path: '/pdfToWord'
    }, {
      title:"http状态码" ,
      description: 'http状态码',
      path: '/httpStatus'
    }
  ];

  return (
    <main className="px-60 h-full box-border p-4">
      <div className="flex flex-wrap gap-4 justify-start w-full max-w-[1440px]">
        {list.map((item) => {
          return (
            <Card
              key={item.path}
              className="h-[120px] w-[270px] cursor-pointer hover:translate-y-[-5px] transition-all duration-300 border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md"
              onClick={() => navigate({ to: item.path })}
            >
              <CardHeader className="p-3">
                <CardTitle className="text-base mb-1">{item.title}</CardTitle>
                <CardDescription className="text-sm text-gray-500 line-clamp-2">
                  {item.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
