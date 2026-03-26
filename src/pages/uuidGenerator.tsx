import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useClear, useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, RefreshCw, Trash2, X } from "lucide-react";
import { useCallback, useState } from "react";

export const Route = createFileRoute("/uuidGenerator")({
	component: UuidGenerator,
});

type Version = "v4" | "v7" | "nil";

function UuidGenerator() {
	const { copy } = useCopy();
	const [version, setVersion] = useState<Version>("v4");
	const [count, setCount] = useState(1);
	const [uppercase, setUppercase] = useState(false);
	const [withBraces, setWithBraces] = useState(false);
	const [noHyphens, setNoHyphens] = useState(false);
	const [uuids, setUuids] = useState<string[]>([]);
	const [validateInput, setValidateInput] = useState("");
	const [validateResult, setValidateResult] = useState<boolean | null>(null);
	const { clear } = useClear(() => setUuids([]));

	const generateV4 = (): string => {
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);
		bytes[6] = (bytes[6] & 0x0f) | 0x40;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;
		return Array.from(bytes)
			.map((b, i) => {
				const hex = b.toString(16).padStart(2, "0");
				return i === 4 || i === 6 || i === 8 || i === 10 ? `-${hex}` : hex;
			})
			.join("");
	};

	const generateV7 = (): string => {
		const timestamp = Date.now();
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);
		bytes[0] = (timestamp / 2 ** 40) & 0xff;
		bytes[1] = (timestamp / 2 ** 32) & 0xff;
		bytes[2] = (timestamp / 2 ** 24) & 0xff;
		bytes[3] = (timestamp / 2 ** 16) & 0xff;
		bytes[4] = (timestamp / 2 ** 8) & 0xff;
		bytes[5] = timestamp & 0xff;
		bytes[6] = (bytes[6] & 0x0f) | 0x70;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;
		return Array.from(bytes)
			.map((b, i) => {
				const hex = b.toString(16).padStart(2, "0");
				return i === 4 || i === 6 || i === 8 || i === 10 ? `-${hex}` : hex;
			})
			.join("");
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
					uuid = "00000000-0000-0000-0000-000000000000";
					break;
			}
			newUuids.push(formatUuid(uuid));
		}
		setUuids(newUuids);
	}, [version, count, uppercase, withBraces, noHyphens]);

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
		<ToolPage
			title="UUID 生成器"
			description="UUID v4: 随机生成 | UUID v7: 时间排序 | Nil UUID: 全零"
		>
			<div className="h-full overflow-y-auto space-y-6">
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

				<div className="flex flex-wrap gap-4">
					<div className="flex items-center gap-2">
						<Switch checked={uppercase} onCheckedChange={setUppercase} />
						<Label className="text-sm">大写</Label>
					</div>
					<div className="flex items-center gap-2">
						<Switch checked={withBraces} onCheckedChange={setWithBraces} />
						<Label className="text-sm">花括号</Label>
					</div>
					<div className="flex items-center gap-2">
						<Switch checked={noHyphens} onCheckedChange={setNoHyphens} />
						<Label className="text-sm">无连字符</Label>
					</div>
				</div>

				<div className="flex gap-2">
					<Button onClick={generate} className="flex-1">
						<RefreshCw className="h-4 w-4 mr-2" />
						生成 UUID
					</Button>
					<Button
						onClick={() => copy(uuids.join("\n"), "全部 UUID")}
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
									<code className="text-sm font-mono break-all">{uuid}</code>
									<Button
										size="sm"
										variant="ghost"
										className="opacity-0 group-hover:opacity-100 h-7 w-7 p-0 flex-shrink-0"
										onClick={() => copy(uuid)}
									>
										<Copy className="h-3 w-3" />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				<div className="border-t pt-4 space-y-3">
					<Label className="text-sm font-medium">UUID 验证</Label>
					<div className="relative">
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
					{validateResult !== null && (
						<div
							className={`text-sm ${validateResult ? "text-green-600" : "text-red-600"}`}
						>
							{validateResult ? "✓ 有效的 UUID 格式" : "✗ 无效的 UUID 格式"}
						</div>
					)}
				</div>
			</div>
		</ToolPage>
	);
}
