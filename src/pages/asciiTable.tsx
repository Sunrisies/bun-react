import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/asciiTable")({
  component: AsciiTable,
});

interface AsciiCode {
  dec: number;
  hex: string;
  char: string;
  description: string;
  category: string;
}

const ASCII_CODES: AsciiCode[] = [
  // 控制字符 (0-31)
  { dec: 0, hex: "0x00", char: "NUL", description: "空字符", category: "控制字符" },
  { dec: 1, hex: "0x01", char: "SOH", description: "标题开始", category: "控制字符" },
  { dec: 2, hex: "0x02", char: "STX", description: "正文开始", category: "控制字符" },
  { dec: 3, hex: "0x03", char: "ETX", description: "正文结束", category: "控制字符" },
  { dec: 4, hex: "0x04", char: "EOT", description: "传输结束", category: "控制字符" },
  { dec: 5, hex: "0x05", char: "ENQ", description: "请求", category: "控制字符" },
  { dec: 6, hex: "0x06", char: "ACK", description: "收到通知", category: "控制字符" },
  { dec: 7, hex: "0x07", char: "BEL", description: "响铃", category: "控制字符" },
  { dec: 8, hex: "0x08", char: "BS", description: "退格", category: "控制字符" },
  { dec: 9, hex: "0x09", char: "HT", description: "水平制表符", category: "控制字符" },
  { dec: 10, hex: "0x0A", char: "LF", description: "换行", category: "控制字符" },
  { dec: 11, hex: "0x0B", char: "VT", description: "垂直制表符", category: "控制字符" },
  { dec: 12, hex: "0x0C", char: "FF", description: "换页", category: "控制字符" },
  { dec: 13, hex: "0x0D", char: "CR", description: "回车", category: "控制字符" },
  { dec: 14, hex: "0x0E", char: "SO", description: "移出", category: "控制字符" },
  { dec: 15, hex: "0x0F", char: "SI", description: "移入", category: "控制字符" },
  { dec: 16, hex: "0x10", char: "DLE", description: "数据链路转义", category: "控制字符" },
  { dec: 17, hex: "0x11", char: "DC1", description: "设备控制1", category: "控制字符" },
  { dec: 18, hex: "0x12", char: "DC2", description: "设备控制2", category: "控制字符" },
  { dec: 19, hex: "0x13", char: "DC3", description: "设备控制3", category: "控制字符" },
  { dec: 20, hex: "0x14", char: "DC4", description: "设备控制4", category: "控制字符" },
  { dec: 21, hex: "0x15", char: "NAK", description: "否定应答", category: "控制字符" },
  { dec: 22, hex: "0x16", char: "SYN", description: "同步空闲", category: "控制字符" },
  { dec: 23, hex: "0x17", char: "ETB", description: "传输块结束", category: "控制字符" },
  { dec: 24, hex: "0x18", char: "CAN", description: "取消", category: "控制字符" },
  { dec: 25, hex: "0x19", char: "EM", description: "媒介结束", category: "控制字符" },
  { dec: 26, hex: "0x1A", char: "SUB", description: "替换", category: "控制字符" },
  { dec: 27, hex: "0x1B", char: "ESC", description: "转义", category: "控制字符" },
  { dec: 28, hex: "0x1C", char: "FS", description: "文件分隔符", category: "控制字符" },
  { dec: 29, hex: "0x1D", char: "GS", description: "组分隔符", category: "控制字符" },
  { dec: 30, hex: "0x1E", char: "RS", description: "记录分隔符", category: "控制字符" },
  { dec: 31, hex: "0x1F", char: "US", description: "单元分隔符", category: "控制字符" },

  // 可打印字符 (32-127)
  { dec: 32, hex: "0x20", char: " ", description: "空格", category: "空白字符" },
  { dec: 33, hex: "0x21", char: "!", description: "感叹号", category: "标点符号" },
  { dec: 34, hex: "0x22", char: "\"", description: "双引号", category: "标点符号" },
  { dec: 35, hex: "0x23", char: "#", description: "井号", category: "标点符号" },
  { dec: 36, hex: "0x24", char: "$", description: "美元符", category: "标点符号" },
  { dec: 37, hex: "0x25", char: "%", description: "百分号", category: "标点符号" },
  { dec: 38, hex: "0x26", char: "&", description: "和号", category: "标点符号" },
  { dec: 39, hex: "0x27", char: "'", description: "单引号", category: "标点符号" },
  { dec: 40, hex: "0x28", char: "(", description: "左括号", category: "标点符号" },
  { dec: 41, hex: "0x29", char: ")", description: "右括号", category: "标点符号" },
  { dec: 42, hex: "0x2A", char: "*", description: "星号", category: "标点符号" },
  { dec: 43, hex: "0x2B", char: "+", description: "加号", category: "标点符号" },
  { dec: 44, hex: "0x2C", char: ",", description: "逗号", category: "标点符号" },
  { dec: 45, hex: "0x2D", char: "-", description: "减号", category: "标点符号" },
  { dec: 46, hex: "0x2E", char: ".", description: "句点", category: "标点符号" },
  { dec: 47, hex: "0x2F", char: "/", description: "斜杠", category: "标点符号" },

  // 数字 (48-57)
  ...[...Array(10)].map((_, i) => ({
    dec: 48 + i,
    hex: `0x${(48 + i).toString(16).toUpperCase()}`,
    char: String(i),
    description: `数字${i}`,
    category: "数字"
  })),

  // 标点符号 (58-64)
  { dec: 58, hex: "0x3A", char: ":", description: "冒号", category: "标点符号" },
  { dec: 59, hex: "0x3B", char: ";", description: "分号", category: "标点符号" },
  { dec: 60, hex: "0x3C", char: "<", description: "小于号", category: "标点符号" },
  { dec: 61, hex: "0x3D", char: "=", description: "等于号", category: "标点符号" },
  { dec: 62, hex: "0x3E", char: ">", description: "大于号", category: "标点符号" },
  { dec: 63, hex: "0x3F", char: "?", description: "问号", category: "标点符号" },
  { dec: 64, hex: "0x40", char: "@", description: "at符号", category: "标点符号" },

  // 大写字母 (65-90)
  ...[...Array(26)].map((_, i) => ({
    dec: 65 + i,
    hex: `0x${(65 + i).toString(16).toUpperCase()}`,
    char: String.fromCharCode(65 + i),
    description: `大写字母${String.fromCharCode(65 + i)}`,
    category: "大写字母"
  })),

  // 标点符号 (91-96)
  { dec: 91, hex: "0x5B", char: "[", description: "左方括号", category: "标点符号" },
  { dec: 92, hex: "0x5C", char: "\\", description: "反斜杠", category: "标点符号" },
  { dec: 93, hex: "0x5D", char: "]", description: "右方括号", category: "标点符号" },
  { dec: 94, hex: "0x5E", char: "^", description: "脱字符", category: "标点符号" },
  { dec: 95, hex: "0x5F", char: "_", description: "下划线", category: "标点符号" },
  { dec: 96, hex: "0x60", char: "`", description: "反引号", category: "标点符号" },

  // 小写字母 (97-122)
  ...[...Array(26)].map((_, i) => ({
    dec: 97 + i,
    hex: `0x${(97 + i).toString(16).toUpperCase()}`,
    char: String.fromCharCode(97 + i),
    description: `小写字母${String.fromCharCode(97 + i)}`,
    category: "小写字母"
  })),

  // 标点符号 (123-126)
  { dec: 123, hex: "0x7B", char: "{", description: "左花括号", category: "标点符号" },
  { dec: 124, hex: "0x7C", char: "|", description: "竖线", category: "标点符号" },
  { dec: 125, hex: "0x7D", char: "}", description: "右花括号", category: "标点符号" },
  { dec: 126, hex: "0x7E", char: "~", description: "波浪号", category: "标点符号" },
  { dec: 127, hex: "0x7F", char: "DEL", description: "删除", category: "控制字符" }
];

function AsciiTable() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [inputChar, setInputChar] = useState("");
  const [convertResult, setConvertResult] = useState<AsciiCode | null>(null);

  const filteredCodes = ASCII_CODES.filter(code => 
    code.dec.toString().includes(searchTerm) ||
    code.hex.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.char.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    code.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCharInput = (value: string) => {
    setInputChar(value);
    if (value.length > 0) {
      const charCode = value.charCodeAt(0);
      const result = ASCII_CODES.find(code => code.dec === charCode);
      setConvertResult(result || null);
    } else {
      setConvertResult(null);
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "控制字符": return "text-red-500";
      case "空白字符": return "text-gray-500";
      case "标点符号": return "text-purple-500";
      case "数字": return "text-blue-500";
      case "大写字母": return "text-green-500";
      case "小写字母": return "text-teal-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>ASCII 码对照表</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* ASCII转换工具 */}
            <div className="flex flex-col gap-4 p-4 bg-white rounded-lg border">
              <h3 className="text-lg font-medium">ASCII 转换工具</h3>
              <div className="flex gap-4">
                <Input
                  placeholder="输入字符..."
                  value={inputChar}
                  onChange={(e) => handleCharInput(e.target.value)}
                  maxLength={1}
                  className="max-w-xs"
                />
                {convertResult && (
                  <div className="flex gap-4 items-center">
                    <span>十进制: {convertResult.dec}</span>
                    <span>十六进制: {convertResult.hex}</span>
                    <span>描述: {convertResult.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 搜索栏 */}
            <div className="flex gap-2">
              <Input
                placeholder="搜索ASCII码、字符或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* ASCII码网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCodes.map((code) => (
                <div
                  key={code.dec}
                  className={`p-4 rounded-lg border bg-white hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-lg font-mono ${getCategoryColor(code.category)}`}>
                      {code.char}
                    </span>
                    <span className="text-sm text-gray-500">{code.category}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">十进制:</span>
                      <span className="font-mono">{code.dec}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">十六进制:</span>
                      <span className="font-mono">{code.hex}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {code.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                提示：ASCII（美国信息交换标准代码）是最基础的字符编码标准。您可以通过搜索框查找特定的ASCII码信息，或使用转换工具进行字符与ASCII码的转换。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}