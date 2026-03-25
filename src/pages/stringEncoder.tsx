import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Copy, Info, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/stringEncoder")({
	component: StringEncoder,
});

type EncodeType = "url" | "html" | "base64" | "unicode";

function StringEncoder() {
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [results, setResults] = useState<
		Record<EncodeType, { encoded: string; decoded: string }>
	>({
		url: { encoded: "", decoded: "" },
		html: { encoded: "", decoded: "" },
		base64: { encoded: "", decoded: "" },
		unicode: { encoded: "", decoded: "" },
	});

	const encodeUrl = (str: string) => encodeURIComponent(str);
	const decodeUrl = (str: string) => {
		try {
			return decodeURIComponent(str);
		} catch {
			return "解码失败";
		}
	};

	const encodeHtml = (str: string) => {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#39;");
	};
	const decodeHtml = (str: string) => {
		return str
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)));
	};

	const encodeBase64 = (str: string) => {
		try {
			return btoa(unescape(encodeURIComponent(str)));
		} catch {
			return "编码失败";
		}
	};
	const decodeBase64 = (str: string) => {
		try {
			return decodeURIComponent(escape(atob(str)));
		} catch {
			return "解码失败";
		}
	};

	const encodeUnicode = (str: string) => {
		return Array.from(str)
			.map((c) => {
				const code = c.charCodeAt(0);
				if (code > 127) return `\\u${code.toString(16).padStart(4, "0")}`;
				return c;
			})
			.join("");
	};
	const decodeUnicode = (str: string) => {
		try {
			return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
				String.fromCharCode(parseInt(hex, 16)),
			);
		} catch {
			return "解码失败";
		}
	};

	const process = useCallback((value: string) => {
		if (!value) {
			setResults({
				url: { encoded: "", decoded: "" },
				html: { encoded: "", decoded: "" },
				base64: { encoded: "", decoded: "" },
				unicode: { encoded: "", decoded: "" },
			});
			return;
		}

		setResults({
			url: { encoded: encodeUrl(value), decoded: decodeUrl(value) },
			html: { encoded: encodeHtml(value), decoded: decodeHtml(value) },
			base64: { encoded: encodeBase64(value), decoded: decodeBase64(value) },
			unicode: { encoded: encodeUnicode(value), decoded: decodeUnicode(value) },
		});
	}, []);

	const handleInput = (value: string) => {
		setInput(value);
		process(value);
	};

	const copyValue = (value: string, name: string) => {
		if (!value) return;
		copyToClipboard(value);
		toast.success(`已复制 ${name}`);
	};

	const loadSample = () => {
		const sample = 'Hello World! 你好世界！<script>alert("test")</script>';
		handleInput(sample);
		toast.success("示例已加载");
	};

	const clear = () => {
		setInput("");
		process("");
	};

	const formats: {
		type: EncodeType;
		name: string;
		desc: string;
		example: string;
	}[] = [
		{
			type: "url",
			name: "URL 编码",
			desc: "用于 URL 参数",
			example: "hello%20world",
		},
		{
			type: "html",
			name: "HTML 实体",
			desc: "用于 HTML 内容",
			example: "&lt;div&gt;",
		},
		{
			type: "base64",
			name: "Base64",
			desc: "用于数据传输",
			example: "SGVsbG8=",
		},
		{
			type: "unicode",
			name: "Unicode",
			desc: "用于字符串转义",
			example: "\\u4f60\\u597d",
		},
	];

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-5xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							字符串编码器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										支持 URL 编码、HTML 实体、Base64、Unicode
										等多种编码格式的编码和解码。
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
						{/* 输入区域 */}
						<div className="flex-shrink-0 space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium text-gray-700">
									输入文本
								</span>
								<Button
									onClick={clear}
									variant="ghost"
									size="sm"
									className="h-7 text-xs"
									disabled={!input}
								>
									<RotateCcw className="h-3 w-3 mr-1" />
									清空
								</Button>
							</div>
							<Textarea
								value={input}
								onChange={(e) => handleInput(e.target.value)}
								placeholder="输入需要编码/解码的文本..."
								className="h-24 resize-none font-mono text-sm"
							/>
						</div>

						{/* 编码结果 */}
						<div className="flex-1 min-h-0 grid grid-cols-2 gap-3 overflow-y-auto">
							{formats.map((fmt) => (
								<div
									key={fmt.type}
									className="border rounded-lg overflow-hidden flex flex-col min-h-[140px]"
								>
									<div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-b flex-shrink-0">
										<div>
											<span className="text-sm font-semibold text-blue-700">
												{fmt.name}
											</span>
											<span className="text-xs text-blue-500 ml-2">
												{fmt.desc}
											</span>
										</div>
									</div>

									{/* 编码 */}
									<div className="flex-1 flex flex-col border-b">
										<div className="flex items-center justify-between px-3 py-1 bg-gray-50">
											<span className="text-xs text-gray-500 flex items-center gap-1">
												<ArrowRight className="h-3 w-3" />
												编码
											</span>
											<Button
												size="sm"
												variant="ghost"
												className="h-5 px-1.5"
												onClick={() =>
													copyValue(
														results[fmt.type].encoded,
														`${fmt.name} 编码`,
													)
												}
												disabled={!results[fmt.type].encoded}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
										<div className="flex-1 px-3 py-2 overflow-auto">
											{results[fmt.type].encoded ? (
												<code className="text-xs font-mono break-all text-gray-700">
													{results[fmt.type].encoded}
												</code>
											) : (
												<span className="text-xs text-gray-400">
													{fmt.example}
												</span>
											)}
										</div>
									</div>

									{/* 解码 */}
									<div className="flex-1 flex flex-col">
										<div className="flex items-center justify-between px-3 py-1 bg-gray-50">
											<span className="text-xs text-gray-500 flex items-center gap-1">
												<ArrowRight className="h-3 w-3 rotate-180" />
												解码
											</span>
											<Button
												size="sm"
												variant="ghost"
												className="h-5 px-1.5"
												onClick={() =>
													copyValue(
														results[fmt.type].decoded,
														`${fmt.name} 解码`,
													)
												}
												disabled={!results[fmt.type].decoded}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
										<div className="flex-1 px-3 py-2 overflow-auto">
											{results[fmt.type].decoded ? (
												<code className="text-xs font-mono break-all text-gray-700">
													{results[fmt.type].decoded}
												</code>
											) : (
												<span className="text-xs text-gray-400">
													{fmt.example}
												</span>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
