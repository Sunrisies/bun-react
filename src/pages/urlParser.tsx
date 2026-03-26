import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Link } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/urlParser")({
	component: UrlParser,
});

function UrlParser() {
	const { copy } = useCopy();
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
				params,
			};
		} catch {
			return null;
		}
	}, [url]);

	const loadSample = () => {
		setUrl(
			"https://user:pass@example.com:8080/path/to/page?name=value&foo=bar#section",
		);
		toast.success("示例已加载");
	};

	const parts = [
		{ label: "协议 (Protocol)", key: "protocol" },
		{ label: "主机名 (Hostname)", key: "hostname" },
		{ label: "端口 (Port)", key: "port" },
		{ label: "路径 (Path)", key: "pathname" },
		{ label: "查询 (Query)", key: "search" },
		{ label: "哈希 (Hash)", key: "hash" },
		{ label: "主机 (Host)", key: "host" },
		{ label: "来源 (Origin)", key: "origin" },
	];

	return (
		<ToolPage
			title="URL 解析器"
			description="解析 URL 的各个组成部分，包括协议、主机、路径、查询参数等。"
			actions={
				<Button onClick={loadSample} variant="outline" size="sm">
					示例
				</Button>
			}
		>
			<div className="h-full flex flex-col gap-4">
				<div className="flex gap-2 flex-shrink-0">
					<Input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="输入 URL，如 https://example.com/path?query=value"
						className="flex-1 font-mono"
					/>
				</div>

				{parsed ? (
					<div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
							{parts.map((part) => {
								const value = parsed[part.key as keyof typeof parsed] as string;
								return (
									<div
										key={part.key}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group"
									>
										<div className="min-w-0 flex-1">
											<div className="text-xs text-gray-500">{part.label}</div>
											<div className="font-mono text-sm truncate">
												{value || <span className="text-gray-400">空</span>}
											</div>
										</div>
										<Button
											size="sm"
											variant="ghost"
											className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
											onClick={() => copy(value, part.label)}
											disabled={!value}
										>
											<Copy className="h-3 w-3" />
										</Button>
									</div>
								);
							})}
						</div>

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
		</ToolPage>
	);
}
