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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRightLeft, Copy, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/unitConverter")({
	component: UnitConverter,
});

type Category =
	| "length"
	| "weight"
	| "temperature"
	| "area"
	| "volume"
	| "speed"
	| "time"
	| "data";

interface UnitDef {
	name: string;
	symbol: string;
	toBase: (v: number) => number;
	fromBase: (v: number) => number;
}

const units: Record<Category, UnitDef[]> = {
	length: [
		{
			name: "千米",
			symbol: "km",
			toBase: (v) => v * 1000,
			fromBase: (v) => v / 1000,
		},
		{ name: "米", symbol: "m", toBase: (v) => v, fromBase: (v) => v },
		{
			name: "分米",
			symbol: "dm",
			toBase: (v) => v * 0.1,
			fromBase: (v) => v / 0.1,
		},
		{
			name: "厘米",
			symbol: "cm",
			toBase: (v) => v * 0.01,
			fromBase: (v) => v / 0.01,
		},
		{
			name: "毫米",
			symbol: "mm",
			toBase: (v) => v * 0.001,
			fromBase: (v) => v / 0.001,
		},
		{
			name: "微米",
			symbol: "μm",
			toBase: (v) => v * 1e-6,
			fromBase: (v) => v / 1e-6,
		},
		{
			name: "纳米",
			symbol: "nm",
			toBase: (v) => v * 1e-9,
			fromBase: (v) => v / 1e-9,
		},
		{
			name: "英里",
			symbol: "mi",
			toBase: (v) => v * 1609.344,
			fromBase: (v) => v / 1609.344,
		},
		{
			name: "码",
			symbol: "yd",
			toBase: (v) => v * 0.9144,
			fromBase: (v) => v / 0.9144,
		},
		{
			name: "英尺",
			symbol: "ft",
			toBase: (v) => v * 0.3048,
			fromBase: (v) => v / 0.3048,
		},
		{
			name: "英寸",
			symbol: "in",
			toBase: (v) => v * 0.0254,
			fromBase: (v) => v / 0.0254,
		},
		{
			name: "海里",
			symbol: "nmi",
			toBase: (v) => v * 1852,
			fromBase: (v) => v / 1852,
		},
	],
	weight: [
		{
			name: "吨",
			symbol: "t",
			toBase: (v) => v * 1000,
			fromBase: (v) => v / 1000,
		},
		{ name: "千克", symbol: "kg", toBase: (v) => v, fromBase: (v) => v },
		{
			name: "克",
			symbol: "g",
			toBase: (v) => v * 0.001,
			fromBase: (v) => v / 0.001,
		},
		{
			name: "毫克",
			symbol: "mg",
			toBase: (v) => v * 1e-6,
			fromBase: (v) => v / 1e-6,
		},
		{
			name: "微克",
			symbol: "μg",
			toBase: (v) => v * 1e-9,
			fromBase: (v) => v / 1e-9,
		},
		{
			name: "磅",
			symbol: "lb",
			toBase: (v) => v * 0.453592,
			fromBase: (v) => v / 0.453592,
		},
		{
			name: "盎司",
			symbol: "oz",
			toBase: (v) => v * 0.0283495,
			fromBase: (v) => v / 0.0283495,
		},
		{
			name: "斤",
			symbol: "斤",
			toBase: (v) => v * 0.5,
			fromBase: (v) => v / 0.5,
		},
		{
			name: "两",
			symbol: "两",
			toBase: (v) => v * 0.05,
			fromBase: (v) => v / 0.05,
		},
	],
	temperature: [
		{ name: "摄氏度", symbol: "°C", toBase: (v) => v, fromBase: (v) => v },
		{
			name: "华氏度",
			symbol: "°F",
			toBase: (v) => ((v - 32) * 5) / 9,
			fromBase: (v) => (v * 9) / 5 + 32,
		},
		{
			name: "开尔文",
			symbol: "K",
			toBase: (v) => v - 273.15,
			fromBase: (v) => v + 273.15,
		},
	],
	area: [
		{
			name: "平方千米",
			symbol: "km²",
			toBase: (v) => v * 1e6,
			fromBase: (v) => v / 1e6,
		},
		{
			name: "公顷",
			symbol: "ha",
			toBase: (v) => v * 1e4,
			fromBase: (v) => v / 1e4,
		},
		{
			name: "公亩",
			symbol: "are",
			toBase: (v) => v * 100,
			fromBase: (v) => v / 100,
		},
		{ name: "平方米", symbol: "m²", toBase: (v) => v, fromBase: (v) => v },
		{
			name: "平方分米",
			symbol: "dm²",
			toBase: (v) => v * 0.01,
			fromBase: (v) => v / 0.01,
		},
		{
			name: "平方厘米",
			symbol: "cm²",
			toBase: (v) => v * 0.0001,
			fromBase: (v) => v / 0.0001,
		},
		{
			name: "平方毫米",
			symbol: "mm²",
			toBase: (v) => v * 1e-6,
			fromBase: (v) => v / 1e-6,
		},
		{
			name: "英亩",
			symbol: "acre",
			toBase: (v) => v * 4046.86,
			fromBase: (v) => v / 4046.86,
		},
		{
			name: "亩",
			symbol: "亩",
			toBase: (v) => v * 666.667,
			fromBase: (v) => v / 666.667,
		},
	],
	volume: [
		{ name: "立方米", symbol: "m³", toBase: (v) => v, fromBase: (v) => v },
		{
			name: "升",
			symbol: "L",
			toBase: (v) => v * 0.001,
			fromBase: (v) => v / 0.001,
		},
		{
			name: "毫升",
			symbol: "mL",
			toBase: (v) => v * 1e-6,
			fromBase: (v) => v / 1e-6,
		},
		{
			name: "立方厘米",
			symbol: "cm³",
			toBase: (v) => v * 1e-6,
			fromBase: (v) => v / 1e-6,
		},
		{
			name: "立方分米",
			symbol: "dm³",
			toBase: (v) => v * 0.001,
			fromBase: (v) => v / 0.001,
		},
		{
			name: "加仑(美)",
			symbol: "gal",
			toBase: (v) => v * 0.00378541,
			fromBase: (v) => v / 0.00378541,
		},
		{
			name: "加仑(英)",
			symbol: "gal(UK)",
			toBase: (v) => v * 0.00454609,
			fromBase: (v) => v / 0.00454609,
		},
	],
	speed: [
		{ name: "米/秒", symbol: "m/s", toBase: (v) => v, fromBase: (v) => v },
		{
			name: "千米/时",
			symbol: "km/h",
			toBase: (v) => v / 3.6,
			fromBase: (v) => v * 3.6,
		},
		{
			name: "英里/时",
			symbol: "mph",
			toBase: (v) => v * 0.44704,
			fromBase: (v) => v / 0.44704,
		},
		{
			name: "节",
			symbol: "kn",
			toBase: (v) => v * 0.514444,
			fromBase: (v) => v / 0.514444,
		},
		{
			name: "英尺/秒",
			symbol: "ft/s",
			toBase: (v) => v * 0.3048,
			fromBase: (v) => v / 0.3048,
		},
		{
			name: "马赫",
			symbol: "Ma",
			toBase: (v) => v * 340.3,
			fromBase: (v) => v / 340.3,
		},
	],
	time: [
		{
			name: "年",
			symbol: "y",
			toBase: (v) => v * 31536000,
			fromBase: (v) => v / 31536000,
		},
		{
			name: "周",
			symbol: "w",
			toBase: (v) => v * 604800,
			fromBase: (v) => v / 604800,
		},
		{
			name: "天",
			symbol: "d",
			toBase: (v) => v * 86400,
			fromBase: (v) => v / 86400,
		},
		{
			name: "小时",
			symbol: "h",
			toBase: (v) => v * 3600,
			fromBase: (v) => v / 3600,
		},
		{
			name: "分钟",
			symbol: "min",
			toBase: (v) => v * 60,
			fromBase: (v) => v / 60,
		},
		{ name: "秒", symbol: "s", toBase: (v) => v, fromBase: (v) => v },
		{
			name: "毫秒",
			symbol: "ms",
			toBase: (v) => v * 0.001,
			fromBase: (v) => v / 0.001,
		},
		{
			name: "微秒",
			symbol: "μs",
			toBase: (v) => v * 1e-6,
			fromBase: (v) => v / 1e-6,
		},
		{
			name: "纳秒",
			symbol: "ns",
			toBase: (v) => v * 1e-9,
			fromBase: (v) => v / 1e-9,
		},
	],
	data: [
		{ name: "字节", symbol: "B", toBase: (v) => v, fromBase: (v) => v },
		{
			name: "千字节",
			symbol: "KB",
			toBase: (v) => v * 1024,
			fromBase: (v) => v / 1024,
		},
		{
			name: "兆字节",
			symbol: "MB",
			toBase: (v) => v * 1048576,
			fromBase: (v) => v / 1048576,
		},
		{
			name: "吉字节",
			symbol: "GB",
			toBase: (v) => v * 1073741824,
			fromBase: (v) => v / 1073741824,
		},
		{
			name: "太字节",
			symbol: "TB",
			toBase: (v) => v * 1099511627776,
			fromBase: (v) => v / 1099511627776,
		},
		{
			name: "比特",
			symbol: "bit",
			toBase: (v) => v * 0.125,
			fromBase: (v) => v / 0.125,
		},
		{
			name: "千比特",
			symbol: "Kb",
			toBase: (v) => v * 128,
			fromBase: (v) => v / 128,
		},
		{
			name: "兆比特",
			symbol: "Mb",
			toBase: (v) => v * 131072,
			fromBase: (v) => v / 131072,
		},
	],
};

const categoryNames: Record<Category, string> = {
	length: "长度",
	weight: "重量",
	temperature: "温度",
	area: "面积",
	volume: "体积",
	speed: "速度",
	time: "时间",
	data: "数据",
};

function UnitConverter() {
	const navigate = useNavigate();
	const [category, setCategory] = useState<Category>("length");
	const [fromUnit, setFromUnit] = useState(0);
	const [toUnit, setToUnit] = useState(1);
	const [inputValue, setInputValue] = useState("");

	const currentUnits = units[category];

	const result = useMemo(() => {
		if (!inputValue || isNaN(Number(inputValue))) return "";
		const value = parseFloat(inputValue);
		const from = currentUnits[fromUnit];
		const to = currentUnits[toUnit];
		const baseValue = from.toBase(value);
		const resultValue = to.fromBase(baseValue);
		return resultValue.toPrecision(10).replace(/\.?0+$/, "");
	}, [inputValue, fromUnit, toUnit, currentUnits]);

	const handleCategoryChange = (value: string) => {
		setCategory(value as Category);
		setFromUnit(0);
		setToUnit(1);
		setInputValue("");
	};

	const swapUnits = () => {
		const temp = fromUnit;
		setFromUnit(toUnit);
		setToUnit(temp);
		if (result) setInputValue(result);
	};

	const copyResult = () => {
		if (!result) return;
		copyToClipboard(result);
		toast.success("已复制结果");
	};

	const copyFormula = () => {
		if (!inputValue || !result) return;
		const from = currentUnits[fromUnit];
		const to = currentUnits[toUnit];
		copyToClipboard(`${inputValue} ${from.symbol} = ${result} ${to.symbol}`);
		toast.success("已复制转换公式");
	};

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-2xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							单位转换器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										支持长度、重量、温度、面积、体积、速度、时间、数据等单位转换。
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
					{/* 类别选择 */}
					<Tabs value={category} onValueChange={handleCategoryChange}>
						<TabsList className="grid grid-cols-4 lg:grid-cols-8 h-auto">
							{(Object.keys(categoryNames) as Category[]).map((cat) => (
								<TabsTrigger key={cat} value={cat} className="text-xs py-1.5">
									{categoryNames[cat]}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>

					{/* 转换区域 */}
					<div className="space-y-4">
						{/* 从 */}
						<div className="space-y-2">
							<Label className="text-sm text-gray-500">从</Label>
							<div className="flex gap-3">
								<Input
									type="number"
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									placeholder="输入数值"
									className="flex-1 h-12 text-lg font-mono"
								/>
								<Select
									value={String(fromUnit)}
									onValueChange={(v) => setFromUnit(parseInt(v))}
								>
									<SelectTrigger className="w-32 h-12">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{currentUnits.map((unit, i) => (
											<SelectItem key={i} value={String(i)}>
												{unit.name} ({unit.symbol})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* 交换按钮 */}
						<div className="flex justify-center">
							<Button
								variant="outline"
								size="icon"
								onClick={swapUnits}
								className="rounded-full h-10 w-10"
							>
								<ArrowRightLeft className="h-4 w-4 rotate-90" />
							</Button>
						</div>

						{/* 到 */}
						<div className="space-y-2">
							<Label className="text-sm text-gray-500">到</Label>
							<div className="flex gap-3">
								<Input
									value={result}
									readOnly
									placeholder="结果"
									className="flex-1 h-12 text-lg font-mono bg-blue-50"
								/>
								<Select
									value={String(toUnit)}
									onValueChange={(v) => setToUnit(parseInt(v))}
								>
									<SelectTrigger className="w-32 h-12">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{currentUnits.map((unit, i) => (
											<SelectItem key={i} value={String(i)}>
												{unit.name} ({unit.symbol})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					</div>

					{/* 转换公式 */}
					{inputValue && result && (
						<div className="p-3 bg-gray-50 rounded-lg text-center">
							<span className="font-mono text-sm">
								{inputValue} {currentUnits[fromUnit].symbol} = {result}{" "}
								{currentUnits[toUnit].symbol}
							</span>
						</div>
					)}

					{/* 操作按钮 */}
					<div className="flex gap-3">
						<Button
							onClick={copyResult}
							variant="outline"
							className="flex-1"
							disabled={!result}
						>
							<Copy className="h-4 w-4 mr-2" />
							复制结果
						</Button>
						<Button
							onClick={copyFormula}
							variant="outline"
							className="flex-1"
							disabled={!result}
						>
							<Copy className="h-4 w-4 mr-2" />
							复制公式
						</Button>
					</div>

					{/* 快速转换 */}
					<div className="space-y-2">
						<Label className="text-sm text-gray-500">快速转换</Label>
						<div className="flex flex-wrap gap-2">
							{[1, 10, 100, 1000, 10000].map((v) => (
								<Button
									key={v}
									variant="outline"
									size="sm"
									onClick={() => setInputValue(String(v))}
									className={`text-xs ${inputValue === String(v) ? "bg-blue-100 border-blue-300" : ""}`}
								>
									{v}
								</Button>
							))}
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
