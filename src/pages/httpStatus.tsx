import { ToolPage } from "@/components/tool-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Search, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/httpStatus")({
	component: HttpStatus,
});

interface HttpStatusCode {
	code: number;
	message: string;
	description: string;
	category: string;
	color: string;
}

const HTTP_STATUS_CODES: HttpStatusCode[] = [
	{
		code: 100,
		message: "Continue",
		description: "继续。客户端应继续其请求",
		category: "信息响应",
		color: "bg-blue-500",
	},
	{
		code: 101,
		message: "Switching Protocols",
		description: "切换协议。服务器根据客户端的请求切换协议",
		category: "信息响应",
		color: "bg-blue-500",
	},
	{
		code: 102,
		message: "Processing",
		description: "处理中。服务器收到并正在处理请求",
		category: "信息响应",
		color: "bg-blue-500",
	},
	{
		code: 200,
		message: "OK",
		description: "请求成功。一般用于GET与POST请求",
		category: "成功响应",
		color: "bg-green-500",
	},
	{
		code: 201,
		message: "Created",
		description: "已创建。成功请求并创建了新的资源",
		category: "成功响应",
		color: "bg-green-500",
	},
	{
		code: 204,
		message: "No Content",
		description: "无内容。服务器成功处理，但未返回内容",
		category: "成功响应",
		color: "bg-green-500",
	},
	{
		code: 301,
		message: "Moved Permanently",
		description: "永久移动。请求的资源已被永久移动到新位置",
		category: "重定向",
		color: "bg-yellow-500",
	},
	{
		code: 302,
		message: "Found",
		description: "临时移动。请求的资源临时从不同的URI响应请求",
		category: "重定向",
		color: "bg-yellow-500",
	},
	{
		code: 304,
		message: "Not Modified",
		description: "未修改。所请求的资源未修改",
		category: "重定向",
		color: "bg-yellow-500",
	},
	{
		code: 400,
		message: "Bad Request",
		description: "错误请求。服务器不理解请求的语法",
		category: "客户端错误",
		color: "bg-orange-500",
	},
	{
		code: 401,
		message: "Unauthorized",
		description: "未授权。请求要求用户的身份认证",
		category: "客户端错误",
		color: "bg-orange-500",
	},
	{
		code: 403,
		message: "Forbidden",
		description: "禁止。服务器理解请求但拒绝执行",
		category: "客户端错误",
		color: "bg-orange-500",
	},
	{
		code: 404,
		message: "Not Found",
		description: "未找到。服务器找不到请求的资源",
		category: "客户端错误",
		color: "bg-orange-500",
	},
	{
		code: 405,
		message: "Method Not Allowed",
		description: "方法禁用。禁用请求中指定的方法",
		category: "客户端错误",
		color: "bg-orange-500",
	},
	{
		code: 408,
		message: "Request Timeout",
		description: "请求超时。服务器等候请求时发生超时",
		category: "客户端错误",
		color: "bg-orange-500",
	},
	{
		code: 418,
		message: "I'm a teapot",
		description: "我是一个茶壶。超文本咖啡壶控制协议的笑话",
		category: "客户端错误",
		color: "bg-orange-500",
	},
	{
		code: 429,
		message: "Too Many Requests",
		description: "太多请求。用户在给定的时间内发送了太多的请求",
		category: "客户端错误",
		color: "bg-orange-500",
	},
	{
		code: 500,
		message: "Internal Server Error",
		description: "服务器内部错误。服务器遇到错误，无法完成请求",
		category: "服务器错误",
		color: "bg-red-500",
	},
	{
		code: 502,
		message: "Bad Gateway",
		description: "错误网关。服务器作为网关或代理，从上游服务器收到无效响应",
		category: "服务器错误",
		color: "bg-red-500",
	},
	{
		code: 503,
		message: "Service Unavailable",
		description: "服务不可用。服务器暂时无法处理请求",
		category: "服务器错误",
		color: "bg-red-500",
	},
	{
		code: 504,
		message: "Gateway Timeout",
		description: "网关超时。服务器作为网关或代理，没有及时从上游服务器收到请求",
		category: "服务器错误",
		color: "bg-red-500",
	},
];

const CATEGORIES = [
	"所有",
	"信息响应",
	"成功响应",
	"重定向",
	"客户端错误",
	"服务器错误",
];

function HttpStatus() {
	const { copy } = useCopy();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("所有");

	const filteredCodes = HTTP_STATUS_CODES.filter((status) => {
		const matchesSearch =
			searchTerm === "" ||
			status.code.toString().includes(searchTerm) ||
			status.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
			status.description.toLowerCase().includes(searchTerm.toLowerCase());
		const matchesCategory =
			selectedCategory === "所有" || status.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "信息响应":
				return "bg-blue-100 text-blue-800";
			case "成功响应":
				return "bg-green-100 text-green-800";
			case "重定向":
				return "bg-yellow-100 text-yellow-800";
			case "客户端错误":
				return "bg-orange-100 text-orange-800";
			case "服务器错误":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	return (
		<ToolPage
			title="HTTP 状态码"
			description="快速查询和了解 HTTP 状态码的含义与用途，提升开发调试效率。"
		>
			<div className="h-full flex flex-col gap-4">
				{/* 搜索和筛选 */}
				<div className="flex gap-3 flex-shrink-0">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
						<Input
							placeholder="搜索状态码、消息或描述..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10"
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
					<Select value={selectedCategory} onValueChange={setSelectedCategory}>
						<SelectTrigger className="w-36">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map((cat) => (
								<SelectItem key={cat} value={cat}>
									{cat}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* 快速筛选标签 */}
				<div className="flex flex-wrap gap-2 flex-shrink-0">
					{[
						{ label: "全部", value: "所有", color: "" },
						{
							label: "1xx",
							value: "信息响应",
							color: "text-blue-600 hover:bg-blue-50",
						},
						{
							label: "2xx",
							value: "成功响应",
							color: "text-green-600 hover:bg-green-50",
						},
						{
							label: "3xx",
							value: "重定向",
							color: "text-yellow-600 hover:bg-yellow-50",
						},
						{
							label: "4xx",
							value: "客户端错误",
							color: "text-orange-600 hover:bg-orange-50",
						},
						{
							label: "5xx",
							value: "服务器错误",
							color: "text-red-600 hover:bg-red-50",
						},
					].map((tag) => (
						<Badge
							key={tag.value}
							variant="outline"
							className={`cursor-pointer ${tag.color} ${selectedCategory === tag.value ? "bg-gray-100" : ""}`}
							onClick={() => setSelectedCategory(tag.value)}
						>
							{tag.label}
						</Badge>
					))}
					<span className="text-sm text-gray-500 ml-auto">
						找到 {filteredCodes.length} 个状态码
					</span>
				</div>

				{/* 状态码列表 */}
				<Tabs defaultValue="all" className="flex-1 min-h-0 flex flex-col">
					<TabsList className="w-fit flex-shrink-0">
						<TabsTrigger value="all">全部状态码</TabsTrigger>
						<TabsTrigger value="common">常用状态码</TabsTrigger>
					</TabsList>

					<TabsContent
						value="all"
						className="flex-1 min-h-0 overflow-y-auto mt-3"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{filteredCodes.map((status) => (
								<div
									key={status.code}
									className="border rounded-lg p-3 hover:shadow-md transition-shadow"
								>
									<div className="flex items-start justify-between mb-2">
										<span
											className={`${status.color} text-white font-bold text-lg px-2 py-1 rounded`}
										>
											{status.code}
										</span>
										<Button
											size="sm"
											variant="ghost"
											className="h-6 w-6 p-0"
											onClick={() => copy(String(status.code))}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
									<div className="font-semibold text-gray-800">
										{status.message}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										{status.description}
									</div>
									<Badge
										variant="outline"
										className={`mt-2 text-xs ${getCategoryColor(status.category)}`}
									>
										{status.category}
									</Badge>
								</div>
							))}
						</div>
					</TabsContent>

					<TabsContent
						value="common"
						className="flex-1 min-h-0 overflow-y-auto mt-3"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
							{HTTP_STATUS_CODES.filter((s) =>
								[200, 301, 302, 400, 401, 403, 404, 500, 502, 503].includes(
									s.code,
								),
							).map((status) => (
								<div
									key={status.code}
									className="border rounded-lg p-3 hover:shadow-md transition-shadow"
								>
									<div className="flex items-start justify-between mb-2">
										<span
											className={`${status.color} text-white font-bold text-lg px-2 py-1 rounded`}
										>
											{status.code}
										</span>
										<div className="flex gap-1">
											<Badge className="bg-yellow-100 text-yellow-800 text-[10px]">
												常用
											</Badge>
											<Button
												size="sm"
												variant="ghost"
												className="h-6 w-6 p-0"
												onClick={() => copy(String(status.code))}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
									</div>
									<div className="font-semibold text-gray-800">
										{status.message}
									</div>
									<div className="text-sm text-gray-600 mt-1">
										{status.description}
									</div>
								</div>
							))}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</ToolPage>
	);
}
