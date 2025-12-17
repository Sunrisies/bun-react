import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle,
  Copy,
  Globe,
  Info,
  RefreshCw,
  Search,
  Server,
  Shield,
  X,
  Zap
} from "lucide-react"
import { useEffect, useState } from "react"

export const Route = createFileRoute("/httpStatus")({
  component: HttpStatus,
})

interface HttpStatusCode {
  code: number
  message: string
  description: string
  category: string
  color: string
  icon: React.ReactNode
}

const HTTP_STATUS_CODES: HttpStatusCode[] = [
  // 1xx 信息响应
  { code: 100, message: "Continue", description: "继续。客户端应继续其请求", category: "信息响应", color: "from-blue-400 to-blue-500", icon: <Info className="h-5 w-5" /> },
  { code: 101, message: "Switching Protocols", description: "切换协议。服务器根据客户端的请求切换协议", category: "信息响应", color: "from-blue-400 to-blue-500", icon: <RefreshCw className="h-5 w-5" /> },
  { code: 102, message: "Processing", description: "处理中。服务器收到并正在处理请求，但无响应可用", category: "信息响应", color: "from-blue-400 to-blue-500", icon: <Zap className="h-5 w-5" /> },
  { code: 103, message: "Early Hints", description: "早期提示。用来在最终的HTTP消息之前返回一些响应头", category: "信息响应", color: "from-blue-400 to-blue-500", icon: <Info className="h-5 w-5" /> },

  // 2xx 成功响应
  { code: 200, message: "OK", description: "请求成功。一般用于GET与POST请求", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },
  { code: 201, message: "Created", description: "已创建。成功请求并创建了新的资源", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },
  { code: 202, message: "Accepted", description: "已接受。已经接受请求，但未处理完成", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },
  { code: 203, message: "Non-Authoritative Information", description: "非授权信息。请求成功，但返回的信息可能来自另一来源", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },
  { code: 204, message: "No Content", description: "无内容。服务器成功处理，但未返回内容", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },
  { code: 205, message: "Reset Content", description: "重置内容。服务器处理成功，用户终端应重置文档视图", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },
  { code: 206, message: "Partial Content", description: "部分内容。服务器成功处理了部分GET请求", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },
  { code: 207, message: "Multi-Status", description: "多状态。消息体中可能存在多个状态码", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },
  { code: 208, message: "Already Reported", description: "已报告。DAV绑定的成员已在（多状态）响应之前的部分被列出", category: "成功响应", color: "from-green-400 to-green-500", icon: <CheckCircle className="h-5 w-5" /> },

  // 3xx 重定向
  { code: 300, message: "Multiple Choices", description: "多种选择。请求的资源可包括多个位置", category: "重定向", color: "from-yellow-400 to-yellow-500", icon: <RefreshCw className="h-5 w-5" /> },
  { code: 301, message: "Moved Permanently", description: "永久移动。请求的资源已被永久移动到新位置", category: "重定向", color: "from-yellow-400 to-yellow-500", icon: <RefreshCw className="h-5 w-5" /> },
  { code: 302, message: "Found", description: "临时移动。请求的资源临时从不同的URI响应请求", category: "重定向", color: "from-yellow-400 to-yellow-500", icon: <RefreshCw className="h-5 w-5" /> },
  { code: 303, message: "See Other", description: "查看其它。使用GET方法定向到另一个URL", category: "重定向", color: "from-yellow-400 to-yellow-500", icon: <RefreshCw className="h-5 w-5" /> },
  { code: 304, message: "Not Modified", description: "未修改。所请求的资源未修改，服务器返回此状态码时，不会返回任何资源", category: "重定向", color: "from-yellow-400 to-yellow-500", icon: <RefreshCw className="h-5 w-5" /> },
  { code: 305, message: "Use Proxy", description: "使用代理。所请求的资源必须通过代理访问", category: "重定向", color: "from-yellow-400 to-yellow-500", icon: <Globe className="h-5 w-5" /> },
  { code: 307, message: "Temporary Redirect", description: "临时重定向。与302类似，但不允许更改请求方法", category: "重定向", color: "from-yellow-400 to-yellow-500", icon: <RefreshCw className="h-5 w-5" /> },
  { code: 308, message: "Permanent Redirect", description: "永久重定向。与301类似，但不允许更改请求方法", category: "重定向", color: "from-yellow-400 to-yellow-500", icon: <RefreshCw className="h-5 w-5" /> },

  // 4xx 客户端错误
  { code: 400, message: "Bad Request", description: "错误请求。服务器不理解请求的语法", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 401, message: "Unauthorized", description: "未授权。请求要求用户的身份认证", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <Shield className="h-5 w-5" /> },
  { code: 402, message: "Payment Required", description: "需要付款。预留状态码", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 403, message: "Forbidden", description: "禁止。服务器理解请求但拒绝执行", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <Shield className="h-5 w-5" /> },
  { code: 404, message: "Not Found", description: "未找到。服务器找不到请求的资源", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertCircle className="h-5 w-5" /> },
  { code: 405, message: "Method Not Allowed", description: "方法禁用。禁用请求中指定的方法", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 406, message: "Not Acceptable", description: "不接受。无法使用请求的内容特性响应请求的网页", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 407, message: "Proxy Authentication Required", description: "需要代理授权。客户端必须先使用代理服务器进行验证", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <Shield className="h-5 w-5" /> },
  { code: 408, message: "Request Timeout", description: "请求超时。服务器等候请求时发生超时", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertCircle className="h-5 w-5" /> },
  { code: 409, message: "Conflict", description: "冲突。服务器在完成请求时发生冲突", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 410, message: "Gone", description: "已删除。请求的资源永久删除", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertCircle className="h-5 w-5" /> },
  { code: 411, message: "Length Required", description: "需要有效长度。服务器拒绝在没有定义Content-Length头的情况下处理请求", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 412, message: "Precondition Failed", description: "未满足前提条件。服务器未满足请求者在请求中设置的其中一个前提条件", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 413, message: "Payload Too Large", description: "请求实体过大。服务器无法处理请求，因为请求实体过大", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 414, message: "URI Too Long", description: "请求的URI过长。服务器无法处理请求，因为URI过长", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 415, message: "Unsupported Media Type", description: "不支持的媒体类型。服务器无法处理请求附带的媒体格式", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 416, message: "Range Not Satisfiable", description: "请求范围不符合要求。客户端请求的范围无效", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 417, message: "Expectation Failed", description: "未满足期望值。服务器无法满足Expect的请求头信息", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 418, message: "I'm a teapot", description: "我是一个茶壶。超文本咖啡壶控制协议的笑话", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertCircle className="h-5 w-5" /> },
  { code: 421, message: "Misdirected Request", description: "误导请求。服务器无法产生响应", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 422, message: "Unprocessable Entity", description: "无法处理的实体。请求格式正确，但含有语义错误", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 423, message: "Locked", description: "已锁定。当前资源被锁定", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <Shield className="h-5 w-5" /> },
  { code: 424, message: "Failed Dependency", description: "依赖关系失败。由于之前的某个请求发生错误，导致当前请求失败", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 426, message: "Upgrade Required", description: "需要升级。客户端应当切换到TLS/1.0", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 428, message: "Precondition Required", description: "要求先决条件。服务器要求有条件的请求", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 429, message: "Too Many Requests", description: "太多请求。用户在给定的时间内发送了太多的请求", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertCircle className="h-5 w-5" /> },
  { code: 431, message: "Request Header Fields Too Large", description: "请求头字段太大。服务器不愿处理请求，因为它的头字段太大", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <AlertTriangle className="h-5 w-5" /> },
  { code: 451, message: "Unavailable For Legal Reasons", description: "因法律原因不可用。该请求因法律原因不可用", category: "客户端错误", color: "from-orange-400 to-orange-500", icon: <Shield className="h-5 w-5" /> },

  // 5xx 服务器错误
  { code: 500, message: "Internal Server Error", description: "服务器内部错误。服务器遇到错误，无法完成请求", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 501, message: "Not Implemented", description: "尚未实施。服务器不具备完成请求的功能", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 502, message: "Bad Gateway", description: "错误网关。服务器作为网关或代理，从上游服务器收到无效响应", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 503, message: "Service Unavailable", description: "服务不可用。服务器暂时无法处理请求", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 504, message: "Gateway Timeout", description: "网关超时。服务器作为网关或代理，但是没有及时从上游服务器收到请求", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 505, message: "HTTP Version Not Supported", description: "HTTP版本不受支持。服务器不支持请求中所用的HTTP协议版本", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 506, message: "Variant Also Negotiates", description: "服务器存在内部配置错误", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 507, message: "Insufficient Storage", description: "存储空间不足。服务器无法存储完成请求所必须的内容", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 508, message: "Loop Detected", description: "检测到循环。服务器在处理请求时检测到无限循环", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 510, message: "Not Extended", description: "未扩展。获取资源所需要的策略并没有被满足", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Server className="h-5 w-5" /> },
  { code: 511, message: "Network Authentication Required", description: "要求网络认证。客户端需要进行身份验证才能获得网络访问权限", category: "服务器错误", color: "from-red-400 to-red-500", icon: <Shield className="h-5 w-5" /> }
]

const CATEGORIES = ["所有", "信息响应", "成功响应", "重定向", "客户端错误", "服务器错误"]

function HttpStatus() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("所有")
  const [copiedCode, setCopiedCode] = useState<number | null>(null)




  const filteredCodes = HTTP_STATUS_CODES.filter(status => {
    const matchesSearch = searchTerm === "" ||
      status.code.toString().includes(searchTerm) ||
      status.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "所有" || status.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "信息响应": return "bg-blue-100 text-blue-800 border-blue-200"
      case "成功响应": return "bg-green-100 text-green-800 border-green-200"
      case "重定向": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "客户端错误": return "bg-orange-100 text-orange-800 border-orange-200"
      case "服务器错误": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const commonStatusCodes = [200, 301, 302, 304, 400, 401, 403, 404, 405, 408, 418, 429, 500, 502, 503, 504]

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 h-[calc(100vh-4.2rem)] p-4 md:px-6 py-3 overflow-hidden">
      <div className="mx-auto h-full flex flex-col">
        {/* 头部区域 */}
        <div className="mb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HTTP 状态码大全  <div className="relative inline-block group">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors">
                    <Info className="h-6 w-6" />
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-80 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700"></div>
                    {/* 底部信息 */}
                    <div className="">
                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                          使用说明
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
                            <span>点击状态码卡片上的星形图标添加收藏</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                            <span>点击复制图标复制状态码到剪贴板</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5"></div>
                            <span>使用筛选面板快速定位特定状态码</span>
                          </li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
                          状态码分类
                        </h3>
                        <div className="space-y-2">
                          {CATEGORIES.slice(1).map(category => (
                            <div key={category} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">{category}</span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                {HTTP_STATUS_CODES.filter(s => s.category === category).length} 个
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </h1>
              <p className="text-gray-600 mt-2">
                快速查询和了解 HTTP 状态码的含义与用途，提升开发调试效率
              </p>
            </div>
            <Button
              onClick={() => navigate({ to: "/" })}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* 左侧筛选面板 */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200 shadow-sm sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">筛选与搜索</CardTitle>
                <CardDescription>快速找到所需状态码</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 搜索框 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">搜索</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="状态码、消息或描述..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 类别筛选 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">类别</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="选择类别" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${category === "信息响应" ? "bg-blue-500" :
                              category === "成功响应" ? "bg-green-500" :
                                category === "重定向" ? "bg-yellow-500" :
                                  category === "客户端错误" ? "bg-orange-500" :
                                    category === "服务器错误" ? "bg-red-500" : "bg-gray-500"
                              }`} />
                            {category}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 快速筛选 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">快速筛选</label>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50"
                      onClick={() => setSelectedCategory("所有")}
                    >
                      全部
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-50 text-blue-600"
                      onClick={() => setSelectedCategory("信息响应")}
                    >
                      1xx 信息
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-green-50 text-green-600"
                      onClick={() => setSelectedCategory("成功响应")}
                    >
                      2xx 成功
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-yellow-50 text-yellow-600"
                      onClick={() => setSelectedCategory("重定向")}
                    >
                      3xx 重定向
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-orange-50 text-orange-600"
                      onClick={() => setSelectedCategory("客户端错误")}
                    >
                      4xx 客户端错误
                    </Badge>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-red-50 text-red-600"
                      onClick={() => setSelectedCategory("服务器错误")}
                    >
                      5xx 服务器错误
                    </Badge>
                  </div>
                </div>


                {/* 结果统计 */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-600">
                    找到 <span className="font-bold text-gray-800">{filteredCodes.length}</span> 个状态码
                    {selectedCategory !== "所有" && (
                      <span>（{selectedCategory}）</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧卡片列表 */}
          <div className="lg:col-span-5">
            {/* 标签页导航 */}
            <Tabs defaultValue="all" className="mb-6">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="all">全部状态码</TabsTrigger>
                <TabsTrigger value="common">常用状态码</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {filteredCodes.length === 0 ? (
                  <Card className="border-gray-200">
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">未找到匹配的状态码</h3>
                      <p className="text-gray-500">尝试使用不同的搜索词或选择其他类别</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 h-[700px] overflow-auto md:grid-cols-2 lg:grid-cols-6 gap-4">
                    {filteredCodes.map((status) => (
                      <Card
                        key={status.code}
                        className={`border-gray-200 cursor-pointer p-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1
                          }` }
                      >
                        <CardContent className="p-4">
                          {/* 状态码头部 */}
                          <div className="flex items-start justify-between mb-4">
                            <div className={`rounded-lg p-3 bg-gradient-to-br ${status.color} shadow-sm`}>
                              <div className="text-white font-bold text-xl">{status.code}</div>
                            </div>
                          </div>

                          {/* 状态码信息 */}
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold text-gray-800 text-lg">{status.message}</h3>
                              <p className="text-gray-600 text-sm mt-1">{status.description}</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className={`${getCategoryColor(status.category)}`}
                              >
                                {status.category}
                              </Badge>

                              <div className="flex items-center text-gray-500 text-sm">
                                {status.icon}
                                <span className="ml-1">
                                  {status.code >= 500 ? "服务器错误" :
                                    status.code >= 400 ? "客户端错误" :
                                      status.code >= 300 ? "重定向" :
                                        status.code >= 200 ? "成功响应" : "信息响应"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="common">
                <div className="grid grid-cols-1 h-[700px] overflow-auto md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {HTTP_STATUS_CODES.filter(status => commonStatusCodes.includes(status.code)).map((status) => (
                    <Card key={status.code} className="cursor-pointer border-gray-200 p-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`rounded-lg p-3 bg-gradient-to-br ${status.color} shadow-sm`}>
                            <div className="text-white font-bold text-xl">{status.code}</div>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">常用</Badge>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">{status.message}</h3>
                            <p className="text-gray-600 text-sm mt-1">{status.description}</p>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className={getCategoryColor(status.category)}>
                              {status.category}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>


      </div>
    </div>
  )
}