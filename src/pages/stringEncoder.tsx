import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClear, useCopy, useSample } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Copy, RotateCcw } from "lucide-react";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/stringEncoder")({
	component: StringEncoder,
});

type EncodeType = "url" | "html" | "base64" | "unicode";

const sampleData = 'Hello World! 你好世界！<script>alert("test")</script>';

function StringEncoder() {
	const { copy } = useCopy();
	const [input, setInput] = useState("");
	const [results, setResults] = useState<
		Record<EncodeType, { encoded: string; decoded: string }>
	>({
		url: { encoded: "", decoded: "" },
		html: { encoded: "", decoded: "" },
		base64: { encoded: "", decoded: "" },
		unicode: { encoded: "", decoded: "" },
	});

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
			url: {
				encoded: encodeURIComponent(value),
				decoded: (() => {
					try {
						return decodeURIComponent(value);
					} catch {
						return "解码失败";
					}
				})(),
			},
			html: {
				encoded: value
					.replace(/&/g, "&amp;")
					.replace(/</g, "&lt;")
					.replace(/>/g, "&gt;")
					.replace(/"/g, "&quot;")
					.replace(/'/g, "&#39;"),
				decoded: value
					.replace(/&amp;/g, "&")
					.replace(/&lt;/g, "<")
					.replace(/&gt;/g, ">")
					.replace(/&quot;/g, '"')
					.replace(/&#39;/g, "'"),
			},
			base64: {
				encoded: (() => {
					try {
						return btoa(unescape(encodeURIComponent(value)));
					} catch {
						return "编码失败";
					}
				})(),
				decoded: (() => {
					try {
						return decodeURIComponent(escape(atob(value)));
					} catch {
						return "解码失败";
					}
				})(),
			},
			unicode: {
				encoded: Array.from(value)
					.map((c) => {
						const code = c.charCodeAt(0);
						return code > 127 ? `\\u${code.toString(16).padStart(4, "0")}` : c;
					})
					.join(""),
				decoded: value.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
					String.fromCharCode(parseInt(hex, 16)),
				),
			},
		});
	}, []);

	const { loadSample } = useSample((data: string) => {
		setInput(data);
		process(data);
	}, sampleData);
	const { clear } = useClear(() => {
		setInput("");
		process("");
	});

	const formats = [
		{ type: "url" as EncodeType, name: "URL 编码", desc: "用于 URL 参数" },
		{ type: "html" as EncodeType, name: "HTML 实体", desc: "用于 HTML 内容" },
		{ type: "base64" as EncodeType, name: "Base64", desc: "用于数据传输" },
		{ type: "unicode" as EncodeType, name: "Unicode", desc: "用于字符串转义" },
	];

	return (
		<ToolPage
			title="字符串编码器"
			description="支持 URL 编码、HTML 实体、Base64、Unicode 等多种编码格式的编码和解码。"
			actions={
				<>
					<Button onClick={loadSample} variant="outline" size="sm">
						示例
					</Button>
					<Button onClick={clear} variant="ghost" size="sm" disabled={!input}>
						<RotateCcw className="h-3 w-3 mr-1" />
						清空
					</Button>
				</>
			}
		>
			<div className="h-full flex flex-col gap-4">
				<div className="flex-shrink-0 space-y-2">
					<span className="text-sm font-medium text-gray-700">输入文本</span>
					<Textarea
						value={input}
						onChange={(e) => process(e.target.value)}
						placeholder="输入需要编码/解码的文本..."
						className="h-20 resize-none font-mono text-sm"
					/>
				</div>
				<div className="flex-1 min-h-0 grid grid-cols-2 gap-3 overflow-y-auto">
					{formats.map((fmt) => (
						<div
							key={fmt.type}
							className="border rounded-lg overflow-hidden flex flex-col"
						>
							<div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-50 to-blue-100 border-b">
								<div>
									<span className="text-sm font-semibold text-blue-700">
										{fmt.name}
									</span>
									<span className="text-xs text-blue-500 ml-2">{fmt.desc}</span>
								</div>
							</div>
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
											copy(results[fmt.type].encoded, `${fmt.name} 编码`)
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
										<span className="text-xs text-gray-400">编码结果</span>
									)}
								</div>
							</div>
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
											copy(results[fmt.type].decoded, `${fmt.name} 解码`)
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
										<span className="text-xs text-gray-400">解码结果</span>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</ToolPage>
	);
}
