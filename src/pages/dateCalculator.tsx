import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightLeft, Calendar, Clock } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/dateCalculator")({
	component: DateCalculator,
});

function DateCalculator() {
	const { copy } = useCopy();
	const [mode, setMode] = useState<"diff" | "add">("diff");
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [baseDate, setBaseDate] = useState("");
	const [addYears, setAddYears] = useState("0");
	const [addMonths, setAddMonths] = useState("0");
	const [addDays, setAddDays] = useState("0");

	const getToday = () => new Date().toISOString().split("T")[0];

	const dateDiff = useMemo(() => {
		if (!startDate || !endDate) return null;
		const start = new Date(startDate);
		const end = new Date(endDate);
		if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

		const totalMs = Math.abs(end.getTime() - start.getTime());
		const totalDays = Math.floor(totalMs / (1000 * 60 * 60 * 24));
		const totalWeeks = Math.floor(totalDays / 7);
		const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
		const totalMinutes = Math.floor(totalMs / (1000 * 60));

		let years = end.getFullYear() - start.getFullYear();
		let months = end.getMonth() - start.getMonth();
		let days = end.getDate() - start.getDate();
		if (days < 0) {
			months--;
			days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
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
			totalWeeks,
			totalHours,
			totalMinutes,
		};
	}, [startDate, endDate]);

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

	const formatDate = (date: Date) =>
		date.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			weekday: "long",
		});

	return (
		<ToolPage
			title="日期计算器"
			description="计算两个日期之间的差值，或计算某日期加减天数后的结果。"
		>
			<div className="h-full overflow-y-auto space-y-6">
				<Tabs value={mode} onValueChange={(v) => setMode(v as "diff" | "add")}>
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
								<ArrowRightLeft className="h-5 w-5 text-gray-400" />
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

						{dateDiff && (
							<div className="space-y-4">
								<div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
									<div className="text-2xl font-bold text-blue-700">
										{dateDiff.years} 年 {dateDiff.months} 月 {dateDiff.days} 天
									</div>
								</div>
								<div className="grid grid-cols-4 gap-2">
									{[
										{ label: "天", value: dateDiff.totalDays },
										{ label: "周", value: dateDiff.totalWeeks },
										{ label: "小时", value: dateDiff.totalHours },
										{ label: "分钟", value: dateDiff.totalMinutes },
									].map((item) => (
										<div
											key={item.label}
											className="p-3 bg-gray-50 rounded-lg text-center"
										>
											<div className="text-lg font-bold text-gray-700">
												{item.value}
											</div>
											<div className="text-xs text-gray-500">{item.label}</div>
										</div>
									))}
								</div>
								<Button
									onClick={() =>
										copy(
											`${startDate} 到 ${endDate}\n相差 ${dateDiff.years}年${dateDiff.months}月${dateDiff.days}天`,
											"结果",
										)
									}
									variant="outline"
									className="w-full"
								>
									复制结果
								</Button>
							</div>
						)}
					</>
				) : (
					<>
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
										className="h-12 text-center"
									/>
								</div>
								<div className="space-y-2">
									<Label>月</Label>
									<Input
										type="number"
										value={addMonths}
										onChange={(e) => setAddMonths(e.target.value)}
										className="h-12 text-center"
									/>
								</div>
								<div className="space-y-2">
									<Label>天</Label>
									<Input
										type="number"
										value={addDays}
										onChange={(e) => setAddDays(e.target.value)}
										className="h-12 text-center"
									/>
								</div>
							</div>
							<div className="flex flex-wrap gap-2">
								{[
									{ label: "+1天", d: 1 },
									{ label: "+7天", d: 7 },
									{ label: "+30天", d: 30 },
									{ label: "+1年", y: 1 },
									{ label: "-1天", d: -1 },
									{ label: "-7天", d: -7 },
									{ label: "-30天", d: -30 },
									{ label: "-1年", y: -1 },
								].map((item, i) => (
									<Button
										key={i}
										variant="outline"
										size="sm"
										onClick={() => {
											setAddYears(String(item.y || 0));
											setAddMonths("0");
											setAddDays(String(item.d || 0));
										}}
									>
										{item.label}
									</Button>
								))}
							</div>
						</div>
						{addResult && (
							<div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
								<div className="text-sm text-green-600 mb-1">计算结果</div>
								<div className="text-xl font-bold text-green-700">
									{formatDate(addResult)}
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</ToolPage>
	);
}
