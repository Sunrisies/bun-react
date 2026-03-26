import { BackButton } from "@/components/BackButton";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/jwtDecoder")({
	component: JwtDecoder,
});

interface JwtParts {
	header: Record<string, unknown>;
	payload: Record<string, unknown>;
	signature: string;
}

function base64UrlDecode(str: string): string {
	let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	const padding = base64.length % 4;
	if (padding) base64 += "=".repeat(4 - padding);
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return new TextDecoder("utf-8").decode(bytes);
}

function decodeJwt(token: string): JwtParts {
	const parts = token.split(".");
	if (parts.length !== 3) throw new Error("无效的 JWT 格式");
	const header = JSON.parse(base64UrlDecode(parts[0]));
	const payload = JSON.parse(base64UrlDecode(parts[1]));
	return { header, payload, signature: parts[2] };
}

function formatTimestamp(ts: number): string {
	try {
		return new Date(ts * 1000).toLocaleString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: false,
		});
	} catch {
		return String(ts);
	}
}

const sampleJwt =
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8oOS4uSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

function JwtDecoder() {
	const { copy } = useCopy();
	const [input, setInput] = useState("");
	const [decoded, setDecoded] = useState<JwtParts | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleDecode = () => {
		if (!input.trim()) {
			setDecoded(null);
			setError(null);
			return;
		}
		try {
			setDecoded(decodeJwt(input.trim()));
			setError(null);
		} catch (err) {
			setDecoded(null);
			setError(err instanceof Error ? err.message : "解码失败");
		}
	};

	const loadSample = () => {
		setInput(sampleJwt);
		toast.success("示例 JWT 已加载");
	};

	const copyValue = (value: unknown) => {
		copy(
			typeof value === "object"
				? JSON.stringify(value, null, 2)
				: String(value),
		);
	};

	const standardFields = [
		{ key: "alg", label: "算法(alg)" },
		{ key: "typ", label: "类型(typ)" },
		{ key: "iss", label: "签发人(iss)" },
		{ key: "sub", label: "主题(sub)" },
		{ key: "aud", label: "受众(aud)" },
		{ key: "exp", label: "过期时间(exp)" },
		{ key: "nbf", label: "生效时间(nbf)" },
		{ key: "iat", label: "签发时间(iat)" },
		{ key: "jti", label: "编号(jti)" },
	];

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-5xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							JWT 解码器
							<InfoTooltip content="仅解密 HEADER 和 PAYLOAD，不会对签名进行校验。" />
						</CardTitle>
						<BackButton />
					</div>
				</CardHeader>
				<CardContent className="flex-1 min-h-0 p-4">
					<div className="h-full grid grid-cols-2 gap-4">
						{/* 左侧：输入 */}
						<div className="flex flex-col gap-3">
							<div className="flex gap-3 items-start">
								<Textarea
									value={input}
									onChange={(e) => {
										setInput(e.target.value);
										setError(null);
									}}
									placeholder="粘贴 JWT Token..."
									className="flex-1 h-20 font-mono text-xs resize-none"
								/>
								<div className="flex flex-col gap-2">
									<Button onClick={handleDecode} size="sm" className="w-20">
										解码
									</Button>
									<Button
										onClick={loadSample}
										variant="outline"
										size="sm"
										className="w-20"
									>
										示例
									</Button>
								</div>
							</div>
							{error && (
								<div className="p-2 bg-red-50 rounded-lg border border-red-200">
									<p className="text-xs text-red-600">{error}</p>
								</div>
							)}
							<div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
								{/* Header */}
								<div className="border rounded-lg overflow-hidden flex flex-col">
									<div className="flex items-center justify-between px-3 py-1.5 bg-red-50 border-b">
										<span className="font-semibold text-xs text-red-700">
											HEADER
										</span>
										<Button
											size="sm"
											variant="ghost"
											className="h-6 px-2"
											onClick={() => copyValue(decoded?.header)}
										>
											<span className="text-xs">复制</span>
										</Button>
									</div>
									<pre className="p-3 text-xs font-mono bg-white overflow-auto flex-1">
										{decoded ? JSON.stringify(decoded.header, null, 2) : ""}
									</pre>
								</div>
								{/* Payload */}
								<div className="border rounded-lg overflow-hidden flex flex-col">
									<div className="flex items-center justify-between px-3 py-1.5 bg-purple-50 border-b">
										<span className="font-semibold text-xs text-purple-700">
											PAYLOAD
										</span>
										<Button
											size="sm"
											variant="ghost"
											className="h-6 px-2"
											onClick={() => copyValue(decoded?.payload)}
										>
											<span className="text-xs">复制</span>
										</Button>
									</div>
									<pre className="p-3 text-xs font-mono bg-white overflow-auto flex-1">
										{decoded ? JSON.stringify(decoded.payload, null, 2) : ""}
									</pre>
								</div>
							</div>
							{/* Signature */}
							{decoded && (
								<div className="border rounded-lg overflow-hidden">
									<div className="flex items-center justify-between px-3 py-1.5 bg-blue-50 border-b">
										<span className="font-semibold text-xs text-blue-700">
											SIGNATURE
										</span>
										<Button
											size="sm"
											variant="ghost"
											className="h-6 px-2"
											onClick={() => copy(decoded.signature)}
										>
											<span className="text-xs">复制</span>
										</Button>
									</div>
									<pre className="p-3 text-xs font-mono bg-white break-all max-h-16 overflow-auto">
										{decoded.signature}
									</pre>
								</div>
							)}
						</div>

						{/* 右侧：标准字段解析 */}
						<div className="border rounded-lg overflow-hidden flex flex-col">
							<div className="px-3 py-2 bg-gray-50 border-b">
								<span className="font-semibold text-sm text-gray-700">
									标准字段
								</span>
							</div>
							<div className="flex-1 overflow-y-auto">
								<table className="w-full text-xs">
									<tbody>
										{standardFields.map((field) => {
											const value =
												decoded?.header[field.key] ??
												decoded?.payload[field.key];
											if (value === undefined) return null;
											let displayValue = String(value);
											if (
												(field.key === "exp" ||
													field.key === "nbf" ||
													field.key === "iat") &&
												typeof value === "number"
											) {
												displayValue = formatTimestamp(value);
												if (field.key === "exp" && value * 1000 < Date.now())
													displayValue += " (已过期)";
											}
											return (
												<tr
													key={field.key}
													className="border-b hover:bg-gray-50"
												>
													<td className="px-3 py-2 text-gray-500 w-28 border-r bg-gray-50">
														{field.label}
													</td>
													<td className="px-3 py-2 font-mono break-all">
														{displayValue}
													</td>
												</tr>
											);
										})}
										{decoded &&
											Object.entries(decoded.payload).map(([key, value]) => {
												if (standardFields.some((f) => f.key === key))
													return null;
												return (
													<tr key={key} className="border-b hover:bg-gray-50">
														<td className="px-3 py-2 text-gray-500 w-28 border-r bg-gray-50">
															{key}
														</td>
														<td className="px-3 py-2 font-mono break-all">
															{typeof value === "object"
																? JSON.stringify(value)
																: String(value)}
														</td>
													</tr>
												);
											})}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
