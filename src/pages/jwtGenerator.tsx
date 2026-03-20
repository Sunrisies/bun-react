import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Info, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/jwtGenerator")({
	component: JwtGenerator,
});

type Algorithm = "HS256" | "HS384" | "HS512";

interface PayloadField {
	key: string;
	value: string;
	type: "string" | "number" | "boolean";
}

function base64UrlEncode(str: string): string {
	const bytes = new TextEncoder().encode(str);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

async function hmacSign(
	key: string,
	data: string,
	algorithm: Algorithm,
): Promise<string> {
	const algoMap: Record<Algorithm, HmacImportParams> = {
		HS256: { name: "HMAC", hash: "SHA-256" },
		HS384: { name: "HMAC", hash: "SHA-384" },
		HS512: { name: "HMAC", hash: "SHA-512" },
	};

	const encoder = new TextEncoder();
	const keyData = encoder.encode(key);
	const msgData = encoder.encode(data);

	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyData,
		algoMap[algorithm],
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);

	const bytes = new Uint8Array(signature);
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

async function generateJwt(
	algorithm: Algorithm,
	payloadFields: PayloadField[],
	secret: string,
	includeStandardFields: boolean,
): Promise<string> {
	const header = {
		alg: algorithm,
		typ: "JWT",
	};

	const payload: Record<string, unknown> = {};

	if (includeStandardFields) {
		payload.iat = Math.floor(Date.now() / 1000);
	}

	for (const field of payloadFields) {
		if (!field.key.trim()) continue;

		let value: unknown = field.value;
		if (field.type === "number") {
			const num = Number(field.value);
			if (!isNaN(num)) value = num;
		} else if (field.type === "boolean") {
			value = field.value === "true";
		}

		payload[field.key] = value;
	}

	const headerEncoded = base64UrlEncode(JSON.stringify(header));
	const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
	const data = `${headerEncoded}.${payloadEncoded}`;

	const signature = await hmacSign(secret, data, algorithm);

	return `${data}.${signature}`;
}

function JwtGenerator() {
	const navigate = useNavigate();
	const [algorithm, setAlgorithm] = useState<Algorithm>("HS256");
	const [secret, setSecret] = useState("your-256-bit-secret");
	const [payloadFields, setPayloadFields] = useState<PayloadField[]>([
		{ key: "sub", value: "1234567890", type: "string" },
		{ key: "name", value: "用户", type: "string" },
	]);
	const [includeStandardFields, setIncludeStandardFields] = useState(true);
	const [result, setResult] = useState("");
	const [error, setError] = useState<string | null>(null);

	const addField = () => {
		setPayloadFields([
			...payloadFields,
			{ key: "", value: "", type: "string" },
		]);
	};

	const removeField = (index: number) => {
		setPayloadFields(payloadFields.filter((_, i) => i !== index));
	};

	const updateField = (index: number, field: Partial<PayloadField>) => {
		const newFields = [...payloadFields];
		newFields[index] = { ...newFields[index], ...field };
		setPayloadFields(newFields);
	};

	const handleGenerate = async () => {
		try {
			if (!secret.trim()) {
				setError("请输入密钥");
				return;
			}

			const token = await generateJwt(
				algorithm,
				payloadFields,
				secret,
				includeStandardFields,
			);
			setResult(token);
			setError(null);
			toast.success("JWT 生成成功");
		} catch (err) {
			setError(err instanceof Error ? err.message : "生成失败");
			setResult("");
		}
	};

	const loadSample = () => {
		setPayloadFields([
			{ key: "sub", value: "1234567890", type: "string" },
			{ key: "name", value: "张三", type: "string" },
			{ key: "admin", value: "true", type: "boolean" },
		]);
		setSecret("my-secret-key");
		toast.success("示例数据已加载");
	};

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-5xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							JWT 生成器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg">
										<p className="text-xs text-blue-600">
											使用浏览器 API 生成 JWT，支持 HMAC
											签名算法。所有操作在本地完成，数据不会上传。
										</p>
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
				<CardContent className="flex-1 min-h-0 p-4">
					<div className="h-full grid grid-cols-2 gap-4">
						{/* 左侧：配置 */}
						<div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
							{/* 算法选择 */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">签名算法</Label>
								<Select
									value={algorithm}
									onValueChange={(v) => setAlgorithm(v as Algorithm)}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="HS256">HS256 (HMAC + SHA256)</SelectItem>
										<SelectItem value="HS384">HS384 (HMAC + SHA384)</SelectItem>
										<SelectItem value="HS512">HS512 (HMAC + SHA512)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* 密钥 */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">密钥 (Secret)</Label>
								<Input
									type="text"
									value={secret}
									onChange={(e) => setSecret(e.target.value)}
									placeholder="输入密钥..."
									className="font-mono text-sm"
								/>
							</div>

							{/* 标准字段开关 */}
							<div className="flex items-center gap-2">
								<Switch
									id="standard-fields"
									checked={includeStandardFields}
									onCheckedChange={setIncludeStandardFields}
								/>
								<Label htmlFor="standard-fields" className="text-sm">
									自动添加 iat (签发时间)
								</Label>
							</div>

							{/* Payload 字段 */}
							<div className="space-y-2 flex-1 min-h-0 flex flex-col">
								<div className="flex justify-between items-center">
									<Label className="text-sm font-medium">Payload</Label>
									<Button
										onClick={addField}
										variant="outline"
										size="sm"
										className="h-7"
									>
										<Plus className="h-3 w-3 mr-1" />
										添加字段
									</Button>
								</div>
								<div className="flex-1 min-h-0 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50">
									{payloadFields.map((field, index) => (
										<div key={index} className="flex gap-2 items-center">
											<Input
												value={field.key}
												onChange={(e) =>
													updateField(index, { key: e.target.value })
												}
												placeholder="键名"
												className="w-24 h-8 text-xs font-mono"
											/>
											<Input
												value={field.value}
												onChange={(e) =>
													updateField(index, { value: e.target.value })
												}
												placeholder="值"
												className="flex-1 h-8 text-xs font-mono"
											/>
											<Select
												value={field.type}
												onValueChange={(v) =>
													updateField(index, {
														type: v as "string" | "number" | "boolean",
													})
												}
											>
												<SelectTrigger className="w-20 h-8 text-xs">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="string">String</SelectItem>
													<SelectItem value="number">Number</SelectItem>
													<SelectItem value="boolean">Boolean</SelectItem>
												</SelectContent>
											</Select>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
												onClick={() => removeField(index)}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									))}
									{payloadFields.length === 0 && (
										<div className="text-center text-gray-400 text-sm py-4">
											点击"添加字段"添加 payload 内容
										</div>
									)}
								</div>
							</div>

							{/* 生成按钮 */}
							<Button onClick={handleGenerate} className="w-full">
								生成 JWT
							</Button>

							{error && (
								<div className="p-2 bg-red-50 rounded-lg border border-red-200">
									<p className="text-xs text-red-600">{error}</p>
								</div>
							)}
						</div>

						{/* 右侧：结果 */}
						<div className="flex flex-col gap-3 min-h-0">
							{/* Header 预览 */}
							<div className="border rounded-lg overflow-hidden">
								<div className="px-3 py-1.5 bg-gradient-to-r from-red-50 to-red-100 border-b">
									<span className="font-semibold text-sm text-red-700">
										HEADER
									</span>
								</div>
								<pre className="p-3 text-xs font-mono bg-white">
									{JSON.stringify({ alg: algorithm, typ: "JWT" }, null, 2)}
								</pre>
							</div>

							{/* Payload 预览 */}
							<div className="border rounded-lg overflow-hidden flex-1 min-h-0 flex flex-col">
								<div className="px-3 py-1.5 bg-gradient-to-r from-purple-50 to-purple-100 border-b flex-shrink-0">
									<span className="font-semibold text-sm text-purple-700">
										PAYLOAD
									</span>
								</div>
								<pre className="p-3 text-xs font-mono bg-white overflow-auto flex-1">
									{JSON.stringify(
										{
											...(includeStandardFields
												? { iat: Math.floor(Date.now() / 1000) }
												: {}),
											...payloadFields.reduce(
												(acc, field) => {
													if (field.key.trim()) {
														let value: unknown = field.value;
														if (field.type === "number") {
															const num = Number(field.value);
															if (!isNaN(num)) value = num;
														} else if (field.type === "boolean") {
															value = field.value === "true";
														}
														acc[field.key] = value;
													}
													return acc;
												},
												{} as Record<string, unknown>,
											),
										},
										null,
										2,
									)}
								</pre>
							</div>

							{/* 生成结果 */}
							<div className="border rounded-lg overflow-hidden">
								<div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-green-50 to-green-100 border-b">
									<span className="font-semibold text-sm text-green-700">
										生成的 JWT
									</span>
									{result && (
										<Button
											size="sm"
											variant="ghost"
											className="h-6 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
											onClick={() => copyToClipboard(result)}
										>
											<Copy className="h-3 w-3 mr-1" />
											<span className="text-xs">复制</span>
										</Button>
									)}
								</div>
								<div className="p-3 bg-white max-h-28 overflow-auto">
									{result ? (
										<pre className="text-xs font-mono break-all whitespace-pre-wrap">
											{result}
										</pre>
									) : (
										<p className="text-xs text-gray-400 text-center py-2">
											生成的 Token 将显示在这里
										</p>
									)}
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
