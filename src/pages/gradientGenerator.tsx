import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Info, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/gradientGenerator")({
	component: GradientGenerator,
});

type GradientType = "linear" | "radial" | "conic";
type RadialShape = "circle" | "ellipse";
type RadialPosition =
	| "center"
	| "top"
	| "bottom"
	| "left"
	| "right"
	| "top-left"
	| "top-right"
	| "bottom-left"
	| "bottom-right";

interface ColorStop {
	id: number;
	color: string;
	position: number;
}

let idCounter = 0;

function createColorStop(color: string, position: number): ColorStop {
	return { id: idCounter++, color, position };
}

const presetGradients = [
	{ name: "日落", colors: ["#ff6b6b", "#feca57", "#ff9ff3"] },
	{ name: "海洋", colors: ["#667eea", "#764ba2"] },
	{ name: "森林", colors: ["#11998e", "#38ef7d"] },
	{ name: "火焰", colors: ["#f12711", "#f5af19"] },
	{ name: "星空", colors: ["#0f0c29", "#302b63", "#24243e"] },
	{
		name: "彩虹",
		colors: ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#8b00ff"],
	},
];

function GradientGenerator() {
	const navigate = useNavigate();
	const [gradientType, setGradientType] = useState<GradientType>("linear");
	const [angle, setAngle] = useState(90);
	const [radialShape, setRadialShape] = useState<RadialShape>("circle");
	const [radialPosition, setRadialPosition] =
		useState<RadialPosition>("center");
	const [colorStops, setColorStops] = useState<ColorStop[]>([
		createColorStop("#667eea", 0),
		createColorStop("#764ba2", 100),
	]);

	const positionMap: Record<RadialPosition, string> = {
		center: "center",
		top: "top",
		bottom: "bottom",
		left: "left",
		right: "right",
		"top-left": "top left",
		"top-right": "top right",
		"bottom-left": "bottom left",
		"bottom-right": "bottom right",
	};

	const cssCode = useMemo(() => {
		const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
		const stopsStr = sortedStops
			.map((s) => `${s.color} ${s.position}%`)
			.join(", ");

		if (gradientType === "linear") {
			return `linear-gradient(${angle}deg, ${stopsStr})`;
		} else if (gradientType === "radial") {
			return `radial-gradient(${radialShape} at ${positionMap[radialPosition]}, ${stopsStr})`;
		} else {
			return `conic-gradient(from ${angle}deg at ${positionMap[radialPosition]}, ${stopsStr})`;
		}
	}, [colorStops, gradientType, angle, radialShape, radialPosition]);

	const addColorStop = () => {
		const lastStop = colorStops[colorStops.length - 1];
		const newPosition = Math.min(lastStop.position + 10, 100);
		setColorStops([...colorStops, createColorStop("#ffffff", newPosition)]);
	};

	const removeColorStop = (id: number) => {
		if (colorStops.length <= 2) {
			toast.error("至少需要两个颜色节点");
			return;
		}
		setColorStops(colorStops.filter((s) => s.id !== id));
	};

	const updateColorStop = (id: number, updates: Partial<ColorStop>) => {
		setColorStops(
			colorStops.map((s) => (s.id === id ? { ...s, ...updates } : s)),
		);
	};

	const loadPreset = (preset: (typeof presetGradients)[0]) => {
		const stops = preset.colors.map((color, index) =>
			createColorStop(
				color,
				Math.round((index / (preset.colors.length - 1)) * 100),
			),
		);
		setColorStops(stops);
		toast.success(`已加载 "${preset.name}" 渐变`);
	};

	const copyCode = () => {
		const fullCode = `background: ${cssCode};`;
		copyToClipboard(fullCode);
	};

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-5xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							CSS 渐变生成器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg">
										<p className="text-xs text-blue-600">
											支持线性渐变、径向渐变和锥形渐变。可自定义颜色节点、角度和位置。
										</p>
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
				<CardContent className="flex-1 min-h-0 p-4">
					<div className="h-full grid grid-cols-2 gap-4">
						{/* 左侧：配置 */}
						<div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
							{/* 渐变类型 */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">渐变类型</Label>
								<Select
									value={gradientType}
									onValueChange={(v) => setGradientType(v as GradientType)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="linear">
											线性渐变 (linear-gradient)
										</SelectItem>
										<SelectItem value="radial">
											径向渐变 (radial-gradient)
										</SelectItem>
										<SelectItem value="conic">
											锥形渐变 (conic-gradient)
										</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{/* 角度 */}
							{(gradientType === "linear" || gradientType === "conic") && (
								<div className="space-y-2">
									<div className="flex justify-between items-center">
										<Label className="text-sm font-medium">角度</Label>
										<span className="text-xs text-gray-500 w-12 text-right">
											{angle}°
										</span>
									</div>
									<Slider
										value={[angle]}
										onValueChange={(v) => setAngle(v[0])}
										min={0}
										max={360}
										step={1}
									/>
								</div>
							)}

							{/* 径向渐变选项 */}
							{(gradientType === "radial" || gradientType === "conic") && (
								<div className="grid grid-cols-2 gap-3">
									{gradientType === "radial" && (
										<div className="space-y-2">
											<Label className="text-sm font-medium">形状</Label>
											<Select
												value={radialShape}
												onValueChange={(v) => setRadialShape(v as RadialShape)}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="circle">圆形 (circle)</SelectItem>
													<SelectItem value="ellipse">
														椭圆 (ellipse)
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									)}
									<div className="space-y-2">
										<Label className="text-sm font-medium">位置</Label>
										<Select
											value={radialPosition}
											onValueChange={(v) =>
												setRadialPosition(v as RadialPosition)
											}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="center">居中</SelectItem>
												<SelectItem value="top">顶部</SelectItem>
												<SelectItem value="bottom">底部</SelectItem>
												<SelectItem value="left">左侧</SelectItem>
												<SelectItem value="right">右侧</SelectItem>
												<SelectItem value="top-left">左上</SelectItem>
												<SelectItem value="top-right">右上</SelectItem>
												<SelectItem value="bottom-left">左下</SelectItem>
												<SelectItem value="bottom-right">右下</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>
							)}

							{/* 颜色节点 */}
							<div className="space-y-2 flex-1 min-h-0 flex flex-col">
								<div className="flex justify-between items-center">
									<Label className="text-sm font-medium">颜色节点</Label>
									<Button
										onClick={addColorStop}
										variant="outline"
										size="sm"
										className="h-7"
									>
										<Plus className="h-3 w-3 mr-1" />
										添加
									</Button>
								</div>
								<div className="flex-1 min-h-0 overflow-y-auto space-y-2 border rounded-lg p-3 bg-gray-50">
									{colorStops.map((stop) => (
										<div
											key={stop.id}
											className="flex items-center gap-2 bg-white p-2 rounded border"
										>
											<input
												type="color"
												value={stop.color}
												onChange={(e) =>
													updateColorStop(stop.id, { color: e.target.value })
												}
												className="w-8 h-8 rounded cursor-pointer border-0 p-0"
											/>
											<Input
												value={stop.color}
												onChange={(e) =>
													updateColorStop(stop.id, { color: e.target.value })
												}
												className="w-24 h-8 text-xs font-mono"
											/>
											<div className="flex-1 flex items-center gap-2">
												<Slider
													value={[stop.position]}
													onValueChange={(v) =>
														updateColorStop(stop.id, { position: v[0] })
													}
													min={0}
													max={100}
													step={1}
												/>
												<span className="text-xs text-gray-500 w-8">
													{stop.position}%
												</span>
											</div>
											<Button
												variant="ghost"
												size="sm"
												className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
												onClick={() => removeColorStop(stop.id)}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									))}
								</div>
							</div>

							{/* 预设渐变 */}
							<div className="space-y-2">
								<Label className="text-sm font-medium">预设渐变</Label>
								<div className="grid grid-cols-6 gap-2">
									{presetGradients.map((preset) => (
										<button
											key={preset.name}
											onClick={() => loadPreset(preset)}
											className="h-10 rounded-lg border-2 border-transparent hover:border-blue-400 transition-colors cursor-pointer"
											style={{
												background: `linear-gradient(90deg, ${preset.colors.join(", ")})`,
											}}
											title={preset.name}
										/>
									))}
								</div>
							</div>
						</div>

						{/* 右侧：预览和代码 */}
						<div className="flex flex-col gap-3 min-h-0">
							{/* 预览 */}
							<div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
								<div
									className="w-full h-full"
									style={{
										background: cssCode,
										backgroundImage: cssCode,
									}}
								/>
							</div>

							{/* CSS 代码 */}
							<div className="border rounded-lg overflow-hidden flex-shrink-0">
								<div className="flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
									<span className="font-semibold text-sm text-gray-700">
										CSS 代码
									</span>
									<Button
										size="sm"
										variant="ghost"
										className="h-6 px-2"
										onClick={copyCode}
									>
										<Copy className="h-3 w-3 mr-1" />
										<span className="text-xs">复制</span>
									</Button>
								</div>
								<pre className="p-3 text-xs font-mono bg-white max-h-32 overflow-auto break-all whitespace-pre-wrap">
									{`background: ${cssCode};`}
								</pre>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
