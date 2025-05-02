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

export const Route = createFileRoute("/httpStatus")({
  component: HttpStatus,
});

interface HttpStatusCode {
  code: number;
  message: string;
  description: string;
  category: string;
}

const HTTP_STATUS_CODES: HttpStatusCode[] = [
  // 1xx 信息响应
  { code: 100, message: "Continue", description: "继续。客户端应继续其请求", category: "信息响应" },
  { code: 101, message: "Switching Protocols", description: "切换协议。服务器根据客户端的请求切换协议", category: "信息响应" },
  { code: 102, message: "Processing", description: "处理中。服务器收到并正在处理请求，但无响应可用", category: "信息响应" },
  { code: 103, message: "Early Hints", description: "早期提示。用来在最终的HTTP消息之前返回一些响应头", category: "信息响应" },
  
  // 2xx 成功响应
  { code: 200, message: "OK", description: "请求成功。一般用于GET与POST请求", category: "成功响应" },
  { code: 201, message: "Created", description: "已创建。成功请求并创建了新的资源", category: "成功响应" },
  { code: 202, message: "Accepted", description: "已接受。已经接受请求，但未处理完成", category: "成功响应" },
  { code: 203, message: "Non-Authoritative Information", description: "非授权信息。请求成功，但返回的信息可能来自另一来源", category: "成功响应" },
  { code: 204, message: "No Content", description: "无内容。服务器成功处理，但未返回内容", category: "成功响应" },
  { code: 205, message: "Reset Content", description: "重置内容。服务器处理成功，用户终端应重置文档视图", category: "成功响应" },
  { code: 206, message: "Partial Content", description: "部分内容。服务器成功处理了部分GET请求", category: "成功响应" },
  { code: 207, message: "Multi-Status", description: "多状态。消息体中可能存在多个状态码", category: "成功响应" },
  { code: 208, message: "Already Reported", description: "已报告。DAV绑定的成员已在（多状态）响应之前的部分被列出", category: "成功响应" },
  
  // 3xx 重定向
  { code: 300, message: "Multiple Choices", description: "多种选择。请求的资源可包括多个位置", category: "重定向" },
  { code: 301, message: "Moved Permanently", description: "永久移动。请求的资源已被永久移动到新位置", category: "重定向" },
  { code: 302, message: "Found", description: "临时移动。请求的资源临时从不同的URI响应请求", category: "重定向" },
  { code: 303, message: "See Other", description: "查看其它。使用GET方法定向到另一个URL", category: "重定向" },
  { code: 304, message: "Not Modified", description: "未修改。所请求的资源未修改，服务器返回此状态码时，不会返回任何资源", category: "重定向" },
  { code: 305, message: "Use Proxy", description: "使用代理。所请求的资源必须通过代理访问", category: "重定向" },
  { code: 307, message: "Temporary Redirect", description: "临时重定向。与302类似，但不允许更改请求方法", category: "重定向" },
  { code: 308, message: "Permanent Redirect", description: "永久重定向。与301类似，但不允许更改请求方法", category: "重定向" },
  
  // 4xx 客户端错误
  { code: 400, message: "Bad Request", description: "错误请求。服务器不理解请求的语法", category: "客户端错误" },
  { code: 401, message: "Unauthorized", description: "未授权。请求要求用户的身份认证", category: "客户端错误" },
  { code: 402, message: "Payment Required", description: "需要付款。预留状态码", category: "客户端错误" },
  { code: 403, message: "Forbidden", description: "禁止。服务器理解请求但拒绝执行", category: "客户端错误" },
  { code: 404, message: "Not Found", description: "未找到。服务器找不到请求的资源", category: "客户端错误" },
  { code: 405, message: "Method Not Allowed", description: "方法禁用。禁用请求中指定的方法", category: "客户端错误" },
  { code: 406, message: "Not Acceptable", description: "不接受。无法使用请求的内容特性响应请求的网页", category: "客户端错误" },
  { code: 407, message: "Proxy Authentication Required", description: "需要代理授权。客户端必须先使用代理服务器进行验证", category: "客户端错误" },
  { code: 408, message: "Request Timeout", description: "请求超时。服务器等候请求时发生超时", category: "客户端错误" },
  { code: 409, message: "Conflict", description: "冲突。服务器在完成请求时发生冲突", category: "客户端错误" },
  { code: 410, message: "Gone", description: "已删除。请求的资源永久删除", category: "客户端错误" },
  { code: 411, message: "Length Required", description: "需要有效长度。服务器拒绝在没有定义Content-Length头的情况下处理请求", category: "客户端错误" },
  { code: 412, message: "Precondition Failed", description: "未满足前提条件。服务器未满足请求者在请求中设置的其中一个前提条件", category: "客户端错误" },
  { code: 413, message: "Payload Too Large", description: "请求实体过大。服务器无法处理请求，因为请求实体过大", category: "客户端错误" },
  { code: 414, message: "URI Too Long", description: "请求的URI过长。服务器无法处理请求，因为URI过长", category: "客户端错误" },
  { code: 415, message: "Unsupported Media Type", description: "不支持的媒体类型。服务器无法处理请求附带的媒体格式", category: "客户端错误" },
  { code: 416, message: "Range Not Satisfiable", description: "请求范围不符合要求。客户端请求的范围无效", category: "客户端错误" },
  { code: 417, message: "Expectation Failed", description: "未满足期望值。服务器无法满足Expect的请求头信息", category: "客户端错误" },
  { code: 418, message: "I'm a teapot", description: "我是一个茶壶。超文本咖啡壶控制协议的笑话", category: "客户端错误" },
  { code: 421, message: "Misdirected Request", description: "误导请求。服务器无法产生响应", category: "客户端错误" },
  { code: 422, message: "Unprocessable Entity", description: "无法处理的实体。请求格式正确，但含有语义错误", category: "客户端错误" },
  { code: 423, message: "Locked", description: "已锁定。当前资源被锁定", category: "客户端错误" },
  { code: 424, message: "Failed Dependency", description: "依赖关系失败。由于之前的某个请求发生错误，导致当前请求失败", category: "客户端错误" },
  { code: 426, message: "Upgrade Required", description: "需要升级。客户端应当切换到TLS/1.0", category: "客户端错误" },
  { code: 428, message: "Precondition Required", description: "要求先决条件。服务器要求有条件的请求", category: "客户端错误" },
  { code: 429, message: "Too Many Requests", description: "太多请求。用户在给定的时间内发送了太多的请求", category: "客户端错误" },
  { code: 431, message: "Request Header Fields Too Large", description: "请求头字段太大。服务器不愿处理请求，因为它的头字段太大", category: "客户端错误" },
  { code: 451, message: "Unavailable For Legal Reasons", description: "因法律原因不可用。该请求因法律原因不可用", category: "客户端错误" },
  
  // 5xx 服务器错误
  { code: 500, message: "Internal Server Error", description: "服务器内部错误。服务器遇到错误，无法完成请求", category: "服务器错误" },
  { code: 501, message: "Not Implemented", description: "尚未实施。服务器不具备完成请求的功能", category: "服务器错误" },
  { code: 502, message: "Bad Gateway", description: "错误网关。服务器作为网关或代理，从上游服务器收到无效响应", category: "服务器错误" },
  { code: 503, message: "Service Unavailable", description: "服务不可用。服务器暂时无法处理请求", category: "服务器错误" },
  { code: 504, message: "Gateway Timeout", description: "网关超时。服务器作为网关或代理，但是没有及时从上游服务器收到请求", category: "服务器错误" },
  { code: 505, message: "HTTP Version Not Supported", description: "HTTP版本不受支持。服务器不支持请求中所用的HTTP协议版本", category: "服务器错误" },
  { code: 506, message: "Variant Also Negotiates", description: "服务器存在内部配置错误", category: "服务器错误" },
  { code: 507, message: "Insufficient Storage", description: "存储空间不足。服务器无法存储完成请求所必须的内容", category: "服务器错误" },
  { code: 508, message: "Loop Detected", description: "检测到循环。服务器在处理请求时检测到无限循环", category: "服务器错误" },
  { code: 510, message: "Not Extended", description: "未扩展。获取资源所需要的策略并没有被满足", category: "服务器错误" },
  { code: 511, message: "Network Authentication Required", description: "要求网络认证。客户端需要进行身份验证才能获得网络访问权限", category: "服务器错误" }
];

function HttpStatus() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCodes = HTTP_STATUS_CODES.filter(status => 
    status.code.toString().includes(searchTerm) ||
    status.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    status.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (code: number): string => {
    if (code >= 500) return "text-red-500";
    if (code >= 400) return "text-orange-500";
    if (code >= 300) return "text-yellow-500";
    if (code >= 200) return "text-green-500";
    return "text-blue-500";
  };

  return (
    <div className="flex h-full items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-[90%] overflow-hidden">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>HTTP 状态码查询</CardTitle>
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
                placeholder="搜索状态码、描述或类别..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* 状态码表格 */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">状态码</TableHead>
                    <TableHead className="w-[150px]">消息</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead className="w-[120px]">类别</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCodes.map((status) => (
                    <TableRow key={status.code}>
                      <TableCell className={getStatusColor(status.code)}>
                        {status.code}
                      </TableCell>
                      <TableCell className="font-mono">{status.message}</TableCell>
                      <TableCell>{status.description}</TableCell>
                      <TableCell>{status.category}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 提示信息 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600">
                提示：HTTP状态码是服务器对浏览器请求的响应码。不同的状态码表示不同的响应状态，可以通过搜索框快速查找特定的状态码或描述。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}