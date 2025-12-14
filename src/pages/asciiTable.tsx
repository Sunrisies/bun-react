import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Search, Copy, Info, AlertCircle, Hash, Type } from "lucide-react"
import { useState, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { copyToClipboard } from "@/lib/utils"

export const Route = createFileRoute("/asciiTable")({
  component: AsciiTable,
})

interface AsciiCode {
  dec: number
  hex: string
  char: string
  description: string
  category: string
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
]

function AsciiTable() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [inputChar, setInputChar] = useState("")
  const [convertResult, setConvertResult] = useState<AsciiCode | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("所有")

  const categories = ["所有", "控制字符", "空白字符", "标点符号", "数字", "大写字母", "小写字母"]

  const filteredCodes = useMemo(() => {
    return ASCII_CODES.filter(code => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch = q === "" ||
        code.dec.toString().includes(q) ||
        code.hex.toLowerCase().includes(q) ||
        code.char.toLowerCase().includes(q) ||
        code.description.toLowerCase().includes(q)
      const matchesCategory = selectedCategory === "所有" || code.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const handleCharInput = (value: string) => {
    setInputChar(value)
    if (value.length > 0) {
      const charCode = value.charCodeAt(0)
      const result = ASCII_CODES.find(code => code.dec === charCode)
      setConvertResult(result || null)
    } else {
      setConvertResult(null)
    }
  }

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "控制字符":
        return { bg: "from-red-400 to-red-500", text: "text-red-600", icon: <AlertCircle className="h-5 w-5" /> }
      case "空白字符":
        return { bg: "from-gray-400 to-gray-500", text: "text-gray-600", icon: <Type className="h-5 w-5" /> }
      case "标点符号":
        return { bg: "from-purple-400 to-purple-500", text: "text-purple-600", icon: <Hash className="h-5 w-5" /> }
      case "数字":
        return { bg: "from-blue-400 to-blue-500", text: "text-blue-600", icon: <Hash className="h-5 w-5" /> }
      case "大写字母":
        return { bg: "from-green-400 to-green-500", text: "text-green-600", icon: <Type className="h-5 w-5" /> }
      case "小写字母":
        return { bg: "from-teal-400 to-teal-500", text: "text-teal-600", icon: <Type className="h-5 w-5" /> }
      default:
        return { bg: "from-gray-400 to-gray-500", text: "text-gray-600", icon: <Info className="h-5 w-5" /> }
    }
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 h-[calc(100vh-4.2rem)] p-4 md:px-6 py-3">
      <div className="mx-auto">
        <div className="mb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ASCII 码对照表
                <div className="relative inline-block group">
                  <div className="inline-flex items-center justify-center ml-2 w-8 h-8 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
                    <Info className="h-6 w-6" />
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-white border-l border-t border-gray-200"></div>
                    <div>
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-500" />
                          使用说明
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                            <span>通过搜索与类别筛选快速定位字符信息</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                            <span>点击复制图标复制ASCII码到剪贴板</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5"></div>
                            <span>使用转换工具快速查询单个字符的ASCII码</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3 mt-2">
                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          ASCII码分类
                        </h3>
                        <div className="space-y-2">
                          { categories.slice(1).map((category) => (
                            <div key={ category } className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{ category }</span>
                              <span className="font-medium text-gray-800">
                                { ASCII_CODES.filter((code) => code.category === category).length } 个
                              </span>
                            </div>
                          )) }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </h1>
            </div>
            <Button onClick={ () => navigate({ to: "/" }) } variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </div>

        {/* ASCII转换工具 */ }

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-2">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">筛选面板</CardTitle>
                <CardDescription>按类别与关键词筛选ASCII码</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="搜索ASCII码、字符或描述"
                      value={ searchTerm }
                      onChange={ (e) => setSearchTerm(e.target.value) }
                      className="flex-1"
                    />
                    <Button variant="outline" className="shrink-0"><Search className="h-4 w-4" /></Button>
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="cursor-pointer" onClick={ () => setSelectedCategory("所有") }>全部</Badge>
                      <Badge variant="outline" className="cursor-pointer text-red-600" onClick={ () => setSelectedCategory("控制字符") }>控制</Badge>
                      <Badge variant="outline" className="cursor-pointer text-gray-600" onClick={ () => setSelectedCategory("空白字符") }>空白</Badge>
                      <Badge variant="outline" className="cursor-pointer text-purple-600" onClick={ () => setSelectedCategory("标点符号") }>标点</Badge>
                      <Badge variant="outline" className="cursor-pointer text-blue-600" onClick={ () => setSelectedCategory("数字") }>数字</Badge>
                      <Badge variant="outline" className="cursor-pointer text-green-600" onClick={ () => setSelectedCategory("大写字母") }>大写</Badge>
                      <Badge variant="outline" className="cursor-pointer text-teal-600" onClick={ () => setSelectedCategory("小写字母") }>小写</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-10">
            <Tabs defaultValue="all">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="all">全部</TabsTrigger>
                <TabsTrigger value="common">常用</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                { filteredCodes.length === 0 ? (
                  <Card className="mt-4">
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">未找到匹配的ASCII码</h3>
                      <p className="text-gray-500">尝试调整搜索词或选择其他类别</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 h-[700px] overflow-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                    { filteredCodes.map((code) => {
                      const style = getCategoryStyle(code.category)
                      return (
                        <Card key={ code.dec } className="border-gray-200 p-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className={ `rounded-lg p-3 bg-gradient-to-br ${style.bg} shadow-sm flex items-center justify-center w-12 h-12` }>
                                <div className="text-white font-bold text-xl">{ code.char }</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={ () => copyToClipboard(code.dec.toString()) }>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Badge variant="outline" className={ style.text }>{ code.category }</Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                { style.icon }
                                <span className="font-medium">字符信息</span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{ code.description }</p>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">十进制</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">{ code.dec }</span>
                                  <Button variant="ghost" size="sm" onClick={ () => copyToClipboard(code.dec.toString()) }>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">十六进制</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm">{ code.hex }</span>
                                  <Button variant="ghost" size="sm" onClick={ () => copyToClipboard(code.hex) }>
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    }) }
                  </div>
                ) }
              </TabsContent>

              <TabsContent value="common">
                <div className="grid grid-cols-1 h-[700px] overflow-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  { ASCII_CODES.filter(code =>
                    code.dec >= 32 && code.dec <= 126 &&
                    (code.category === "数字" || code.category === "大写字母" || code.category === "小写字母")
                  ).map((code) => {
                    const style = getCategoryStyle(code.category)
                    return (
                      <Card key={ code.dec } className="border-gray-200 p-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className={ `rounded-lg p-3 bg-gradient-to-br ${style.bg} shadow-sm flex items-center justify-center w-12 h-12` }>
                              <div className="text-white font-bold text-xl">{ code.char }</div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">常用</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              { style.icon }
                              <span className="font-medium">字符信息</span>
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed">{ code.description }</p>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-sm">十进制</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{ code.dec }</span>
                                <Button variant="ghost" size="sm" onClick={ () => copyToClipboard(code.dec.toString()) }>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600 text-sm">十六进制</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{ code.hex }</span>
                                <Button variant="ghost" size="sm" onClick={ () => copyToClipboard(code.hex) }>
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }) }
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}