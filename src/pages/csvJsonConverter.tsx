import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Download, Info, Upload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadLocalFile } from "sunrise-utils";

export const Route = createFileRoute("/csvJsonConverter")({
	component: CsvJsonConverter,
});

function CsvJsonConverter() {
	const navigate = useNavigate();
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [delimiter, setDelimiter] = useState(",");
	const [hasHeader, setHasHeader] = useState(true);
	const [activeTab, setActiveTab] = useState<"csv2json" | "json2csv">(
		"csv2json",
	);

	const parseCSV = (csv: string): string[][] => {
		const lines: string[][] = [];
		let currentLine: string[] = [];
		let currentField = "";
		let inQuotes = false;

		for (let i = 0; i < csv.length; i++) {
			const char = csv[i];
			const nextChar = csv[i + 1];

			if (inQuotes) {
				if (char === '"' && nextChar === '"') {
					currentField += '"';
					i++;
				} else if (char === '"') {
					inQuotes = false;
				} else {
					currentField += char;
				}
			} else {
				if (char === '"') {
					inQuotes = true;
				} else if (char === delimiter) {
					currentLine.push(currentField.trim());
					currentField = "";
				} else if (char === "\r" && nextChar === "\n") {
					currentLine.push(currentField.trim());
					lines.push(currentLine);
					currentLine = [];
					currentField = "";
					i++;
				} else if (char === "\n") {
					currentLine.push(currentField.trim());
					lines.push(currentLine);
					currentLine = [];
					currentField = "";
				} else {
					currentField += char;
				}
			}
		}

		if (currentField || currentLine.length > 0) {
			currentLine.push(currentField.trim());
			lines.push(currentLine);
		}

		return lines;
	};

	const csvToJson = () => {
		try {
			if (!input.trim()) {
				setOutput("");
				setError(null);
				return;
			}

			const lines = parseCSV(input);

			if (lines.length === 0) {
				setError("CSV 内容为空");
				return;
			}

			let headers: string[];
			let dataStartIndex: number;

			if (hasHeader) {
				headers = lines[0];
				dataStartIndex = 1;
			} else {
				headers = lines[0].map((_, index) => `column_${index + 1}`);
				dataStartIndex = 0;
			}

			const result: Record<string, string>[] = [];

			for (let i = dataStartIndex; i < lines.length; i++) {
				const line = lines[i];
				if (line.length === 1 && line[0] === "") continue;

				const obj: Record<string, string> = {};
				headers.forEach((header, index) => {
					obj[header] = line[index] ?? "";
				});
				result.push(obj);
			}

			setOutput(JSON.stringify(result, null, 2));
			setError(null);
		} catch (err) {
			console.error("CSV 转 JSON 失败", err);
			setError("CSV 格式无效，请检查输入");
			setOutput("");
		}
	};

	const escapeCSVField = (field: string): string => {
		if (
			field.includes(delimiter) ||
			field.includes('"') ||
			field.includes("\n") ||
			field.includes("\r")
		) {
			return `"${field.replace(/"/g, '""')}"`;
		}
		return field;
	};

	const jsonToCsv = () => {
		try {
			if (!input.trim()) {
				setOutput("");
				setError(null);
				return;
			}

			const parsed = JSON.parse(input);
			const data = Array.isArray(parsed) ? parsed : [parsed];

			if (data.length === 0) {
				setOutput("");
				setError(null);
				return;
			}

			const allKeys = new Set<string>();
			data.forEach((item: Record<string, unknown>) => {
				if (typeof item === "object" && item !== null) {
					Object.keys(item).forEach((key) => allKeys.add(key));
				}
			});

			const headers = Array.from(allKeys);
			const csvLines: string[] = [];

			if (hasHeader) {
				csvLines.push(headers.map(escapeCSVField).join(delimiter));
			}

			data.forEach((item: Record<string, unknown>) => {
				if (typeof item === "object" && item !== null) {
					const row = headers.map((header) => {
						const value = item[header];
						if (value === null || value === undefined) return "";
						if (typeof value === "object")
							return escapeCSVField(JSON.stringify(value));
						return escapeCSVField(String(value));
					});
					csvLines.push(row.join(delimiter));
				}
			});

			setOutput(csvLines.join("\n"));
			setError(null);
		} catch (err) {
			console.error("JSON 转 CSV 失败", err);
			setError("JSON 格式无效，请检查输入");
			setOutput("");
		}
	};

	const handleConvert = () => {
		if (activeTab === "csv2json") {
			csvToJson();
		} else {
			jsonToCsv();
		}
	};

	const downloadResult = () => {
		try {
			const extension = activeTab === "csv2json" ? "json" : "csv";
			const blob = new Blob([output], { type: "text/plain" });
			downloadLocalFile(blob, `converted.${extension}`);
			toast.success("下载成功");
		} catch (err) {
			console.error("下载失败", err);
			toast.error("下载失败");
		}
	};

	const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result as string;
			setInput(content);
			toast.success("文件加载成功");
		};
		reader.onerror = () => {
			toast.error("文件读取失败");
		};
		reader.readAsText(file);
	};

	const loadSampleData = () => {
		if (activeTab === "csv2json") {
			setInput(`name,age,email,city
张三,25,zhangsan@example.com,北京
李四,30,lisi@example.com,上海
王五,28,wangwu@example.com,广州`);
		} else {
			setInput(`[
  {
    "name": "张三",
    "age": 25,
    "email": "zhangsan@example.com",
    "city": "北京"
  },
  {
    "name": "李四",
    "age": 30,
    "email": "lisi@example.com",
    "city": "上海"
  },
  {
    "name": "王五",
    "age": 28,
    "email": "wangwu@example.com",
    "city": "广州"
  }
]`);
		}
		toast.success("示例数据已加载");
	};

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4 md:p-6">
			<Card className="w-full h-full px-3 py-2 mx-auto shadow-lg">
				<CardHeader>
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<CardTitle className="text-2xl font-bold text-gray-800 flex gap-3">
							CSV/JSON 转换工具
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-6 w-6" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 w-80 p-4 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-4 h-4 bg-white border-l border-t border-gray-200"></div>
									<div className="p-4 bg-blue-50 rounded-lg">
										<p className="text-sm text-blue-600">
											提示：此工具可以在 CSV 和 JSON
											格式之间进行转换。支持自定义分隔符、是否包含表头，以及上传
											CSV 文件。支持复制转换后的结果或下载为文件。
										</p>
									</div>
								</div>
							</div>
						</CardTitle>

						<Button
							onClick={() => navigate({ to: "/" })}
							variant="ghost"
							className="dark:hover:bg-gray-700"
						>
							<ArrowLeft className="h-4 w-4 mr-2" />
							返回首页
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{/* 转换模式选择 */}
						<div className="flex gap-2">
							<Button
								variant={activeTab === "csv2json" ? "default" : "outline"}
								onClick={() => setActiveTab("csv2json")}
							>
								CSV 转 JSON
							</Button>
							<Button
								variant={activeTab === "json2csv" ? "default" : "outline"}
								onClick={() => setActiveTab("json2csv")}
							>
								JSON 转 CSV
							</Button>
						</div>

						{/* 配置选项 */}
						<div className="flex flex-wrap items-center gap-4">
							<div className="flex items-center gap-2">
								<Label htmlFor="delimiter">分隔符</Label>
								<Select value={delimiter} onValueChange={setDelimiter}>
									<SelectTrigger className="w-24">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value=",">逗号 (,)</SelectItem>
										<SelectItem value=";">分号 (;)</SelectItem>
										<SelectItem value="	">制表符 (\t)</SelectItem>
										<SelectItem value="|">竖线 (|)</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<div className="flex items-center gap-2">
								<Switch
									id="hasHeader"
									checked={hasHeader}
									onCheckedChange={setHasHeader}
								/>
								<Label htmlFor="hasHeader">包含表头</Label>
							</div>

							<Button onClick={loadSampleData} variant="outline" size="sm">
								加载示例
							</Button>
						</div>

						{/* 操作按钮 */}
						<div className="flex justify-end gap-2">
							{activeTab === "csv2json" && (
								<div className="relative">
									<input
										type="file"
										accept=".csv,.txt"
										onChange={handleFileUpload}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
										id="file-upload"
									/>
									<Button size="sm" variant="outline" asChild>
										<label htmlFor="file-upload" className="cursor-pointer">
											<Upload className="h-4 w-4 mr-2" />
											上传 CSV
										</label>
									</Button>
								</div>
							)}
							<Button onClick={handleConvert} size="sm">
								转换
							</Button>
							<Button
								onClick={() => copyToClipboard(output)}
								size="sm"
								variant="outline"
								disabled={!output}
							>
								<Copy className="h-4 w-4 mr-2" />
								复制
							</Button>
							<Button
								onClick={downloadResult}
								size="sm"
								variant="outline"
								disabled={!output}
							>
								<Download className="h-4 w-4 mr-2" />
								下载
							</Button>
						</div>

						{/* 左右布局的编辑区域 */}
						<div className="grid grid-cols-2 gap-4">
							{/* 左侧输入 */}
							<div className="space-y-2">
								<label className="text-sm font-medium">
									{activeTab === "csv2json" ? "CSV 输入" : "JSON 输入"}
								</label>
								<Textarea
									placeholder={
										activeTab === "csv2json"
											? "请输入 CSV 内容..."
											: "请输入 JSON 数组..."
									}
									value={input}
									onChange={(e) => {
										setInput(e.target.value);
										setError(null);
									}}
									className="max-h-[500px] font-mono min-h-[500px]"
								/>
							</div>

							{/* 右侧输出 */}
							<div className="space-y-2">
								<label className="text-sm font-medium">转换结果</label>
								<Textarea
									value={output}
									readOnly
									className="min-h-[500px] max-h-[500px] font-mono bg-gray-50"
									placeholder="转换结果将显示在这里..."
								/>
							</div>
						</div>

						{/* 错误提示 */}
						{error && (
							<div className="p-4 bg-red-50 rounded-lg">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
