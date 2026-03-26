import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/caseConverter")({
	component: CaseConverter,
});

function CaseConverter() {
	const { copy } = useCopy();
	const [input, setInput] = useState("");

	const converted = useMemo(() => {
		if (!input.trim())
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

		const splitWords = (str: string): string[] => {
			return str
				.replace(/([a-z])([A-Z])/g, "$1 $2")
				.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
				.replace(/[_\-.\s]+/g, " ")
				.replace(/[^a-zA-Z0-9\s]/g, "")
				.trim()
				.split(/\s+/)
				.filter((w) => w.length > 0);
		};

		const words = splitWords(input);
		const lowerWords = words.map((w) => w.toLowerCase());
		const upperWords = words.map((w) => w.toUpperCase());
		const capitalize = (str: string) =>
			str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

		return {
			uppercase: upperWords.join(" "),
			lowercase: lowerWords.join(" "),
			camelCase: lowerWords
				.map((w, i) => (i === 0 ? w : capitalize(w)))
				.join(""),
			pascalCase: lowerWords.map((w) => capitalize(w)).join(""),
			snakeCase: lowerWords.join("_"),
			kebabCase: lowerWords.join("-"),
			constantCase: upperWords.join("_"),
			dotCase: lowerWords.join("."),
			sentenceCase: lowerWords
				.map((w, i) => (i === 0 ? capitalize(w) : w))
				.join(" "),
			titleCase: lowerWords.map((w) => capitalize(w)).join(" "),
		};
	}, [input]);

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
		<ToolPage
			title="大小写转换"
			description="支持 UPPERCASE、lowercase、camelCase、PascalCase、snake_case、kebab-case 等多种格式转换。"
		>
			<div className="h-full grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-3 min-h-0">
					<span className="text-sm font-medium text-gray-700 flex-shrink-0">
						输入文本
					</span>
					<Textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="输入需要转换的文本..."
						className="flex-1 min-h-0 resize-none font-mono text-sm"
					/>
				</div>

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
										onClick={() => copy(value, fmt.name)}
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
										<span className="text-xs text-gray-400">{fmt.example}</span>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</ToolPage>
	);
}
