import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	ArrowLeft,
	Check,
	Copy,
	Info,
	RefreshCw,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/uuidGenerator")({
	component: UuidGenerator,
});

type Version = "v4" | "v7" | "nil";

function UuidGenerator() {
	const navigate = useNavigate();
	const [version, setVersion] = useState<Version>("v4");
	const [count, setCount] = useState(1);
	const [uppercase, setUppercase] = useState(false);
	const [withBraces, setWithBraces] = useState(false);
	const [noHyphens, setNoHyphens] = useState(false);
	const [uuids, setUuids] = useState<string[]>([]);
	const [validateInput, setValidateInput] = useState("");
	const [validateResult, setValidateResult] = useState<boolean | null>(null);

	// 生成 UUID v4
	const generateV4 = (): string => {
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);
		bytes[6] = (bytes[6] & 0x0f) | 0x40;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;
		return Array.from(bytes)
			.map((b, i) => {
				const hex = b.toString(16).padStart(2, "0");
				if (i === 4 || i === 6 || i === 8 || i === 10) return `-${hex}`;
				return hex;
			})
			.join("");
	};

	// 生成 UUID v7 (时间排序)
	const generateV7 = (): string => {
		const timestamp = Date.now();
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);

		// 时间戳部分 (48位)
		bytes[0] = (timestamp / 2 ** 40) & 0xff;
		bytes[1] = (timestamp / 2 ** 32) & 0xff;
		bytes[2] = (timestamp / 2 ** 24) & 0xff;
		bytes[3] = (timestamp / 2 ** 16) & 0xff;
		bytes[4] = (timestamp / 2 ** 8) & 0xff;
		bytes[5] = timestamp & 0xff;

		// 版本和变体
		bytes[6] = (bytes[6] & 0x0f) | 0x70;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;

		return Array.from(bytes)
			.map((b, i) => {
				const hex = b.toString(16).padStart(2, "0");
				if (i === 4 || i === 6 || i === 8 || i === 10) return `-${hex}`;
				return hex;
			})
			.join("");
	};

	// 生成 Nil UUID
	const generateNil = (): string => {
		return "00000000-0000-0000-0000-000000000000";
	};

	const formatUuid = (uuid: string): string => {
		let result = uuid;
		if (uppercase) result = result.toUpperCase();
		if (noHyphens) result = result.replace(/-/g, "");
		if (withBraces) result = `{${result}}`;
		return result;
	};

	const generate = useCallback(() => {
		const newUuids: string[] = [];
		for (let i = 0; i < count; i++) {
			let uuid: string;
			switch (version) {
				case "v4":
					uuid = generateV4();
					break;
				case "v7":
					uuid = generateV7();
					break;
				case "nil":
					uuid = generateNil();
					break;
			}
			newUuids.push(formatUuid(uuid));
		}
		setUuids(newUuids);
	}, [version, count, uppercase, withBraces, noHyphens]);

	const copyAll = () => {
		copyToClipboard(uuids.join("\n"));
		toast.success(`已复制 ${uuids.length} 个 UUID`);
	};

	const copyOne = (uuid: string) => {
		copyToClipboard(uuid);
		toast.success("已复制");
	};

	const clear = () => {
		setUuids([]);
	};

	// 验证 UUID 格式
	const validate = (value: string) => {
		setValidateInput(value);
		if (!value.trim()) {
			setValidateResult(null);
			return;
		}
		const regex =
			/^[{]?[0-9a-fA-F]{8}[-]?([0-9a-fA-F]{4}[-]?){3}[0-9a-fA-F]{12}[}]?$/;
		setValidateResult(regex.test(value.trim()));
	};

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-3xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							UUID 生成器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600 space-y-1">
										<p>UUID v4: 随机生成，最常用</p>
										<p>UUID v7: 时间排序，适合数据库主键</p>
										<p>Nil UUID: 全零，用于表示空值</p>
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
				<CardContent className="flex-1 min-h-0 p-4 overflow-y-auto">
					<div className="space-y-6">
						{/* 版本选择 */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">UUID 版本</Label>
							<div className="flex gap-2">
								{[
									{ v: "v4" as Version, label: "UUID v4", desc: "随机" },
									{ v: "v7" as Version, label: "UUID v7", desc: "时间排序" },
									{ v: "nil" as Version, label: "Nil UUID", desc: "全零" },
								].map((item) => (
									<Button
										key={item.v}
										variant={version === item.v ? "default" : "outline"}
										onClick={() => setVersion(item.v)}
										className="flex-1"
									>
										<div className="text-center">
											<div>{item.label}</div>
											<div className="text-[10px] opacity-70">{item.desc}</div>
										</div>
									</Button>
								))}
							</div>
						</div>

						{/* 生成数量 */}
						<div className="space-y-2">
							<div className="flex justify-between">
								<Label className="text-sm font-medium">生成数量</Label>
								<span className="text-sm font-mono bg-gray-100 px-2 rounded">
									{count}
								</span>
							</div>
							<Slider
								value={[count]}
								onValueChange={(v) => setCount(v[0])}
								min={1}
								max={50}
								step={1}
							/>
						</div>

						{/* 格式选项 */}
						<div className="flex flex-wrap gap-4">
							<div className="flex items-center gap-2">
								<Switch checked={uppercase} onCheckedChange={setUppercase} />
								<Label className="text-sm">大写</Label>
							</div>
							<div className="flex items-center gap-2">
								<Switch checked={withBraces} onCheckedChange={setWithBraces} />
								<Label className="text-sm">花括号 {}</Label>
							</div>
							<div className="flex items-center gap-2">
								<Switch checked={noHyphens} onCheckedChange={setNoHyphens} />
								<Label className="text-sm">无连字符</Label>
							</div>
						</div>

						{/* 生成按钮 */}
						<div className="flex gap-2">
							<Button onClick={generate} className="flex-1">
								<RefreshCw className="h-4 w-4 mr-2" />
								生成 UUID
							</Button>
							<Button
								onClick={copyAll}
								variant="outline"
								disabled={uuids.length === 0}
							>
								<Copy className="h-4 w-4 mr-2" />
								复制全部
							</Button>
							<Button
								onClick={clear}
								variant="outline"
								disabled={uuids.length === 0}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>

						{/* 生成结果 */}
						{uuids.length > 0 && (
							<div className="space-y-2">
								<Label className="text-sm font-medium">
									生成结果 ({uuids.length})
								</Label>
								<div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
									{uuids.map((uuid, i) => (
										<div
											key={i}
											className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 group"
										>
											<code className="text-sm font-mono break-all">
												{uuid}
											</code>
											<Button
												size="sm"
												variant="ghost"
												className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 flex-shrink-0"
												onClick={() => copyOne(uuid)}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
									))}
								</div>
							</div>
						)}

						{/* 验证工具 */}
						<div className="border-t pt-4 space-y-3">
							<Label className="text-sm font-medium">UUID 验证</Label>
							<div className="flex gap-2">
								<div className="relative flex-1">
									<Input
										value={validateInput}
										onChange={(e) => validate(e.target.value)}
										placeholder="输入 UUID 进行验证..."
										className="font-mono pr-8"
									/>
									{validateResult !== null && (
										<div className="absolute right-2 top-1/2 -translate-y-1/2">
											{validateResult ? (
												<Check className="h-4 w-4 text-green-500" />
											) : (
												<X className="h-4 w-4 text-red-500" />
											)}
										</div>
									)}
								</div>
							</div>
							{validateResult !== null && (
								<div
									className={`text-sm ${validateResult ? "text-green-600" : "text-red-600"}`}
								>
									{validateResult ? "✓ 有效的 UUID 格式" : "✗ 无效的 UUID 格式"}
								</div>
							)}
						</div>

						{/* 示例 */}
						<div className="bg-gray-50 rounded-lg p-4 space-y-2">
							<Label className="text-sm font-medium text-gray-600">
								格式示例
							</Label>
							<div className="grid grid-cols-2 gap-2 text-xs font-mono">
								<div>
									<div className="text-gray-400">标准格式</div>
									<div>550e8400-e29b-41d4-a716-446655440000</div>
								</div>
								<div>
									<div className="text-gray-400">大写格式</div>
									<div>550E8400-E29B-41D4-A716-446655440000</div>
								</div>
								<div>
									<div className="text-gray-400">花括号格式</div>
									<div>{"{550e8400-e29b-41d4-a716-446655440000}"}</div>
								</div>
								<div>
									<div className="text-gray-400">无连字符</div>
									<div>550e8400e29b41d4a716446655440000</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
