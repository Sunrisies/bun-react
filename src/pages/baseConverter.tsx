import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useClear, useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/baseConverter")({
	component: BaseConverter,
});

type Base = 2 | 8 | 10 | 16;

function BaseConverter() {
	const { copy } = useCopy();
	const defaultValues: Record<Base, string> = { 2: "", 8: "", 10: "", 16: "" };
	const [values, setValues] = useState<Record<Base, string>>(defaultValues);
	const [activeBase, setActiveBase] = useState<Base>(10);
	const [error, setError] = useState<string | null>(null);
	const { clear } = useClear(() => {
		setValues(defaultValues);
		setError(null);
	});

	const isValidForBase = useCallback((value: string, base: Base): boolean => {
		if (!value) return true;
		const patterns: Record<Base, RegExp> = {
			2: /^[01]+$/,
			8: /^[0-7]+$/,
			10: /^[0-9]+$/,
			16: /^[0-9a-fA-F]+$/,
		};
		return patterns[base].test(value);
	}, []);

	const convert = useCallback(
		(value: string, fromBase: Base) => {
			if (!value.trim()) {
				setValues(defaultValues);
				setError(null);
				return;
			}
			if (!isValidForBase(value, fromBase)) {
				setError(`输入格式对 ${fromBase} 进制无效`);
				return;
			}
			try {
				const decimal = parseInt(value, fromBase);
				if (isNaN(decimal)) {
					setError("转换失败");
					return;
				}
				setValues({
					2: decimal.toString(2),
					8: decimal.toString(8),
					10: decimal.toString(10),
					16: decimal.toString(16).toUpperCase(),
				});
				setError(null);
			} catch {
				setError("转换失败");
			}
		},
		[isValidForBase],
	);

	const handleChange = (value: string, base: Base) => {
		const patterns: Record<Base, RegExp> = {
			2: /[^01]/g,
			8: /[^0-7]/g,
			10: /[^0-9]/g,
			16: /[^0-9a-fA-F]/g,
		};
		const filtered = value.replace(patterns[base], "").toUpperCase();
		setValues((prev) => ({ ...prev, [base]: filtered }));
		setActiveBase(base);
		convert(filtered, base);
	};

	const loadSample = () => {
		handleChange("255", 10);
		toast.success("已加载示例");
	};

	const baseInfo: {
		base: Base;
		name: string;
		prefix: string;
		chars: string;
		desc: string;
	}[] = [
		{ base: 2, name: "二进制", prefix: "0b", chars: "0-1", desc: "计算机底层" },
		{ base: 8, name: "八进制", prefix: "0o", chars: "0-7", desc: "Unix权限" },
		{ base: 10, name: "十进制", prefix: "", chars: "0-9", desc: "日常使用" },
		{
			base: 16,
			name: "十六进制",
			prefix: "0x",
			chars: "0-9, A-F",
			desc: "颜色/地址",
		},
	];

	return (
		<ToolPage
			title="进制转换器"
			description="支持二进制、八进制、十进制、十六进制之间的实时互转。"
			maxWidth="max-w-3xl"
			actions={
				<>
					<Button onClick={loadSample} variant="outline" size="sm">
						示例
					</Button>
					<Button onClick={clear} variant="outline" size="sm">
						清空
					</Button>
				</>
			}
		>
			<div className="h-full flex flex-col justify-center gap-5">
				{baseInfo.map(({ base, name, prefix, chars }) => (
					<div
						key={base}
						className={`p-4 rounded-lg border-2 transition-colors ${activeBase === base ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white"}`}
					>
						<div className="flex items-center justify-between mb-2">
							<div className="flex items-center gap-2">
								<span
									className={`text-xs font-bold px-2 py-0.5 rounded ${activeBase === base ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"}`}
								>
									{base}
								</span>
								<Label className="font-medium">{name}</Label>
								{prefix && (
									<span className="text-xs text-gray-400 font-mono">
										({prefix})
									</span>
								)}
							</div>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 px-2"
								onClick={() =>
									copy(
										prefix ? prefix + values[base] : values[base],
										`${base} 进制值`,
									)
								}
								disabled={!values[base]}
							>
								<Copy className="h-3 w-3 mr-1" />
								<span className="text-xs">复制</span>
							</Button>
						</div>
						<Input
							value={values[base]}
							onChange={(e) => handleChange(e.target.value, base)}
							placeholder={`输入${name} (${chars})`}
							className={`font-mono text-lg h-12 ${activeBase === base ? "" : "bg-gray-50"}`}
						/>
					</div>
				))}
				{error && (
					<div className="p-3 bg-red-50 rounded-lg border border-red-200">
						<p className="text-sm text-red-600">{error}</p>
					</div>
				)}
				<div className="grid grid-cols-4 gap-2 text-center">
					{baseInfo.map(({ base, name, desc }) => (
						<div key={base} className="p-2 bg-gray-50 rounded-lg">
							<div className="text-lg font-bold text-gray-700">{base}</div>
							<div className="text-xs text-gray-500">{name}</div>
							<div className="text-[10px] text-gray-400">{desc}</div>
						</div>
					))}
				</div>
			</div>
		</ToolPage>
	);
}
