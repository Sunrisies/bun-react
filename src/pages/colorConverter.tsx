import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
// import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export const Route = createFileRoute("/colorConverter")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [hexInput, setHexInput] = useState("");
  const [rgbInput, setRgbInput] = useState("");
  const [colorPickerHex, setColorPickerHex] = useState("#ffffff");

  // 新增处理函数
  const handleColorPick = (hex: string) => {
    setColorPickerHex(hex);
    setHexInput(hex);
    try {
      const { r, g, b, brightness } = hexToRgb(hex);
      setResults({
        rgb: `rgb(${r}, ${g}, ${b})`,
        hex: hex.toUpperCase(),
        bgColor: `rgb(${r}, ${g}, ${b})`,
        textColor: brightness > 128 ? "#000" : "#fff",
        rgbBg: `rgb(${r}, ${g}, ${b})`,
      });
      setRgbInput(`${r}, ${g}, ${b}`);
    } catch {
      resetResults();
    }
  };

  const [results, setResults] = useState({
    rgb: "",
    hex: "",
    bgColor: "transparent",
    textColor: "#000",
    rgbBg: "transparent",
  });

  // 16进制转RGB逻辑
  const hexToRgb = (hex: string) => {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((c) => c + c)
        .join("");
    }
    if (!/^[0-9a-f]{6}$/i.test(hex)) throw new Error("Invalid hex");

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return { r, g, b, brightness };
  };

  // RGB转16进制逻辑
  const rgbToHex = (r: number, g: number, b: number) => {
    const toHex = (c: number) =>
      Math.min(255, Math.max(0, c)).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // 处理16进制输入
  const handleHexConvert = () => {
    try {
      const { r, g, b, brightness } = hexToRgb(hexInput);
      setResults({
        ...results,
        rgb: `rgb(${r}, ${g}, ${b})`,
        bgColor: `rgb(${r}, ${g}, ${b})`,
        textColor: brightness > 128 ? "#000" : "#fff",
      });
    } catch {
      toast.info("无效的16进制颜色代码");
      resetResults();
    }
  };

  // 处理RGB输入
  const handleRgbConvert = () => {
    try {
      const rgb = rgbInput.match(/\d+/g)?.map(Number);
      if (!rgb || rgb.length !== 3 || rgb.some((n) => n > 255 || n < 0))
        throw new Error();

      const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      setResults({
        ...results,
        hex,
        rgbBg: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
        textColor:
          (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000 > 128
            ? "#000"
            : "#fff",
      });
    } catch {
      toast.info("无效的RGB颜色代码");
      resetResults();
    }
  };

  // 复制到剪贴板
  const handleCopy = (text: string) => {
    if (!text) {
      toast.info("没有内容可以复制");
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success("已复制到剪贴板"))
      .catch(() => toast.error("复制失败"));
  };

  const resetResults = () => {
    setResults({
      rgb: "",
      hex: "",
      bgColor: "transparent",
      textColor: "#000",
      rgbBg: "transparent",
    });
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 h-[calc(100vh-4.2rem)] p-4 md:p-6 overflow-hidden">
      <Card className="w-full max-w-4xl mx-auto h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex-shrink-0 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="dark:text-gray-100">颜色转换器</CardTitle>
            <Button
              onClick={() => navigate({ to: "/" })}
              className="gap-2"
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-y-auto min-h-0 p-6">
          <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <input
              type="color"
              value={colorPickerHex}
              onChange={(e) => handleColorPick(e.target.value)}
              className="w-32 h-12 cursor-pointer rounded-lg border-2 border-gray-200"
              style={{
                WebkitAppearance: "none",
                borderRadius: "8px",
              }}
            />
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">选取颜色:</span>
              <span className="font-mono px-2 py-1 bg-white rounded-md border">
                {colorPickerHex.toUpperCase()}
              </span>
            </div>
          </div>
          {/* 16进制转RGB */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                16进制颜色代码
              </label>
              <div className="flex gap-2">
                <input
                  value={hexInput}
                  onChange={(e) =>
                    setHexInput(e.target.value.replace(/[^0-9a-f#]/gi, ""))
                  }
                  onKeyUp={(e) => e.key === "Enter" && handleHexConvert()}
                  placeholder="#RRGGBB"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button onClick={handleHexConvert}>转换</Button>
              </div>
            </div>

            <div
              className="p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
              style={{
                backgroundColor: results.bgColor,
                borderColor:
                  results.bgColor === "transparent"
                    ? "#e5e7eb"
                    : results.bgColor,
              }}
              onClick={() => handleCopy(results.rgb)}
            >
              <p
                className="text-center font-mono"
                style={{ color: results.textColor }}
              >
                {results.rgb || "RGB结果"}
              </p>
            </div>
          </div>

          {/* RGB转16进制 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                RGB颜色代码
              </label>
              <div className="flex gap-2">
                <input
                  value={rgbInput}
                  onChange={(e) =>
                    setRgbInput(e.target.value.replace(/[^\d,]/g, ""))
                  }
                  onKeyUp={(e) => e.key === "Enter" && handleRgbConvert()}
                  placeholder="r, g, b"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Button onClick={handleRgbConvert}>转换</Button>
              </div>
            </div>

            <div
              className="p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors"
              style={{
                backgroundColor: results.rgbBg,
                borderColor:
                  results.rgbBg === "transparent" ? "#e5e7eb" : results.rgbBg,
              }}
              onClick={() => handleCopy(results.hex)}
            >
              <p
                className="text-center font-mono"
                style={{ color: results.textColor }}
              >
                {results.hex || "16进制结果"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
