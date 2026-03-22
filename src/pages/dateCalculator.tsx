import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Clock, Copy, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dateCalculator")({
	component: DateCalculator,
});

interface DateDiff {
	years: number;
	months: number;
	days: number;
	totalDays: number;
	totalHours: number;
	totalMinutes: number;
	totalSeconds: number;
	totalWeeks: number;
}

function DateCalculator() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<"diff" | "add">("diff");

	// 日期差计算
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	// 日期加减
	const [baseDate, setBaseDate] = useState("");
	const [addYears, setAddYears] = useState("0");
	const [addMonths, setAddMonths] = useState("0");
	const [addDays, setAddDays] = useState("0");

	// 计算日期差
	const dateDiff = useMemo((): DateDiff | null => {
		if (!startDate || !endDate) return null;

		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

		const totalMs = Math.abs(end.getTime() - start.getTime());
		const totalSeconds = Math.floor(totalMs / 1000);
		const totalMinutes = Math.floor(totalSeconds / 60);
		const totalHours = Math.floor(totalMinutes / 60);
		const totalDays = Math.floor(totalHours / 24);
		const totalWeeks = Math.floor(totalDays / 7);

		// 计算年月日
		let years = end.getFullYear() - start.getFullYear();
		let months = end.getMonth() - start.getMonth();
		let days = end.getDate() - start.getDate();

		if (days < 0) {
			months--;
			const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
			days += prevMonth.getDate();
		}

		if (months < 0) {
			years--;
			months += 12;
		}

		return {
			years,
			months,
			days,
			totalDays,
			totalHours,
			totalMinutes,
			totalSeconds,
			totalWeeks,
		};
	}, [startDate, endDate]);

	// 计算日期加减结果
	const addResult = useMemo(() => {
		if (!baseDate) return null;

		const base = new Date(baseDate);
		if (isNaN(base.getTime())) return null;

		const result = new Date(base);
		result.setFullYear(result.getFullYear() + parseInt(addYears) || 0);
		result.setMonth(result.getMonth() + parseInt(addMonths) || 0);
		result.setDate(result.getDate() + parseInt(addDays) || 0);

		return result;
	}, [baseDate, addYears, addMonths, addDays]);

	const formatDate = (date: Date) => {
		return date.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			weekday: "long",
		});
	};

	const getToday = () => {
		return new Date().toISOString().split("T")[0];
	};

	const swapDates = () => {
		const temp = startDate;
		setStartDate(endDate);
		setEndDate(temp);
	};

	const copyDiff = () => {
		if (!dateDiff) return;
		const text = `${startDate} 到 ${endDate}\n相差 ${dateDiff.years}年${dateDiff.months}月${dateDiff.days}天\n共 ${dateDiff.totalDays} 天 / ${dateDiff.totalWeeks} 周`;
		copyToClipboard(text);
		toast.success("已复制");
	};

	const copyAddResult = () => {
		if (!addResult) return;
		copyToClipboard(formatDate(addResult));
		toast.success("已复制");
	};

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full max-w-2xl mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							日期计算器
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										计算两个日期之间的差值，或计算某日期加减天数后的结果。
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
				<CardContent className="flex-1 min-h-0 p-6 flex flex-col gap-6 overflow-y-auto">
					{/* 模式选择 */}
					<Tabs
						value={mode}
						onValueChange={(v) => setMode(v as "diff" | "add")}
					>
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="diff" className="flex items-center gap-2">
								<Calendar className="h-4 w-4" />
								日期差计算
							</TabsTrigger>
							<TabsTrigger value="add" className="flex items-center gap-2">
								<Clock className="h-4 w-4" />
								日期加减
							</TabsTrigger>
						</TabsList>
					</Tabs>

					{mode === "diff" ? (
						<>
							{/* 日期差计算 */}
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>开始日期</Label>
									<div className="flex gap-2">
										<Input
											type="date"
											value={startDate}
											onChange={(e) => setStartDate(e.target.value)}
											className="flex-1 h-12"
										/>
										<Button
											variant="outline"
											onClick={() => setStartDate(getToday())}
										>
											今天
										</Button>
									</div>
								</div>

								<div className="flex justify-center">
									<Button
										variant="outline"
										size="icon"
										onClick={swapDates}
										className="rounded-full h-10 w-10"
									>
										<ArrowLeft className="h-4 w-4 rotate-90" />
									</Button>
								</div>

								<div className="space-y-2">
									<Label>结束日期</Label>
									<div className="flex gap-2">
										<Input
											type="date"
											value={endDate}
											onChange={(e) => setEndDate(e.target.value)}
											className="flex-1 h-12"
										/>
										<Button
											variant="outline"
											onClick={() => setEndDate(getToday())}
										>
											今天
										</Button>
									</div>
								</div>
							</div>

							{/* 结果 */}
							{dateDiff && (
								<div className="space-y-4">
									<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
										<div className="text-center">
											<div className="text-2xl font-bold text-blue-700">
												{dateDiff.years} 年 {dateDiff.months} 月 {dateDiff.days}{" "}
												天
											</div>
											<div className="text-sm text-blue-600 mt-1">
												{startDate <= endDate ? "正向间隔" : "反向间隔"}
											</div>
										</div>
									</div>

									<div className="grid grid-cols-4 gap-2">
										<div className="p-3 bg-gray-50 rounded-lg text-center">
											<div className="text-lg font-bold text-gray-700">
												{dateDiff.totalDays}
											</div>
											<div className="text-xs text-gray-500">天</div>
										</div>
										<div className="p-3 bg-gray-50 rounded-lg text-center">
											<div className="text-lg font-bold text-gray-700">
												{dateDiff.totalWeeks}
											</div>
											<div className="text-xs text-gray-500">周</div>
										</div>
										<div className="p-3 bg-gray-50 rounded-lg text-center">
											<div className="text-lg font-bold text-gray-700">
												{dateDiff.totalHours}
											</div>
											<div className="text-xs text-gray-500">小时</div>
										</div>
										<div className="p-3 bg-gray-50 rounded-lg text-center">
											<div className="text-lg font-bold text-gray-700">
												{dateDiff.totalMinutes}
											</div>
											<div className="text-xs text-gray-500">分钟</div>
										</div>
									</div>

									<Button
										onClick={copyDiff}
										variant="outline"
										className="w-full"
									>
										<Copy className="h-4 w-4 mr-2" />
										复制结果
									</Button>
								</div>
							)}
						</>
					) : (
						<>
							{/* 日期加减 */}
							<div className="space-y-4">
								<div className="space-y-2">
									<Label>基准日期</Label>
									<div className="flex gap-2">
										<Input
											type="date"
											value={baseDate}
											onChange={(e) => setBaseDate(e.target.value)}
											className="flex-1 h-12"
										/>
										<Button
											variant="outline"
											onClick={() => setBaseDate(getToday())}
										>
											今天
										</Button>
									</div>
								</div>

								<div className="grid grid-cols-3 gap-3">
									<div className="space-y-2">
										<Label>年</Label>
										<Input
											type="number"
											value={addYears}
											onChange={(e) => setAddYears(e.target.value)}
											placeholder="0"
											className="h-12 text-center"
										/>
									</div>
									<div className="space-y-2">
										<Label>月</Label>
										<Input
											type="number"
											value={addMonths}
											onChange={(e) => setAddMonths(e.target.value)}
											placeholder="0"
											className="h-12 text-center"
										/>
									</div>
									<div className="space-y-2">
										<Label>天</Label>
										<Input
											type="number"
											value={addDays}
											onChange={(e) => setAddDays(e.target.value)}
											placeholder="0"
											className="h-12 text-center"
										/>
									</div>
								</div>

								{/* 快捷按钮 */}
								<div className="flex flex-wrap gap-2">
									{[
										{ label: "+1天", d: 1, m: 0, y: 0 },
										{ label: "+7天", d: 7, m: 0, y: 0 },
										{ label: "+30天", d: 30, m: 0, y: 0 },
										{ label: "+1年", d: 0, m: 0, y: 1 },
										{ label: "-1天", d: -1, m: 0, y: 0 },
										{ label: "-7天", d: -7, m: 0, y: 0 },
										{ label: "-30天", d: -30, m: 0, y: 0 },
										{ label: "-1年", d: 0, m: 0, y: -1 },
									].map((item, i) => (
										<Button
											key={i}
											variant="outline"
											size="sm"
											onClick={() => {
												setAddYears(String(item.y));
												setAddMonths(String(item.m));
												setAddDays(String(item.d));
											}}
										>
											{item.label}
										</Button>
									))}
								</div>
							</div>

							{/* 结果 */}
							{addResult && (
								<div className="space-y-4">
									<div className="p-4 bg-green-50 rounded-lg border border-green-200">
										<div className="text-center">
											<div className="text-sm text-green-600 mb-1">
												计算结果
											</div>
											<div className="text-xl font-bold text-green-700">
												{formatDate(addResult)}
											</div>
										</div>
									</div>

									<Button
										onClick={copyAddResult}
										variant="outline"
										className="w-full"
									>
										<Copy className="h-4 w-4 mr-2" />
										复制日期
									</Button>
								</div>
							)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
