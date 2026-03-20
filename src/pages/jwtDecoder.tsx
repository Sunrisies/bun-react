import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Info } from "lucide-react";
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
	if (padding) {
		base64 += "=".repeat(4 - padding);
	}

	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder("utf-8").decode(bytes);
}

function decodeJwt(token: string): JwtParts {
	const parts = token.split(".");
	if (parts.length !== 3) {
		throw new Error("无效的 JWT 格式");
	}

	const headerRaw = base64UrlDecode(parts[0]);
	const payloadRaw = base64UrlDecode(parts[1]);
	const signature = parts[2];

	let header: Record<string, unknown>;
	let payload: Record<string, unknown>;

	try {
		header = JSON.parse(headerRaw);
	} catch {
		throw new Error("Header JSON 解析失败");
	}

	try {
		payload = JSON.parse(payloadRaw);
	} catch {
		throw new Error("Payload JSON 解析失败");
	}

	return { header, payload, signature };
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

function JwtDecoder() {
	const navigate = useNavigate();
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
		setInput(
			"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8oOS4uSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
		);
		toast.success("示例 JWT 已加载");
	};

	const copyValue = (value: unknown) => {
		const text =
			typeof value === "object"
				? JSON.stringify(value, null, 2)
				: String(value);
		copyToClipboard(text);
	};

	const standardFields: { key: string; label: string }[] = [
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
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg">
										<p className="text-xs text-blue-600">
											仅解密 HEADER 和 PAYLOAD，不会对签名进行校验。
										</p>
									</div>
								</div>
							</div>
						</CardTitle>
						<Button
							onClick={() => navigate({ to: "/" })}
							variant="ghost"
							size="sm"
						>
							<ArrowLeft className="h-4 w-4 mr-1" />
							返回
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex-1 min-h-0 p-4">
					<div className="h-full flex flex-col gap-4">
						{/* 输入区域 - 固定高度 */}
						<div className="flex gap-3 h-20 flex-shrink-0">
							<Textarea
								placeholder="粘贴 JWT Token..."
								value={input}
								onChange={(e) => {
									setInput(e.target.value);
									setError(null);
								}}
								className="flex-1 h-full font-mono text-xs resize-none"
							/>
							<div className="flex flex-col gap-2 w-20">
								<Button onClick={handleDecode} size="sm" className="flex-1">
									解码
								</Button>
								<Button
									onClick={loadSample}
									variant="outline"
									size="sm"
									className="flex-1"
								>
									示例
								</Button>
							</div>
						</div>

						{/* 错误提示 */}
						{error && (
							<div className="p-2 bg-red-50 rounded-lg border border-red-200 flex-shrink-0">
								<p className="text-xs text-red-600">{error}</p>
							</div>
						)}

						{/* 结果区域 - 占满剩余空间 */}
						<div className="flex-1 min-h-0">
							{!decoded ? (
								<div className="h-full flex items-center justify-center text-gray-400 text-sm border rounded-lg bg-gray-50">
									解码结果将显示在这里
								</div>
							) : (
								<div className="h-full grid grid-cols-2 gap-4">
									{/* 左侧：三部分解码 */}
									<div className="flex flex-col gap-3 min-h-0">
										{/* HEADER */}
										<div className="border rounded-lg overflow-hidden h-28 flex flex-col">
											<div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 border-b flex-shrink-0">
												<span className="font-semibold text-sm text-red-700">
													HEADER
												</span>
												<Button
													size="sm"
													variant="ghost"
													className="h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
													onClick={() => copyValue(decoded.header)}
												>
													<Copy className="h-3 w-3 mr-1" />
													<span className="text-xs">复制</span>
												</Button>
											</div>
											<pre className="p-3 text-xs font-mono bg-white overflow-auto flex-1">
												{JSON.stringify(decoded.header, null, 2)}
											</pre>
										</div>

										{/* PAYLOAD */}
										<div className="border rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col">
											<div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 border-b flex-shrink-0">
												<span className="font-semibold text-sm text-purple-700">
													PAYLOAD
												</span>
												<Button
													size="sm"
													variant="ghost"
													className="h-6 px-2 text-purple-600 hover:text-purple-700 hover:bg-purple-100"
													onClick={() => copyValue(decoded.payload)}
												>
													<Copy className="h-3 w-3 mr-1" />
													<span className="text-xs">复制</span>
												</Button>
											</div>
											<pre className="p-3 text-xs font-mono bg-white overflow-auto flex-1">
												{JSON.stringify(decoded.payload, null, 2)}
											</pre>
										</div>

										{/* SIGNATURE */}
										<div className="border rounded-lg overflow-hidden h-20 flex flex-col">
											<div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 border-b flex-shrink-0">
												<span className="font-semibold text-sm text-blue-700">
													SIGNATURE
												</span>
												<Button
													size="sm"
													variant="ghost"
													className="h-6 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100"
													onClick={() => copyToClipboard(decoded.signature)}
												>
													<Copy className="h-3 w-3 mr-1" />
													<span className="text-xs">复制</span>
												</Button>
											</div>
											<pre className="p-3 text-xs font-mono bg-white break-all overflow-auto flex-1">
												{decoded.signature}
											</pre>
										</div>
									</div>

									{/* 右侧：标准字段解析 */}
									<div className="border rounded-lg overflow-hidden flex flex-col">
										<div className="px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b flex-shrink-0">
											<span className="font-semibold text-sm text-gray-700">
												头和标准载荷
											</span>
										</div>
										<div className="flex-1 overflow-y-auto">
											<table className="w-full text-xs">
												<tbody>
													{standardFields.map((field) => {
														const headerValue = decoded.header[field.key];
														const payloadValue = decoded.payload[field.key];
														const value =
															headerValue !== undefined
																? headerValue
																: payloadValue;

														if (value === undefined) return null;

														let displayValue = String(value);
														if (
															field.key === "exp" ||
															field.key === "nbf" ||
															field.key === "iat"
														) {
															displayValue = formatTimestamp(value as number);
															if (
																field.key === "exp" &&
																(value as number) * 1000 < Date.now()
															) {
																displayValue += " (已过期)";
															}
														}

														return (
															<tr
																key={field.key}
																className="border-b last:border-b-0 hover:bg-gray-50"
															>
																<td className="px-3 py-2 text-gray-500 w-28 flex-shrink-0 border-r bg-gray-50">
																	{field.label}
																</td>
																<td className="px-3 py-2 font-mono break-all">
																	{field.key === "exp" &&
																	(value as number) * 1000 < Date.now() ? (
																		<span className="text-red-600">
																			{displayValue}
																		</span>
																	) : (
																		displayValue
																	)}
																</td>
															</tr>
														);
													})}
													{/* 其他非标准字段 */}
													{Object.entries(decoded.payload).map(
														([key, value]) => {
															const isStandard = standardFields.some(
																(f) => f.key === key,
															);
															if (isStandard) return null;

															const displayValue =
																typeof value === "object"
																	? JSON.stringify(value)
																	: String(value);

															return (
																<tr
																	key={key}
																	className="border-b last:border-b-0 hover:bg-gray-50"
																>
																	<td className="px-3 py-2 text-gray-500 w-28 flex-shrink-0 border-r bg-gray-50">
																		{key}
																	</td>
																	<td className="px-3 py-2 font-mono break-all">
																		{displayValue}
																	</td>
																</tr>
															);
														},
													)}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
