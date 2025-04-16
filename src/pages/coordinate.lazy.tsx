import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { gcj02ToWgs84, wgs84ToGcj02 } from "sunrise-utils";

export const Route = createLazyFileRoute("/coordinate")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [sourceCoord, setSourceCoord] = useState("");
  const [targetCoord, setTargetCoord] = useState("");
  const [fromFormat, setFromFormat] = useState("WGS84");
  const [toFormat, setToFormat] = useState("GCJ02");

  const handleConvert = () => {
    try {
      const [lng, lat] = sourceCoord.split(",").map(Number);
      if (isNaN(lng) || isNaN(lat)) throw new Error("无效坐标格式");
      if (fromFormat === toFormat) {
        toast.error("源格式和目标格式相同", {
          description: "请选择不同的格式进行转换",
        });
        return;
      }
      // 先判断当前是什么转什么
      if (fromFormat === "WGS84" && toFormat === "GCJ02") {
        // 84转02
        const [convertedLng, convertedLat] = wgs84ToGcj02(lng, lat);
        setTargetCoord(`${convertedLng},${convertedLat}`);
      }
      if (fromFormat === "GCJ02" && toFormat === "WGS84") {
        // 02转84
        const [convertedLng, convertedLat] = gcj02ToWgs84(lng, lat);
        setTargetCoord(`${convertedLng},${convertedLat}`);
      }
    } catch (error) {
      toast.error("坐标格式错误", {
        description:
          "请使用 经度,纬度 格式  格式（例如：116.397128,39.916527）",
      });
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <Card>
        <CardHeader>
          <CardTitle></CardTitle>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-xl">坐标转换工具</CardTitle>
              <CardDescription>
                将WGS84/GCJ02坐标转换为其他坐标系
              </CardDescription>
            </div>
            <div className="">
              <Button onClick={() => navigate({ to: "/" })}>返回</Button>
            </div>
          </CardHeader>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-4 items-end">
            <div className="col-span-3 space-y-2">
              <Label>原始坐标</Label>
              <Input
                value={sourceCoord}
                onChange={(e) => setSourceCoord(e.target.value)}
                placeholder="输入经度,纬度（例如：116.397128,39.916527）"
              />
            </div>

            <div className="space-y-2">
              <Label>源格式</Label>
              <Select value={fromFormat} onValueChange={setFromFormat}>
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
              <Select value={toFormat} onValueChange={setToFormat}>
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

          <Button className="w-full" onClick={handleConvert}>
            立即转换
          </Button>

          <div className="space-y-2">
            <Label>转换结果</Label>
            <div className="flex gap-3">
              <Input
                value={targetCoord}
                readOnly
                placeholder="转换结果将在此显示"
                className="bg-muted"
              />
              <Button
                onClick={() => {
                  toast.success("复制成功", {
                    description: "结果已复制到剪贴板",
                  });
                  navigator.clipboard.writeText(targetCoord);
                }}
                className=""
              >
                复制结果
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
