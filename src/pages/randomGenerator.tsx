import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useClear, useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Shuffle, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/randomGenerator")({
	component: RandomGenerator,
});

function RandomGenerator() {
	const { copy } = useCopy();
	const [min, setMin] = useState(1);
	const [max, setMax] = useState(100);
	const [count, setCount] = useState(1);
	const [unique, setUnique] = useState(true);
	const [sort, setSort] = useState(false);
	const [results, setResults] = useState<number[]>([]);
	const { clear } = useClear(() => setResults([]));

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
			const pool = Array.from({ length: range }, (_, i) => min + i);
			for (let i = pool.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[pool[i], pool[j]] = [pool[j], pool[i]];
			}
			randomValues.push(...pool.slice(0, count));
		} else {
			for (let i = 0; i < count; i++)
				randomValues.push(Math.floor(Math.random() * range) + min);
		}
		if (sort) randomValues.sort((a, b) => a - b);
		setResults(randomValues);
	}, [min, max, count, unique, sort]);

	return (
		<ToolPage
			title="随机数生成器"
			description="使用加密级随机数生成器，支持指定范围、数量和不重复模式。"
			maxWidth="max-w-2xl"
		>
			<div className="h-full flex flex-col justify-center gap-6">
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

				<div className="flex gap-3">
					<Button onClick={generate} className="flex-1 h-12">
						<Shuffle className="h-4 w-4 mr-2" />
						生成随机数
					</Button>
					<Button
						onClick={() => copy(results.join(", "), "结果")}
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
									onClick={() => copy(String(num))}
								>
									{num}
								</span>
							))}
						</div>
					</div>
				)}

				<div className="space-y-2">
					<Label className="text-sm text-gray-500">快捷预设</Label>
					<div className="flex flex-wrap gap-2">
						{[
							{ label: "骰子", min: 1, max: 6, count: 1 },
							{ label: "硬币", min: 0, max: 1, count: 1 },
							{ label: "彩票", min: 1, max: 33, count: 6 },
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
			</div>
		</ToolPage>
	);
}
