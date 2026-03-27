import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cronParser")({
	component: CronParser,
});

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const MONTHS = [
	"1月",
	"2月",
	"3月",
	"4月",
	"5月",
	"6月",
	"7月",
	"8月",
	"9月",
	"10月",
	"11月",
	"12月",
];

function parseCronField(
	value: string,
	min: number,
	max: number,
	names?: string[],
): string[] {
	if (value === "*")
		return Array.from({ length: max - min + 1 }, (_, i) => String(min + i));

	const results: number[] = [];
	const parts = value.split(",");

	for (const part of parts) {
		if (part.includes("/")) {
			const [range, step] = part.split("/");
			const stepNum = parseInt(step);
			let start = min;
			let end = max;
			if (range !== "*") {
				if (range.includes("-")) {
					const [s, e] = range.split("-").map(Number);
					start = s;
					end = e;
				} else {
					start = parseInt(range);
				}
			}
			for (let i = start; i <= end; i += stepNum) {
				if (!results.includes(i)) results.push(i);
			}
		} else if (part.includes("-")) {
			const [start, end] = part.split("-").map(Number);
			for (let i = start; i <= end; i++) {
				if (!results.includes(i)) results.push(i);
			}
		} else {
			const num = parseInt(part);
			if (!isNaN(num) && !results.includes(num)) results.push(num);
		}
	}

	return results
		.sort((a, b) => a - b)
		.map((n) => (names ? names[n] || String(n) : String(n)));
}

function cronToDescription(cron: string): string {
	const parts = cron.trim().split(/\s+/);
	if (parts.length !== 5) return "无效的 Cron 表达式（需要5个字段）";

	const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

	let desc = "";

	// 分钟
	if (minute === "*") desc += "每分钟";
	else if (minute.includes("/")) desc += `每隔 ${minute.split("/")[1]} 分钟`;
	else desc += `在第 ${minute} 分钟`;

	// 小时
	if (hour !== "*") {
		if (hour.includes("/")) desc += `，每隔 ${hour.split("/")[1]} 小时`;
		else desc += `，在 ${hour} 点`;
	}

	// 日期
	if (dayOfMonth !== "*") {
		if (dayOfMonth.includes("/"))
			desc += `，每隔 ${dayOfMonth.split("/")[1]} 天`;
		else desc += `，在 ${dayOfMonth} 号`;
	}

	// 月份
	if (month !== "*") {
		const monthNames = month
			.split(",")
			.map((m) => MONTHS[parseInt(m) - 1] || m)
			.join("、");
		desc += `，在 ${monthNames}`;
	}

	// 星期
	if (dayOfWeek !== "*") {
		const weekNames = dayOfWeek
			.split(",")
			.map((w) => WEEKDAYS[parseInt(w)] || w)
			.join("、");
		desc += `，在 ${weekNames}`;
	}

	return desc;
}

function getNextExecutions(cron: string, count: number = 5): string[] {
	const parts = cron.trim().split(/\s+/);
	if (parts.length !== 5) return [];

	const [minuteStr, hourStr, dayOfMonthStr, monthStr, dayOfWeekStr] = parts;

	const minutes = parseCronField(minuteStr, 0, 59);
	const hours = parseCronField(hourStr, 0, 23);
	const daysOfMonth = parseCronField(dayOfMonthStr, 1, 31);
	const months = parseCronField(monthStr, 1, 12);
	const daysOfWeek = parseCronField(dayOfWeekStr, 0, 6, WEEKDAYS);

	const results: string[] = [];
	const now = new Date();
	let current = new Date(now);
	current.setSeconds(0, 0);

	let attempts = 0;
	while (results.length < count && attempts < 10000) {
		attempts++;
		current = new Date(current.getTime() + 60000);

		const m = current.getMinutes();
		const h = current.getHours();
		const d = current.getDate();
		const mo = current.getMonth() + 1;
		const dw = current.getDay();

		if (
			minutes.includes(String(m)) &&
			hours.includes(String(h)) &&
			daysOfMonth.includes(String(d)) &&
			months.includes(String(mo)) &&
			daysOfWeek.includes(WEEKDAYS[dw])
		) {
			results.push(
				current.toLocaleString("zh-CN", {
					year: "numeric",
					month: "2-digit",
					day: "2-digit",
					hour: "2-digit",
					minute: "2-digit",
					weekday: "short",
					hour12: false,
				}),
			);
		}
	}

	return results;
}

const presets = [
	{ label: "每分钟", cron: "* * * * *" },
	{ label: "每小时", cron: "0 * * * *" },
	{ label: "每天凌晨", cron: "0 0 * * *" },
	{ label: "每天上午9点", cron: "0 9 * * *" },
	{ label: "每周一上午", cron: "0 9 * * 1" },
	{ label: "每月1号", cron: "0 0 1 * *" },
	{ label: "每5分钟", cron: "*/5 * * * *" },
	{ label: "工作日上午9点", cron: "0 9 * * 1-5" },
];

function CronParser() {
	const { copy } = useCopy();
	const [cron, setCron] = useState("0 9 * * 1-5");

	const description = useMemo(() => cronToDescription(cron), [cron]);
	const nextExecutions = useMemo(() => getNextExecutions(cron, 5), [cron]);
	const isValid = cron.trim().split(/\s+/).length === 5;

	// 生成模式
	const [genMinute, setGenMinute] = useState("*");
	const [genHour, setGenHour] = useState("9");
	const [genDay, setGenDay] = useState("*");
	const [genMonth, setGenMonth] = useState("*");
	const [genWeekday, setGenWeekday] = useState("1-5");

	const generatedCron = `${genMinute} ${genHour} ${genDay} ${genMonth} ${genWeekday}`;

	const applyGenerated = () => {
		setCron(generatedCron);
		toast.success("已应用生成的表达式");
	};

	return (
		<ToolPage
			title="Cron 表达式解析"
			description="解析和生成 Cron 表达式，支持查看未来执行时间。"
			actions={
				<Button
					onClick={() => copy(cron, "Cron 表达式")}
					variant="outline"
					size="sm"
					disabled={!isValid}
				>
					<Copy className="h-3 w-3 mr-1" />
					复制
				</Button>
			}
		>
			<div className="h-full grid grid-cols-2 gap-4">
				{/* 左侧：解析 */}
				<div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
					<div className="space-y-2">
						<Label className="text-sm font-medium">Cron 表达式</Label>
						<Input
							value={cron}
							onChange={(e) => setCron(e.target.value)}
							placeholder="* * * * *"
							className="font-mono text-lg h-12"
						/>
						<div className="text-xs text-gray-400">
							格式: 分钟(0-59) 小时(0-23) 日(1-31) 月(1-12) 星期(0-6)
						</div>
					</div>

					{/* 解析结果 */}
					<div
						className={`p-4 rounded-lg border ${isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
					>
						<div className="text-sm font-medium mb-1">
							{isValid ? "解析结果" : "错误"}
						</div>
						<div className={`${isValid ? "text-green-700" : "text-red-700"}`}>
							{description}
						</div>
					</div>

					{/* 字段解析 */}
					{isValid && (
						<div className="border rounded-lg overflow-hidden">
							<div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium">
								字段解析
							</div>
							<div className="divide-y">
								{[
									{ label: "分钟", value: cron.split(" ")[0], range: "0-59" },
									{ label: "小时", value: cron.split(" ")[1], range: "0-23" },
									{ label: "日", value: cron.split(" ")[2], range: "1-31" },
									{ label: "月", value: cron.split(" ")[3], range: "1-12" },
									{
										label: "星期",
										value: cron.split(" ")[4],
										range: "0-6 (0=周日)",
									},
								].map((field) => (
									<div
										key={field.label}
										className="flex items-center justify-between px-3 py-2"
									>
										<span className="text-sm text-gray-500">
											{field.label} ({field.range})
										</span>
										<code className="text-sm font-mono">{field.value}</code>
									</div>
								))}
							</div>
						</div>
					)}

					{/* 下次执行时间 */}
					{isValid && nextExecutions.length > 0 && (
						<div className="border rounded-lg overflow-hidden">
							<div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium">
								未来执行时间
							</div>
							<div className="divide-y">
								{nextExecutions.map((time, i) => (
									<div key={i} className="px-3 py-2 text-sm font-mono">
										{time}
									</div>
								))}
							</div>
						</div>
					)}

					{/* 预设 */}
					<div className="space-y-2">
						<Label className="text-sm font-medium">常用表达式</Label>
						<div className="flex flex-wrap gap-2">
							{presets.map((preset) => (
								<Button
									key={preset.label}
									variant="outline"
									size="sm"
									onClick={() => setCron(preset.cron)}
									className="text-xs"
								>
									{preset.label}
								</Button>
							))}
						</div>
					</div>
				</div>

				{/* 右侧：生成 */}
				<div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
					<div className="space-y-3 p-4 bg-gray-50 rounded-lg">
						<Label className="text-sm font-medium">生成 Cron 表达式</Label>

						<div className="grid grid-cols-5 gap-2">
							{[
								{
									label: "分钟",
									value: genMinute,
									onChange: setGenMinute,
									placeholder: "*",
								},
								{
									label: "小时",
									value: genHour,
									onChange: setGenHour,
									placeholder: "*",
								},
								{
									label: "日",
									value: genDay,
									onChange: setGenDay,
									placeholder: "*",
								},
								{
									label: "月",
									value: genMonth,
									onChange: setGenMonth,
									placeholder: "*",
								},
								{
									label: "星期",
									value: genWeekday,
									onChange: setGenWeekday,
									placeholder: "*",
								},
							].map((field) => (
								<div key={field.label} className="space-y-1">
									<Label className="text-xs text-gray-500">{field.label}</Label>
									<Input
										value={field.value}
										onChange={(e) => field.onChange(e.target.value)}
										placeholder={field.placeholder}
										className="h-8 text-xs font-mono text-center"
									/>
								</div>
							))}
						</div>

						<div className="flex gap-2">
							<div className="flex-1 p-2 bg-white rounded border text-center font-mono">
								{generatedCron}
							</div>
							<Button onClick={applyGenerated} size="sm">
								<RefreshCw className="h-3 w-3 mr-1" />
								应用
							</Button>
						</div>
					</div>

					{/* 快捷生成 */}
					<div className="space-y-2">
						<Label className="text-sm font-medium">快捷生成</Label>
						<div className="grid grid-cols-2 gap-2">
							{[
								{ label: "每分钟", values: ["*", "*", "*", "*", "*"] },
								{ label: "每小时", values: ["0", "*", "*", "*", "*"] },
								{ label: "每天", values: ["0", "0", "*", "*", "*"] },
								{ label: "每周", values: ["0", "0", "*", "*", "0"] },
								{ label: "每月", values: ["0", "0", "1", "*", "*"] },
								{ label: "每年", values: ["0", "0", "1", "1", "*"] },
								{ label: "每5分钟", values: ["*/5", "*", "*", "*", "*"] },
								{ label: "每30分钟", values: ["*/30", "*", "*", "*", "*"] },
								{ label: "工作日", values: ["0", "9", "*", "*", "1-5"] },
								{ label: "周末", values: ["0", "10", "*", "*", "0,6"] },
							].map((preset) => (
								<Button
									key={preset.label}
									variant="outline"
									size="sm"
									onClick={() => {
										setGenMinute(preset.values[0]);
										setGenHour(preset.values[1]);
										setGenDay(preset.values[2]);
										setGenMonth(preset.values[3]);
										setGenWeekday(preset.values[4]);
									}}
									className="text-xs justify-start"
								>
									{preset.label}
								</Button>
							))}
						</div>
					</div>

					{/* 语法说明 */}
					<div className="border rounded-lg overflow-hidden">
						<div className="px-3 py-2 bg-gray-50 border-b text-sm font-medium">
							语法说明
						</div>
						<div className="p-3 space-y-2 text-xs">
							<div className="flex justify-between">
								<code className="bg-gray-100 px-1 rounded">*</code>
								<span>任意值</span>
							</div>
							<div className="flex justify-between">
								<code className="bg-gray-100 px-1 rounded">,</code>
								<span>列表分隔 (1,3,5)</span>
							</div>
							<div className="flex justify-between">
								<code className="bg-gray-100 px-1 rounded">-</code>
								<span>范围 (1-5)</span>
							</div>
							<div className="flex justify-between">
								<code className="bg-gray-100 px-1 rounded">/</code>
								<span>步长 (*/5)</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</ToolPage>
	);
}
