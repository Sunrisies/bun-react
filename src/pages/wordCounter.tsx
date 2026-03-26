import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClear, useCopy, useSample } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/wordCounter")({
	component: WordCounter,
});

const sampleText = `这是一段示例文本，用于测试字数统计功能。
This is a sample text for testing word counter.

包含中文、English、数字123，以及各种标点符号！
支持多行统计，可以准确计算字符数、单词数、行数等。`;

function WordCounter() {
	const { copy } = useCopy();
	const [text, setText] = useState("");
	const { loadSample } = useSample(setText, sampleText);
	const { clear } = useClear(() => setText(""));

	const stats = useMemo(() => {
		if (!text)
			return {
				characters: 0,
				charactersNoSpaces: 0,
				chineseChars: 0,
				englishWords: 0,
				numbers: 0,
				lines: 0,
				paragraphs: 0,
				sentences: 0,
				punctuation: 0,
			};

		const characters = text.length;
		const charactersNoSpaces = text.replace(/\s/g, "").length;
		const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
		const englishWords = text
			.replace(/[\u4e00-\u9fa5]/g, " ")
			.split(/\s+/)
			.filter((w) => /[a-zA-Z]/.test(w)).length;
		const numbers = (text.match(/\d/g) || []).length;
		const lines = text.split(/\n/).length;
		const paragraphs =
			text.split(/\n\s*\n/).filter((p) => p.trim()).length ||
			(text.trim() ? 1 : 0);
		const sentences =
			(text.match(/[。！？.!?]/g) || []).length || (text.trim() ? 1 : 0);
		const punctuation = (
			text.match(
				/[，。！？、；：""''（）《》【】\s,\.!?;:"'()\[\]{}<>@#$%^&*+=\-\/\\|~`]/g,
			) || []
		).length;

		return {
			characters,
			charactersNoSpaces,
			chineseChars,
			englishWords,
			numbers,
			lines,
			paragraphs,
			sentences,
			punctuation,
		};
	}, [text]);

	const statItems = [
		{ label: "总字符数", value: stats.characters, desc: "包含空格和换行" },
		{
			label: "不含空格",
			value: stats.charactersNoSpaces,
			desc: "去除所有空格",
		},
		{ label: "中文字符", value: stats.chineseChars, desc: "汉字数量" },
		{ label: "英文单词", value: stats.englishWords, desc: "按空格分隔" },
		{ label: "数字", value: stats.numbers, desc: "0-9 数字" },
		{ label: "标点符号", value: stats.punctuation, desc: "中英文标点" },
		{ label: "行数", value: stats.lines, desc: "总行数" },
		{ label: "段落数", value: stats.paragraphs, desc: "非空段落" },
		{ label: "句子数", value: stats.sentences, desc: "以句号分隔" },
	];

	return (
		<ToolPage
			title="字数/字符统计"
			description="实时统计文本的字数、字符数、行数、段落数等信息。"
			actions={
				<>
					<Button onClick={loadSample} variant="outline" size="sm">
						示例
					</Button>
				</>
			}
		>
			<div className="h-full grid grid-cols-[1fr_260px] gap-4">
				<div className="flex flex-col gap-3 min-h-0">
					<div className="flex items-center justify-between flex-shrink-0">
						<span className="text-sm font-medium text-gray-700">输入文本</span>
						<div className="flex gap-2">
							<Button
								onClick={clear}
								variant="ghost"
								size="sm"
								className="h-7 text-xs"
								disabled={!text}
							>
								<RotateCcw className="h-3 w-3 mr-1" />
								清空
							</Button>
							<Button
								onClick={() => copy(text)}
								variant="ghost"
								size="sm"
								className="h-7 text-xs"
								disabled={!text}
							>
								<Copy className="h-3 w-3 mr-1" />
								复制
							</Button>
						</div>
					</div>
					<Textarea
						value={text}
						onChange={(e) => setText(e.target.value)}
						placeholder="在此输入或粘贴文本..."
						className="flex-1 min-h-0 resize-none font-mono text-sm"
					/>
				</div>

				<div className="flex flex-col gap-3 min-h-0">
					<div className="grid grid-cols-2 gap-2 flex-shrink-0">
						<div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
							<div className="text-2xl font-bold text-blue-700">
								{stats.characters}
							</div>
							<div className="text-xs text-blue-600">总字符</div>
						</div>
						<div className="p-3 bg-green-50 rounded-lg border border-green-200 text-center">
							<div className="text-2xl font-bold text-green-700">
								{stats.chineseChars + stats.englishWords}
							</div>
							<div className="text-xs text-green-600">总字/词</div>
						</div>
					</div>

					<div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
						{statItems.map((item) => (
							<div
								key={item.label}
								className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group"
								onClick={() => copy(String(item.value))}
							>
								<div className="min-w-0 flex-1">
									<div className="text-sm font-medium text-gray-700 truncate">
										{item.label}
									</div>
									<div className="text-[10px] text-gray-400 truncate">
										{item.desc}
									</div>
								</div>
								<div className="flex items-center gap-1 flex-shrink-0 ml-2">
									<span className="text-lg font-bold text-gray-800">
										{item.value}
									</span>
									<Copy className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100" />
								</div>
							</div>
						))}
					</div>

					<Button
						onClick={() =>
							copy(
								`总字符: ${stats.characters}\n不含空格: ${stats.charactersNoSpaces}\n中文字符: ${stats.chineseChars}\n英文单词: ${stats.englishWords}\n数字: ${stats.numbers}\n行数: ${stats.lines}\n段落数: ${stats.paragraphs}`,
							)
						}
						variant="outline"
						size="sm"
						className="w-full flex-shrink-0"
						disabled={!text}
					>
						<Copy className="h-3 w-3 mr-1" />
						复制全部统计
					</Button>
				</div>
			</div>
		</ToolPage>
	);
}
