import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/caseConverter")({
	component: CaseConverter,
});

function CaseConverter() {
	const navigate = useNavigate();
	const [input, setInput] = useState("");

	const converted = useMemo(() => {
		if (!input.trim()) {
			return {
				uppercase: "",
				lowercase: "",
				camelCase: "",
				pascalCase: "",
				snakeCase: "",
				kebabCase: "",
				constantCase: "",
				dotCase: "",
				sentenceCase: "",
				titleCase: "",
			};
		}

		// 分词函数
		const splitWords = (str: string): string[] => {
			return str
				.replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase 分割
				.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // PascalCase 分割
				.replace(/[_\-.\s]+/g, " ") // 下划线、连字符、点、空格分割
				.replace(/[^a-zA-Z0-9\s]/g, "") // 移除其他特殊字符
				.trim()
				.split(/\s+/)
				.filter((w) => w.length > 0);
		};

		const words = splitWords(input);
		const lowerWords = words.map((w) => w.toLowerCase());
		const upperWords = words.map((w) => w.toUpperCase());

		// 首字母大写
		const capitalize = (str: string) =>
			str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

		return {
			// UPPERCASE
			uppercase: upperWords.join(" "),

			// lowercase
			lowercase: lowerWords.join(" "),

			// camelCase
			camelCase: lowerWords
				.map((w, i) => (i === 0 ? w : capitalize(w)))
				.join(""),

			// PascalCase
			pascalCase: lowerWords.map((w) => capitalize(w)).join(""),

			// snake_case
			snakeCase: lowerWords.join("_"),

			// kebab-case
			kebabCase: lowerWords.join("-"),

			// CONSTANT_CASE
			constantCase: upperWords.join("_"),

			// dot.case
			dotCase: lowerWords.join("."),

			// Sentence case
			sentenceCase: lowerWords
				.map((w, i) => (i === 0 ? capitalize(w) : w))
				.join(" "),

			// Title Case
			titleCase: lowerWords.map((w) => capitalize(w)).join(" "),
		};
	}, [input]);

	const copyValue = (value: string, name: string) => {
		if (!value) return;
		copyToClipboard(value);
		toast.success(`已复制 ${name}`);
	};

	const formats = [
		{
			key: "uppercase",
			name: "UPPERCASE",
			label: "全部大写",
			example: "HELLO WORLD",
		},
		{
			key: "lowercase",
			name: "lowercase",
			label: "全部小写",
			example: "hello world",
		},
		{
			key: "camelCase",
			name: "camelCase",
			label: "驼峰命名",
			example: "helloWorld",
		},
		{
			key: "pascalCase",
			name: "PascalCase",
			label: "帕斯卡命名",
			example: "HelloWorld",
		},
		{
			key: "snakeCase",
			name: "snake_case",
			label: "下划线命名",
			example: "hello_world",
		},
		{
			key: "kebabCase",
			name: "kebab-case",
			label: "连字符命名",
			example: "hello-world",
		},
		{
			key: "constantCase",
			name: "CONSTANT_CASE",
			label: "常量命名",
			example: "HELLO_WORLD",
		},
		{
			key: "dotCase",
			name: "dot.case",
			label: "点号命名",
			example: "hello.world",
		},
		{
			key: "sentenceCase",
			name: "Sentence case",
			label: "句首大写",
			example: "Hello world",
		},
		{
			key: "titleCase",
			name: "Title Case",
			label: "标题大写",
			example: "Hello World",
		},
	];

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-4xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							大小写转换
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										支持
										UPPERCASE、lowercase、camelCase、PascalCase、snake_case、kebab-case
										等多种格式转换。
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
				<CardContent className="flex-1 min-h-0 p-4 overflow-hidden">
					<div className="h-full grid grid-cols-2 gap-4">
						{/* 左侧：输入 */}
						<div className="flex flex-col gap-3 min-h-0">
							<span className="text-sm font-medium text-gray-700 flex-shrink-0">
								输入文本
							</span>
							<Textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="输入需要转换的文本...&#10;&#10;支持多种格式：&#10;• hello world&#10;• helloWorld&#10;• HelloWorld&#10;• hello_world&#10;• hello-world"
								className="flex-1 min-h-0 resize-none font-mono text-sm"
							/>
						</div>

						{/* 右侧：转换结果 */}
						<div className="flex flex-col gap-2 min-h-0 overflow-y-auto pr-1">
							<span className="text-sm font-medium text-gray-700 flex-shrink-0">
								转换结果
							</span>
							{formats.map((fmt) => {
								const value = converted[fmt.key as keyof typeof converted];
								return (
									<div
										key={fmt.key}
										className="border rounded-lg overflow-hidden flex-shrink-0"
									>
										<div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b">
											<div className="flex items-center gap-2">
												<span className="text-xs font-medium text-gray-700">
													{fmt.name}
												</span>
												<span className="text-[10px] text-gray-400">
													{fmt.label}
												</span>
											</div>
											<Button
												size="sm"
												variant="ghost"
												className="h-6 px-2"
												onClick={() => copyValue(value, fmt.name)}
												disabled={!value}
											>
												<Copy className="h-3 w-3" />
											</Button>
										</div>
										<div className="px-3 py-2 bg-white">
											{value ? (
												<code className="text-sm font-mono text-gray-800 break-all">
													{value}
												</code>
											) : (
												<span className="text-xs text-gray-400">
													{fmt.example}
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
