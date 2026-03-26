import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/passwordGenerator")({
	component: PasswordGenerator,
});

const CHARSETS = {
	uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	lowercase: "abcdefghijklmnopqrstuvwxyz",
	numbers: "0123456789",
	symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function PasswordGenerator() {
	const { copy } = useCopy();
	const [length, setLength] = useState(16);
	const [includeUppercase, setIncludeUppercase] = useState(true);
	const [includeLowercase, setIncludeLowercase] = useState(true);
	const [includeNumbers, setIncludeNumbers] = useState(true);
	const [includeSymbols, setIncludeSymbols] = useState(true);
	const [password, setPassword] = useState("");

	const availableChars = useMemo(() => {
		let chars = "";
		if (includeUppercase) chars += CHARSETS.uppercase;
		if (includeLowercase) chars += CHARSETS.lowercase;
		if (includeNumbers) chars += CHARSETS.numbers;
		if (includeSymbols) chars += CHARSETS.symbols;
		return chars;
	}, [includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

	const generatePassword = useCallback(() => {
		if (availableChars.length === 0) {
			toast.error("请至少选择一种字符类型");
			return;
		}
		const array = new Uint32Array(length);
		crypto.getRandomValues(array);
		let result = "";
		for (let i = 0; i < length; i++)
			result += availableChars[array[i] % availableChars.length];
		setPassword(result);
	}, [length, availableChars]);

	const strength = useMemo(() => {
		if (!password) return { level: 0, text: "", color: "" };
		let score = 0;
		if (password.length >= 8) score++;
		if (password.length >= 12) score++;
		if (password.length >= 16) score++;
		if (/[a-z]/.test(password)) score++;
		if (/[A-Z]/.test(password)) score++;
		if (/[0-9]/.test(password)) score++;
		if (/[^a-zA-Z0-9]/.test(password)) score++;
		if (score <= 2) return { level: 1, text: "弱", color: "bg-red-500" };
		if (score <= 4) return { level: 2, text: "中", color: "bg-yellow-500" };
		if (score <= 5) return { level: 3, text: "强", color: "bg-blue-500" };
		return { level: 4, text: "非常强", color: "bg-green-500" };
	}, [password]);

	useEffect(() => {
		generatePassword();
	}, []);

	return (
		<ToolPage
			title="密码生成器"
			description="使用浏览器加密 API 生成安全的随机密码。所有操作在本地完成。"
			maxWidth="max-w-2xl"
		>
			<div className="h-full flex flex-col justify-center gap-6">
				<div className="space-y-3">
					<div className="relative">
						<Input
							value={password}
							readOnly
							className="pr-24 h-14 text-lg font-mono tracking-wider"
							placeholder="点击生成密码"
						/>
						<div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
							<Button
								size="sm"
								variant="ghost"
								className="h-9 w-9 p-0"
								onClick={() => copy(password)}
							>
								<Copy className="h-4 w-4" />
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-9 w-9 p-0"
								onClick={generatePassword}
							>
								<RefreshCw className="h-4 w-4" />
							</Button>
						</div>
					</div>
					{password && (
						<div className="space-y-1">
							<div className="flex justify-between text-xs">
								<span className="text-gray-500">密码强度</span>
								<span
									className={`font-medium ${strength.level <= 1 ? "text-red-500" : strength.level <= 2 ? "text-yellow-500" : strength.level <= 3 ? "text-blue-500" : "text-green-500"}`}
								>
									{strength.text}
								</span>
							</div>
							<div className="flex gap-1">
								{[1, 2, 3, 4].map((i) => (
									<div
										key={i}
										className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : "bg-gray-200"}`}
									/>
								))}
							</div>
						</div>
					)}
				</div>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<Label className="text-sm font-medium">密码长度</Label>
						<span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
							{length}
						</span>
					</div>
					<Slider
						value={[length]}
						onValueChange={(v) => setLength(v[0])}
						min={4}
						max={64}
						step={1}
					/>
				</div>

				<div className="space-y-3">
					<Label className="text-sm font-medium">包含字符</Label>
					<div className="grid grid-cols-2 gap-3">
						{[
							{
								label: "大写字母",
								desc: "A-Z",
								checked: includeUppercase,
								onChange: setIncludeUppercase,
							},
							{
								label: "小写字母",
								desc: "a-z",
								checked: includeLowercase,
								onChange: setIncludeLowercase,
							},
							{
								label: "数字",
								desc: "0-9",
								checked: includeNumbers,
								onChange: setIncludeNumbers,
							},
							{
								label: "特殊字符",
								desc: "!@#$%...",
								checked: includeSymbols,
								onChange: setIncludeSymbols,
							},
						].map((item) => (
							<div
								key={item.label}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
							>
								<div>
									<div className="text-sm font-medium">{item.label}</div>
									<div className="text-xs text-gray-400 font-mono">
										{item.desc}
									</div>
								</div>
								<Switch
									checked={item.checked}
									onCheckedChange={item.onChange}
								/>
							</div>
						))}
					</div>
				</div>

				<Button onClick={generatePassword} className="w-full h-12 text-base">
					<RefreshCw className="h-4 w-4 mr-2" />
					生成密码
				</Button>

				{password && (
					<div className="flex justify-center gap-6 text-xs text-gray-400">
						<span>长度: {password.length}</span>
						<span>字符集: {availableChars.length}</span>
						<span>
							熵:{" "}
							{Math.round(password.length * Math.log2(availableChars.length))}{" "}
							位
						</span>
					</div>
				)}
			</div>
		</ToolPage>
	);
}
