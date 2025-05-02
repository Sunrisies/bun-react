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

export const Route = createFileRoute("/httpHeaders")({
  component: HttpHeaders,
});

interface HttpHeader {
  name: string;
  description: string;
  example: string;
  category: "通用头" | "请求头" | "响应头" | "实体头";
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
];

function HttpHeaders() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHeaders = HTTP_HEADERS.filter(header => 
    header.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    header.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    header.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "通用头": return "text-purple-500";
      case "请求头": return "text-blue-500";
      case "响应头": return "text-green-500";
      case "实体头": return "text-orange-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>HTTP 请求头查询</CardTitle>
            <Button onClick={() => navigate({ to: "/" })} variant="ghost">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 搜索栏 */}
            <div className="flex gap-2">
              <Input
                placeholder="搜索请求头名称、描述或类别..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* 请求头表格 */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">名称</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>示例</TableHead>
                    <TableHead className="w-[100px]">类别</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHeaders.map((header) => (
                    <TableRow key={header.name}>
                      <TableCell className="font-mono font-medium">
                        {header.name}
                      </TableCell>
                      <TableCell>{header.description}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {header.example}
                      </TableCell>
                      <TableCell className={getCategoryColor(header.category)}>
                        {header.category}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                提示：HTTP 头信息是客户端和服务器端交换数据的重要方式。通过搜索框可以快速查找特定的头信息及其用途。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}