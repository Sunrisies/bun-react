import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Info, Link } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/urlParser")({
	component: UrlParser,
});

function UrlParser() {
	const navigate = useNavigate();
	const [url, setUrl] = useState("");

	const parsed = useMemo(() => {
		if (!url.trim()) return null;

		try {
			let urlObj: URL;
			try {
				urlObj = new URL(url);
			} catch {
				urlObj = new URL(`https://${url}`);
			}

			const params: Record<string, string[]> = {};
			urlObj.searchParams.forEach((value, key) => {
				if (!params[key]) params[key] = [];
				params[key].push(value);
			});

			return {
				protocol: urlObj.protocol.replace(":", ""),
				hostname: urlObj.hostname,
				port:
					urlObj.port ||
					(urlObj.protocol === "https:"
						? "443"
						: urlObj.protocol === "http:"
							? "80"
							: ""),
				pathname: urlObj.pathname,
				search: urlObj.search,
				hash: urlObj.hash,
				host: urlObj.host,
				origin: urlObj.origin,
				href: urlObj.href,
				params,
				username: urlObj.username,
				password: urlObj.password,
			};
		} catch {
			return null;
		}
	}, [url]);

	const copyValue = (value: string, name: string) => {
		if (!value) return;
		copyToClipboard(value);
		toast.success(`已复制 ${name}`);
	};

	const loadSample = () => {
		setUrl(
			"https://user:pass@example.com:8080/path/to/page?name=value&foo=bar#section",
		);
	};

	const parts = [
		{ label: "协议 (Protocol)", key: "protocol", example: "https" },
		{ label: "主机名 (Hostname)", key: "hostname", example: "example.com" },
		{ label: "端口 (Port)", key: "port", example: "8080" },
		{ label: "路径 (Path)", key: "pathname", example: "/path/to/page" },
		{ label: "查询 (Query)", key: "search", example: "?name=value" },
		{ label: "哈希 (Hash)", key: "hash", example: "#section" },
		{ label: "主机 (Host)", key: "host", example: "example.com:8080" },
		{
			label: "来源 (Origin)",
			key: "origin",
			example: "https://example.com:8080",
		},
	];

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full  mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							URL 解析器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										解析 URL 的各个组成部分，包括协议、主机、路径、查询参数等。
									</div>
								</div>
							</div>
						</CardTitle>
						<div className="flex gap-2">
							<Button onClick={loadSample} variant="outline" size="sm">
								示例
							</Button>
							<Button
								onClick={() => navigate({ to: "/" })}
								variant="ghost"
								size="sm"
							>
								<ArrowLeft className="h-4 w-4 mr-1" />
								返回
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex-1 min-h-0 p-4 overflow-hidden">
					<div className="h-full flex flex-col gap-4">
						{/* 输入 */}
						<div className="flex gap-2 flex-shrink-0">
							<Input
								value={url}
								onChange={(e) => setUrl(e.target.value)}
								placeholder="输入 URL，如 https://example.com/path?query=value"
								className="flex-1 font-mono"
							/>
						</div>

						{/* 结果 */}
						{parsed ? (
							<div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
								{/* 左侧：URL 各部分 */}
								<div className="flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
									{parts.map((part) => {
										const value = parsed[
											part.key as keyof typeof parsed
										] as string;
										return (
											<div
												key={part.key}
												className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group"
											>
												<div className="min-w-0 flex-1">
													<div className="text-xs text-gray-500">
														{part.label}
													</div>
													<div className="font-mono text-sm truncate">
														{value || <span className="text-gray-400">空</span>}
													</div>
												</div>
												<Button
													size="sm"
													variant="ghost"
													className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
													onClick={() => copyValue(value, part.label)}
													disabled={!value}
												>
													<Copy className="h-3 w-3" />
												</Button>
											</div>
										);
									})}
								</div>

								{/* 右侧：查询参数 */}
								<div className="flex flex-col min-h-0 border rounded-lg">
									<div className="px-3 py-2 bg-gray-50 border-b flex-shrink-0">
										<span className="text-sm font-medium">
											查询参数 (Query Params)
										</span>
									</div>
									<div className="flex-1 min-h-0 overflow-y-auto p-2">
										{Object.keys(parsed.params).length > 0 ? (
											<div className="space-y-2">
												{Object.entries(parsed.params).map(([key, values]) => (
													<div key={key} className="bg-gray-50 rounded p-2">
														<div className="text-xs text-blue-600 font-medium">
															{key}
														</div>
														{values.map((v, i) => (
															<div
																key={i}
																className="font-mono text-xs text-gray-700 mt-1"
															>
																{v}
															</div>
														))}
													</div>
												))}
											</div>
										) : (
											<div className="text-center text-gray-400 text-sm py-4">
												无查询参数
											</div>
										)}
									</div>
								</div>
							</div>
						) : (
							<div className="flex-1 flex items-center justify-center text-gray-400">
								<div className="text-center">
									<Link className="h-12 w-12 mx-auto mb-3 opacity-30" />
									<p>输入 URL 进行解析</p>
								</div>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
