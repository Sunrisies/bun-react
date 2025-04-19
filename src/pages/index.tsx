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
  ];
  return (
    <main className="flex justify-center h-full box-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-rows-4 gap-y-[10px] gap-x-[10px] w-full max-w-7xl px-4 mt-10">
        {list.map((item) => {
          return (
            <Card
              className="h-[180px] w-[300px] cursor-pointer hover:translate-y-[-5px] transition-all duration-300 border-2 border-gray-300 rounded-md border drop-shadow-sm "
              onClick={() => navigate({ to: item.path })}
            >
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p>{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
