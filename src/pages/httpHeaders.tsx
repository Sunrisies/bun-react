import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ArrowLeft, Copy, Globe, Info, Search, Server, Shield } from "lucide-react"
import { copyToClipboard } from "@/lib/utils"

export const Route = createFileRoute("/httpHeaders")({
  component: HttpHeaders,
})

interface HttpHeader {
  name: string
  description: string
  example: string
  category: "通用头" | "请求头" | "响应头" | "实体头"
}

const HTTP_HEADERS: HttpHeader[] = [
  // 通用头
  {
    name: "Cache-Control",
    description: "控制缓存的行为，指定请求/响应链上所有缓存机制必须遵守的指令",
    example: "Cache-Control: no-cache, no-store, must-revalidate",
    category: "通用头"
  },
  {
    name: "Connection",
    description: "决定当前事务完成后，是否会关闭网络连接",
    example: "Connection: keep-alive",
    category: "通用头"
  },
  {
    name: "Date",
    description: "报文创建的日期和时间",
    example: "Date: Wed, 21 Oct 2015 07:28:00 GMT",
    category: "通用头"
  },
  {
    name: "Pragma",
    description: "包含特定的实现指令，主要用于兼容 HTTP/1.0 的客户端",
    example: "Pragma: no-cache",
    category: "通用头"
  },
  {
    name: "Trailer",
    description: "允许发送方在分块发送的消息后面添加额外的元信息",
    example: "Trailer: Max-Forwards",
    category: "通用头"
  },
  {
    name: "Transfer-Encoding",
    description: "指定报文主体的传输编码方式",
    example: "Transfer-Encoding: chunked",
    category: "通用头"
  },
  {
    name: "Upgrade",
    description: "允许客户端指定其支持的其他通信协议，使服务器可以切换到更合适的协议",
    example: "Upgrade: websocket",
    category: "通用头"
  },
  {
    name: "Via",
    description: "显示报文经过的中间节点（代理、网关）",
    example: "Via: 1.1 vegur",
    category: "通用头"
  },
  {
    name: "Warning",
    description: "携带网关或缓存的警告信息",
    example: "Warning: 199 Miscellaneous warning",
    category: "通用头"
  },

  // 请求头
  {
    name: "Accept",
    description: "告知服务器客户端可以处理的内容类型",
    example: "Accept: text/html,application/xhtml+xml,application/xml",
    category: "请求头"
  },
  {
    name: "Accept-Charset",
    description: "告知服务器客户端支持的字符集",
    example: "Accept-Charset: utf-8",
    category: "请求头"
  },
  {
    name: "Accept-Encoding",
    description: "告知服务器客户端支持的内容编码方式",
    example: "Accept-Encoding: gzip, deflate, br",
    category: "请求头"
  },
  {
    name: "Accept-Language",
    description: "告知服务器客户端支持的自然语言",
    example: "Accept-Language: zh-CN,zh;q=0.9,en;q=0.8",
    category: "请求头"
  },
  {
    name: "Authorization",
    description: "包含用于验证用户代理身份的凭证",
    example: "Authorization: Bearer <token>",
    category: "请求头"
  },
  {
    name: "Cookie",
    description: "之前由服务器通过 Set-Cookie 发送的 HTTP cookie",
    example: "Cookie: name=value; name2=value2",
    category: "请求头"
  },
  {
    name: "Expect",
    description: "表明客户端要求服务器做出特定的行为",
    example: "Expect: 100-continue",
    category: "请求头"
  },
  {
    name: "From",
    description: "提供发起请求的用户的电子邮件地址",
    example: "From: user@example.com",
    category: "请求头"
  },
  {
    name: "Host",
    description: "指定服务器的域名和端口号",
    example: "Host: www.example.com",
    category: "请求头"
  },
  {
    name: "If-Match",
    description: "仅当客户端提供的实体与服务器上的实体相匹配时，才进行对应的操作",
    example: "If-Match: \"737060cd8c284d8af7ad3082f209582d\"",
    category: "请求头"
  },
  {
    name: "If-Modified-Since",
    description: "允许在对应的资源未被修改的情况下返回 304 未修改",
    example: "If-Modified-Since: Sat, 29 Oct 2023 19:43:31 GMT",
    category: "请求头"
  },
  {
    name: "If-None-Match",
    description: "允许在对应的内容未被修改的情况下返回 304 未修改",
    example: "If-None-Match: \"737060cd8c284d8af7ad3082f209582d\"",
    category: "请求头"
  },
  {
    name: "If-Range",
    description: "允许发送某个未被修改过的部分",
    example: "If-Range: \"737060cd8c284d8af7ad3082f209582d\"",
    category: "请求头"
  },
  {
    name: "If-Unmodified-Since",
    description: "仅当资源在指定的时间之后未被修改的情况下，才执行请求的操作",
    example: "If-Unmodified-Since: Sat, 29 Oct 2023 19:43:31 GMT",
    category: "请求头"
  },
  {
    name: "Max-Forwards",
    description: "限制代理或网关的转发次数",
    example: "Max-Forwards: 10",
    category: "请求头"
  },
  {
    name: "Origin",
    description: "标识跨域资源请求的来源",
    example: "Origin: http://example.com",
    category: "请求头"
  },
  {
    name: "Proxy-Authorization",
    description: "用于向代理进行认证的凭证",
    example: "Proxy-Authorization: Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==",
    category: "请求头"
  },
  {
    name: "Range",
    description: "请求实体的部分内容",
    example: "Range: bytes=500-999",
    category: "请求头"
  },
  {
    name: "Referer",
    description: "表示请求的来源地址",
    example: "Referer: https://example.com/page",
    category: "请求头"
  },
  {
    name: "TE",
    description: "指定用户代理希望使用的传输编码类型",
    example: "TE: trailers, deflate",
    category: "请求头"
  },
  {
    name: "User-Agent",
    description: "标识客户端的应用类型、操作系统、软件开发商等信息",
    example: "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...",
    category: "请求头"
  },

  // 响应头
  {
    name: "Accept-Ranges",
    description: "标识服务器是否支持范围请求",
    example: "Accept-Ranges: bytes",
    category: "响应头"
  },
  {
    name: "Access-Control-Allow-Origin",
    description: "指定哪些网站可以参与跨源资源共享",
    example: "Access-Control-Allow-Origin: *",
    category: "响应头"
  },
  {
    name: "Age",
    description: "对象在代理缓存中存在的时间",
    example: "Age: 12",
    category: "响应头"
  },
  {
    name: "Allow",
    description: "列出资源所支持的 HTTP 方法",
    example: "Allow: GET, HEAD, POST",
    category: "响应头"
  },
  {
    name: "Content-Disposition",
    description: "指示回复的内容该以何种形式展示",
    example: "Content-Disposition: attachment; filename=\"filename.jpg\"",
    category: "响应头"
  },
  {
    name: "Content-Range",
    description: "标识资源的位置范围",
    example: "Content-Range: bytes 21010-47021/47022",
    category: "响应头"
  },
  {
    name: "ETag",
    description: "资源的特定版本的标识符",
    example: "ETag: \"33a64df551425fcc55e4d42a148795d9f25f89d4\"",
    category: "响应头"
  },
  {
    name: "Location",
    description: "用于重定向接收方到新的位置",
    example: "Location: http://www.example.com/new-page",
    category: "响应头"
  },
  {
    name: "Proxy-Authenticate",
    description: "指定代理服务器上的认证方式",
    example: "Proxy-Authenticate: Basic",
    category: "响应头"
  },
  {
    name: "Retry-After",
    description: "告诉客户端多久后可以再次发送请求",
    example: "Retry-After: 120",
    category: "响应头"
  },
  {
    name: "Server",
    description: "包含了服务器用来处理请求的软件信息",
    example: "Server: Apache/2.4.1 (Unix)",
    category: "响应头"
  },
  {
    name: "Set-Cookie",
    description: "服务器端向客户端发送 cookie",
    example: "Set-Cookie: UserID=JohnDoe; Max-Age=3600; Version=1",
    category: "响应头"
  },
  {
    name: "Vary",
    description: "决定如何匹配未来的请求头，以决定是否可使用缓存的回复",
    example: "Vary: User-Agent",
    category: "响应头"
  },
  {
    name: "WWW-Authenticate",
    description: "定义访问资源所需的认证方式",
    example: "WWW-Authenticate: Basic realm=\"Access to the staging site\"",
    category: "响应头"
  },

  // 实体头
  {
    name: "Allow",
    description: "列出对资源的有效操作方法",
    example: "Allow: GET, HEAD, POST",
    category: "实体头"
  },
  {
    name: "Content-Encoding",
    description: "指示资源的编码方式",
    example: "Content-Encoding: gzip",
    category: "实体头"
  },
  {
    name: "Content-Language",
    description: "描述资源所用的自然语言",
    example: "Content-Language: zh-CN",
    category: "实体头"
  },
  {
    name: "Content-Length",
    description: "指示资源的大小，单位为字节",
    example: "Content-Length: 348",
    category: "实体头"
  },
  {
    name: "Content-Location",
    description: "指定返回数据的备用位置",
    example: "Content-Location: /index.htm",
    category: "实体头"
  },
  {
    name: "Content-MD5",
    description: "实体内容的 MD5 校验值",
    example: "Content-MD5: Q2hlY2sgSW50ZWdyaXR5IQ==",
    category: "实体头"
  },
  {
    name: "Content-Range",
    description: "指定实体内容的位置范围",
    example: "Content-Range: bytes 21010-47021/47022",
    category: "实体头"
  },
  {
    name: "Content-Type",
    description: "指示资源的 MIME 类型",
    example: "Content-Type: text/html; charset=utf-8",
    category: "实体头"
  },
  {
    name: "Expires",
    description: "指定资源的过期时间",
    example: "Expires: Wed, 21 Oct 2015 07:28:00 GMT",
    category: "实体头"
  },
  {
    name: "Last-Modified",
    description: "指示资源的最后修改时间",
    example: "Last-Modified: Wed, 21 Oct 2015 07:28:00 GMT",
    category: "实体头"
  }
]

const CATEGORIES = ["所有", "通用头", "请求头", "响应头", "实体头"]
const COMMON_HEADERS = [
  "Accept",
  "Accept-Encoding",
  "Accept-Language",
  "Authorization",
  "Cache-Control",
  "Connection",
  "Content-Type",
  "Cookie",
  "Host",
  "Origin",
  "Referer",
  "User-Agent",
  "Set-Cookie",
  "ETag",
]

function HttpHeaders() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("所有")

  const filteredHeaders = useMemo(() => {
    return HTTP_HEADERS.filter((header) => {
      const q = searchTerm.trim().toLowerCase()
      const matchesSearch = q === "" ||
        header.name.toLowerCase().includes(q) ||
        header.description.toLowerCase().includes(q) ||
        header.example.toLowerCase().includes(q)
      const matchesCategory = selectedCategory === "所有" || header.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case "通用头":
        return { bg: "from-indigo-400 to-indigo-500", text: "text-indigo-600", icon: <Globe className="h-5 w-5" /> }
      case "请求头":
        return { bg: "from-blue-400 to-blue-500", text: "text-blue-600", icon: <Shield className="h-5 w-5" /> }
      case "响应头":
        return { bg: "from-green-400 to-green-500", text: "text-green-600", icon: <Server className="h-5 w-5" /> }
      case "实体头":
        return { bg: "from-orange-400 to-orange-500", text: "text-orange-600", icon: <Info className="h-5 w-5" /> }
      default:
        return { bg: "from-gray-400 to-gray-500", text: "text-gray-600", icon: <Info className="h-5 w-5" /> }
    }
  }

  const commonList = HTTP_HEADERS.filter((h) => COMMON_HEADERS.includes(h.name))

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 h-[calc(100vh-4.2rem)] p-4 md:px-6 py-3">
      <div className="mx-auto">
        <div className="mb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HTTP 请求头大全
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
                            <span>通过搜索与类别筛选快速定位头信息</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                            <span>点击复制图标复制名称或示例到剪贴板</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5"></div>
                            <span>使用常用标签页快速查看高频请求头</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3 mt-2">
                        <h3 className="font-medium text-gray-800 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-500" />
                          请求头分类
                        </h3>
                        <div className="space-y-2">
                          {CATEGORIES.slice(1).map((category) => (
                            <div key={category} className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{category}</span>
                              <span className="font-medium text-gray-800">
                                {HTTP_HEADERS.filter((h) => h.category === category).length} 个
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </h1>
            </div>
            <Button onClick={() => navigate({ to: "/" })} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-2">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">筛选面板</CardTitle>
                <CardDescription>按类别与关键词筛选请求头</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="搜索名称、描述或示例"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" className="shrink-0"><Search className="h-4 w-4" /></Button>
                  </div>
                  <div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="选择类别" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedCategory("所有")}>全部</Badge>
                    <Badge variant="outline" className="cursor-pointer text-indigo-600" onClick={() => setSelectedCategory("通用头")}>通用</Badge>
                    <Badge variant="outline" className="cursor-pointer text-blue-600" onClick={() => setSelectedCategory("请求头")}>请求</Badge>
                    <Badge variant="outline" className="cursor-pointer text-green-600" onClick={() => setSelectedCategory("响应头")}>响应</Badge>
                    <Badge variant="outline" className="cursor-pointer text-orange-600" onClick={() => setSelectedCategory("实体头")}>实体</Badge>
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
                {filteredHeaders.length === 0 ? (
                  <Card className="mt-4">
                    <CardContent className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">未找到匹配的请求头</h3>
                      <p className="text-gray-500">尝试调整搜索词或选择其他类别</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 h-[700px] overflow-auto md:grid-cols-2 lg:grid-cols-6 gap-4 mt-4">
                    {filteredHeaders.map((header) => {
                      const style = getCategoryStyle(header.category)
                      return (
                        <Card key={header.name} className="border-gray-200 p-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`rounded-lg p-3 bg-gradient-to-br ${style.bg} shadow-sm`}>
                                <div className="text-white font-bold text-xl">{header.name}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(header.name)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Badge variant="outline" className={style.text}>{header.category}</Badge>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                {style.icon}
                                <span className="font-medium">说明</span>
                              </div>
                              <p className="text-gray-700 text-sm leading-relaxed">{header.description}</p>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-600 text-sm">示例</span>
                                <Button variant="outline" size="sm" onClick={() => copyToClipboard(header.example)}>
                                  <Copy className="h-4 w-4 mr-1" />复制示例
                                </Button>
                              </div>
                              <div className="mt-2 p-2 bg-gray-50 rounded border text-sm font-mono break-words">{header.example}</div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="common">
                <div className="grid grid-cols-1 h-[700px] overflow-auto md:grid-cols-2 lg:grid-cols-6 gap-4 mt-4">
                  {commonList.map((header) => {
                    const style = getCategoryStyle(header.category)
                    return (
                      <Card key={header.name} className="border-gray-200 p-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`rounded-lg p-3 bg-gradient-to-br ${style.bg} shadow-sm`}>
                              <div className="text-white font-bold text-xl">{header.name}</div>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">常用</Badge>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{header.description}</p>
                          <div className="mt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600 text-sm">示例</span>
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(header.example)}>
                                <Copy className="h-4 w-4 mr-1" />复制示例
                              </Button>
                            </div>
                            <div className="mt-2 p-2 bg-gray-50 rounded border text-sm font-mono break-words">{header.example}</div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
