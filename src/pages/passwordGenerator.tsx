import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Info, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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
	const navigate = useNavigate();

	const [length, setLength] = useState(16);
	const [includeUppercase, setIncludeUppercase] = useState(true);
	const [includeLowercase, setIncludeLowercase] = useState(true);
	const [includeNumbers, setIncludeNumbers] = useState(true);
	const [includeSymbols, setIncludeSymbols] = useState(true);
	const [password, setPassword] = useState("");
	const [copied, setCopied] = useState(false);

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
		for (let i = 0; i < length; i++) {
			result += availableChars[array[i] % availableChars.length];
		}

		setPassword(result);
		setCopied(false);
	}, [length, availableChars]);

	const handleCopy = () => {
		if (!password) return;
		copyToClipboard(password);
		setCopied(true);
		toast.success("已复制到剪贴板");
	};

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

	// 初始生成密码
	useState(() => {
		generatePassword();
	});

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-2xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							密码生成器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										使用浏览器加密 API 生成安全的随机密码。所有操作在本地完成。
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
				<CardContent className="flex-1 min-h-0 p-6 flex flex-col justify-center gap-6">
					{/* 密码显示区域 */}
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
									onClick={handleCopy}
									disabled={!password}
								>
									<Copy
										className={`h-4 w-4 ${copied ? "text-green-500" : ""}`}
									/>
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

						{/* 密码强度 */}
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

					{/* 密码长度 */}
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
						<div className="flex justify-between text-xs text-gray-400">
							<span>4</span>
							<span>64</span>
						</div>
					</div>

					{/* 字符类型选项 */}
					<div className="space-y-3">
						<Label className="text-sm font-medium">包含字符</Label>
						<div className="grid grid-cols-2 gap-3">
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div>
									<div className="text-sm font-medium">大写字母</div>
									<div className="text-xs text-gray-400 font-mono">A-Z</div>
								</div>
								<Switch
									checked={includeUppercase}
									onCheckedChange={setIncludeUppercase}
								/>
							</div>
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div>
									<div className="text-sm font-medium">小写字母</div>
									<div className="text-xs text-gray-400 font-mono">a-z</div>
								</div>
								<Switch
									checked={includeLowercase}
									onCheckedChange={setIncludeLowercase}
								/>
							</div>
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div>
									<div className="text-sm font-medium">数字</div>
									<div className="text-xs text-gray-400 font-mono">0-9</div>
								</div>
								<Switch
									checked={includeNumbers}
									onCheckedChange={setIncludeNumbers}
								/>
							</div>
							<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
								<div>
									<div className="text-sm font-medium">特殊字符</div>
									<div className="text-xs text-gray-400 font-mono">
										!@#$%...
									</div>
								</div>
								<Switch
									checked={includeSymbols}
									onCheckedChange={setIncludeSymbols}
								/>
							</div>
						</div>
					</div>

					{/* 生成按钮 */}
					<Button onClick={generatePassword} className="w-full h-12 text-base">
						<RefreshCw className="h-4 w-4 mr-2" />
						生成密码
					</Button>

					{/* 统计信息 */}
					{password && (
						<div className="flex justify-center gap-6 text-xs text-gray-400">
							<span>长度: {password.length}</span>
							<span>字符集: {availableChars.length} 个字符</span>
							<span>
								熵:{" "}
								{Math.round(password.length * Math.log2(availableChars.length))}{" "}
								位
							</span>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
