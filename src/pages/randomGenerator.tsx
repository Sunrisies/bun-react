import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Info, Shuffle, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/randomGenerator")({
	component: RandomGenerator,
});

function RandomGenerator() {
	const navigate = useNavigate();
	const [min, setMin] = useState(1);
	const [max, setMax] = useState(100);
	const [count, setCount] = useState(1);
	const [unique, setUnique] = useState(true);
	const [sort, setSort] = useState(false);
	const [results, setResults] = useState<number[]>([]);

	const generate = useCallback(() => {
		if (min >= max) {
			toast.error("最小值必须小于最大值");
			return;
		}

		const range = max - min + 1;
		if (unique && count > range) {
			toast.error(`不重复模式下最多生成 ${range} 个数`);
			return;
		}

		const randomValues: number[] = [];

		if (unique) {
			// Fisher-Yates 洗牌算法
			const pool = Array.from({ length: range }, (_, i) => min + i);
			for (let i = pool.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[pool[i], pool[j]] = [pool[j], pool[i]];
			}
			randomValues.push(...pool.slice(0, count));
		} else {
			for (let i = 0; i < count; i++) {
				randomValues.push(Math.floor(Math.random() * range) + min);
			}
		}

		if (sort) {
			randomValues.sort((a, b) => a - b);
		}

		setResults(randomValues);
	}, [min, max, count, unique, sort]);

	const copyResults = () => {
		copyToClipboard(results.join(", "));
		toast.success("已复制");
	};

	const clear = () => {
		setResults([]);
	};

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-2xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							随机数生成器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										使用加密级随机数生成器，支持指定范围、数量和不重复模式。
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
					{/* 范围设置 */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label className="text-sm font-medium">最小值</Label>
							<Input
								type="number"
								value={min}
								onChange={(e) => setMin(parseInt(e.target.value) || 0)}
								className="h-12 text-lg font-mono text-center"
							/>
						</div>
						<div className="space-y-2">
							<Label className="text-sm font-medium">最大值</Label>
							<Input
								type="number"
								value={max}
								onChange={(e) => setMax(parseInt(e.target.value) || 0)}
								className="h-12 text-lg font-mono text-center"
							/>
						</div>
					</div>

					{/* 生成数量 */}
					<div className="space-y-3">
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
							max={100}
							step={1}
						/>
					</div>

					{/* 选项 */}
					<div className="flex gap-6">
						<div className="flex items-center gap-2">
							<Switch checked={unique} onCheckedChange={setUnique} />
							<Label className="text-sm">不重复</Label>
						</div>
						<div className="flex items-center gap-2">
							<Switch checked={sort} onCheckedChange={setSort} />
							<Label className="text-sm">排序</Label>
						</div>
					</div>

					{/* 生成按钮 */}
					<div className="flex gap-3">
						<Button onClick={generate} className="flex-1 h-12">
							<Shuffle className="h-4 w-4 mr-2" />
							生成随机数
						</Button>
						<Button
							onClick={copyResults}
							variant="outline"
							disabled={results.length === 0}
						>
							<Copy className="h-4 w-4" />
						</Button>
						<Button
							onClick={clear}
							variant="outline"
							disabled={results.length === 0}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>

					{/* 结果 */}
					{results.length > 0 && (
						<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
							<div className="text-sm text-blue-600 mb-2">
								生成结果 ({results.length} 个)
							</div>
							<div className="flex flex-wrap gap-2">
								{results.map((num, i) => (
									<span
										key={i}
										className="px-3 py-1.5 bg-white rounded-lg border font-mono text-lg font-bold text-gray-800 shadow-sm cursor-pointer hover:bg-gray-50"
										onClick={() => {
											copyToClipboard(String(num));
											toast.success("已复制");
										}}
									>
										{num}
									</span>
								))}
							</div>
						</div>
					)}

					{/* 快捷预设 */}
					<div className="space-y-2">
						<Label className="text-sm text-gray-500">快捷预设</Label>
						<div className="flex flex-wrap gap-2">
							{[
								{ label: "骰子", min: 1, max: 6, count: 1 },
								{ label: "硬币", min: 0, max: 1, count: 1 },
								{ label: "彩票(双色球)", min: 1, max: 33, count: 6 },
								{ label: "大乐透", min: 1, max: 35, count: 5 },
							].map((preset) => (
								<Button
									key={preset.label}
									variant="outline"
									size="sm"
									onClick={() => {
										setMin(preset.min);
										setMax(preset.max);
										setCount(preset.count);
										setUnique(true);
									}}
								>
									{preset.label}
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
