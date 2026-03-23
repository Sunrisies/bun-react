import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Info, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/wordCounter")({
	component: WordCounter,
});

function WordCounter() {
	const navigate = useNavigate();
	const [text, setText] = useState("");

	const stats = useMemo(() => {
		if (!text) {
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
		}

		const characters = text.length;
		const charactersNoSpaces = text.replace(/\s/g, "").length;

		// 中文字符
		const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;

		// 英文单词
		const englishText = text.replace(/[\u4e00-\u9fa5]/g, " ");
		const englishWords = englishText
			.split(/\s+/)
			.filter((w) => /[a-zA-Z]/.test(w)).length;

		// 数字
		const numbers = (text.match(/\d/g) || []).length;

		// 行数
		const lines = text.split(/\n/).length;

		// 段落数（非空行）
		const paragraphs =
			text.split(/\n\s*\n/).filter((p) => p.trim()).length ||
			(text.trim() ? 1 : 0);

		// 句子数（中英文句号、问号、感叹号）
		const sentences =
			(text.match(/[。！？.!?]/g) || []).length || (text.trim() ? 1 : 0);

		// 标点符号
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

	const handleCopy = (content: string) => {
		copyToClipboard(content);
		toast.success("已复制");
	};

	const handleClear = () => {
		setText("");
	};

	const loadSample = () => {
		setText(`这是一段示例文本，用于测试字数统计功能。
This is a sample text for testing word counter.

包含中文、English、数字123，以及各种标点符号！
支持多行统计，可以准确计算字符数、单词数、行数等。`);
	};

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
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-4xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							字数/字符统计
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										实时统计文本的字数、字符数、行数、段落数等信息。
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
				<CardContent className="flex-1 min-h-0 p-4 overflow-hidden">
					<div className="h-full grid grid-cols-[1fr_260px] gap-4">
						{/* 左侧：文本输入 */}
						<div className="flex flex-col gap-3 min-h-0">
							<div className="flex items-center justify-between flex-shrink-0">
								<span className="text-sm font-medium text-gray-700">
									输入文本
								</span>
								<div className="flex gap-2">
									<Button
										onClick={handleClear}
										variant="ghost"
										size="sm"
										className="h-7 text-xs"
										disabled={!text}
									>
										<RotateCcw className="h-3 w-3 mr-1" />
										清空
									</Button>
									<Button
										onClick={() => handleCopy(text)}
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

						{/* 右侧：统计结果 */}
						<div className="flex flex-col gap-3 min-h-0">
							{/* 主要统计 */}
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

							{/* 详细统计 */}
							<div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
								{statItems.map((item) => (
									<div
										key={item.label}
										className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer group"
										onClick={() => handleCopy(String(item.value))}
										title="点击复制"
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

							{/* 复制全部统计 */}
							<Button
								onClick={() =>
									handleCopy(
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
				</CardContent>
			</Card>
		</div>
	);
}
