import { ToolPage } from "@/components/tool-page";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClear, useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import yaml from "js-yaml";
import { Copy, Download, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadLocalFile } from "sunrise-utils";

export const Route = createFileRoute("/yamlJsonConverter")({
	component: YamlJsonConverter,
});

function YamlJsonConverter() {
	const { copy } = useCopy();
	const [input, setInput] = useState("");
	const [output, setOutput] = useState("");
	const [error, setError] = useState<string | null>(null);
	const { clear } = useClear(() => {
		setInput("");
		setOutput("");
		setError(null);
	});

	const convertJsonToYaml = () => {
		try {
			if (!input.trim()) {
				setOutput("");
				setError(null);
				return;
			}
			const parsed = JSON.parse(input);
			const yamlOutput = yaml.dump(parsed, {
				indent: 2,
				lineWidth: -1,
				noRefs: true,
			});
			setOutput(yamlOutput);
			setError(null);
			toast.success("JSON 转 YAML 成功");
		} catch {
			setError("JSON 格式无效，请检查输入");
			setOutput("");
		}
	};

	const convertYamlToJson = () => {
		try {
			if (!input.trim()) {
				setOutput("");
				setError(null);
				return;
			}
			const parsed = yaml.load(input);
			const jsonOutput = JSON.stringify(parsed, null, 2);
			setOutput(jsonOutput);
			setError(null);
			toast.success("YAML 转 JSON 成功");
		} catch {
			setError("YAML 格式无效，请检查输入");
			setOutput("");
		}
	};

	const downloadResult = () => {
		if (!output) return;
		try {
			const extension = output.trim().startsWith("{") ? "json" : "yaml";
			const blob = new Blob([output], { type: "text/plain" });
			downloadLocalFile(blob, `converted.${extension}`);
			toast.success("下载成功");
		} catch {
			toast.error("下载失败");
		}
	};

	const loadSample = () => {
		setInput(`name: 张三
age: 25
address:
  city: 北京
  street: 长安街
hobbies:
  - reading
  - coding`);
		toast.success("示例 YAML 已加载");
	};

	return (
		<ToolPage
			title="YAML/JSON 转换"
			description="此工具可以在 YAML 和 JSON 格式之间进行转换。支持复制转换后的结果或下载为文件。"
			actions={
				<>
					<Button onClick={loadSample} variant="outline" size="sm">
						示例
					</Button>
					<Button
						onClick={clear}
						variant="ghost"
						size="sm"
						disabled={!input && !output}
					>
						<RotateCcw className="h-3 w-3 mr-1" />
						清空
					</Button>
				</>
			}
		>
			<div className="h-full grid grid-cols-2 gap-4">
				{/* 左侧输入 */}
				<div className="flex flex-col gap-3 min-h-0">
					<div className="flex items-center justify-between flex-shrink-0">
						<span className="text-sm font-medium text-gray-700">
							输入 YAML/JSON
						</span>
					</div>
					<Textarea
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
							setError(null);
						}}
						placeholder="请输入 YAML 或 JSON 内容..."
						className="flex-1 min-h-0 font-mono text-sm resize-none"
					/>
					<div className="flex gap-2 flex-shrink-0">
						<Button onClick={convertJsonToYaml} className="flex-1">
							JSON → YAML
						</Button>
						<Button onClick={convertYamlToJson} className="flex-1">
							YAML → JSON
						</Button>
					</div>
				</div>

				{/* 右侧输出 */}
				<div className="flex flex-col gap-3 min-h-0">
					<div className="flex items-center justify-between flex-shrink-0">
						<span className="text-sm font-medium text-gray-700">转换结果</span>
						<div className="flex gap-1">
							<Button
								size="sm"
								variant="ghost"
								className="h-7 px-2"
								onClick={() => copy(output)}
								disabled={!output}
							>
								<Copy className="h-3 w-3 mr-1" />
								<span className="text-xs">复制</span>
							</Button>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 px-2"
								onClick={downloadResult}
								disabled={!output}
							>
								<Download className="h-3 w-3 mr-1" />
								<span className="text-xs">下载</span>
							</Button>
						</div>
					</div>
					<Textarea
						value={output}
						readOnly
						placeholder="转换结果将显示在这里..."
						className="flex-1 min-h-0 font-mono text-sm resize-none bg-gray-50"
					/>
				</div>
			</div>

			{/* 错误提示 */}
			{error && (
				<div className="absolute bottom-4 left-1/2 -translate-x-1/2 p-3 bg-red-50 rounded-lg border border-red-200 shadow-lg">
					<p className="text-sm text-red-600">{error}</p>
				</div>
			)}
		</ToolPage>
	);
}
