import { ToolPage } from "@/components/tool-page"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useClear, useCopy } from "@/hooks"
import { createLazyFileRoute } from "@tanstack/react-router"
import { Copy, RotateCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export const Route = createLazyFileRoute("/jsonToTs")({
	component: JsonToTs,
})

type JSONValue = string | number | boolean | null | undefined | JSONObject

interface JSONObject {
	[key: string]: JSONValue
}

function JsonToTs() {
	const { copy } = useCopy()
	const [inputJson, setInputJson] = useState("")
	const [outputTypescript, setOutputTypescript] = useState("")
	const { clear } = useClear(() => {
		setInputJson("")
		setOutputTypescript("")
	})

	function capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	function getType(
		value: any,
		key: string,
		parentTypeName: string,
		nestedTypes: string[],
	): string {
		if (value === null) return "string | null"
		if (typeof value === "object") {
			if (Array.isArray(value)) {
				if (value.length === 0) return "any[]"
				const itemType = getType(value[0], key, parentTypeName, nestedTypes)
				return `${itemType}[]`
			} else {
				const nestedTypeName = `I${capitalize(key)}`
				const { typeDefinition, nestedTypes: childNestedTypes } =
					generateTypeDefinition(value, nestedTypeName)
				nestedTypes.push(typeDefinition, ...childNestedTypes)
				return nestedTypeName
			}
		}
		return typeof value
	}

	function generateTypeDefinition(
		obj: any,
		typeName: string,
	): { typeDefinition: string; nestedTypes: string[] } {
		const typeProperties: string[] = []
		const nestedTypes: string[] = []
		for (const [key, value] of Object.entries(obj)) {
			const type = getType(value, key, typeName, nestedTypes)
			typeProperties.push(`${key}: ${type};`)
		}
		const typeDefinition = `export interface ${typeName} {\n  ${typeProperties.join("\n  ")}\n}`
		return { typeDefinition, nestedTypes }
	}

	function jsonToTypeScriptType(
		jsonString: string,
		typeName: string = "RootObject",
	): string {
		let jsonObject: any
		try {
			jsonObject = JSON.parse(jsonString)
		} catch {
			throw new Error("无效的 JSON 格式")
		}
		const { typeDefinition, nestedTypes } = generateTypeDefinition(
			jsonObject,
			typeName,
		)
		return [...nestedTypes, typeDefinition].join("\n\n")
	}

	const handleConvert = () => {
		if (!inputJson.trim()) {
			toast.error("请输入 JSON")
			return
		}
		try {
			const output = jsonToTypeScriptType(inputJson)
			setOutputTypescript(output)
			toast.success("转换成功")
		} catch {
			toast.error("JSON 格式无效")
		}
	}

	const loadSample = () => {
		setInputJson(`{
  "name": "张三",
  "age": 25,
  "address": {
    "city": "北京",
    "street": "长安街"
  },
  "hobbies": ["reading", "coding"]
}`)
		toast.success("示例已加载")
	}

	return (
		<ToolPage
			title="JSON 转 TypeScript"
			description="将 JSON 对象转换为 TypeScript 接口定义。"
			actions={
				<>
					<Button onClick={ loadSample } variant="outline" size="sm">
						示例
					</Button>
					<Button
						onClick={ clear }
						variant="ghost"
						size="sm"
						disabled={ !inputJson && !outputTypescript }
					>
						<RotateCcw className="h-3 w-3 mr-1" />
						清空
					</Button>
				</>
			}
		>
			<div className="h-full grid grid-cols-2 gap-4">
				{/* 左侧输入 */ }
				<div className="flex flex-col gap-3 min-h-0">
					<div className="flex items-center justify-between flex-shrink-0">
						<span className="text-sm font-medium text-gray-700">输入 JSON</span>
					</div>
					<Textarea
						value={ inputJson }
						onChange={ (e) => setInputJson(e.target.value) }
						placeholder='输入 JSON，如 { "name": "test" }'
						className="flex-1 min-h-0 font-mono text-sm resize-none"
					/>
					<Button onClick={ handleConvert } className="w-full flex-shrink-0">
						转换为 TypeScript
					</Button>
				</div>

				{/* 右侧输出 */ }
				<div className="flex flex-col gap-3 min-h-0">
					<div className="flex items-center justify-between flex-shrink-0">
						<span className="text-sm font-medium text-gray-700">
							TypeScript 输出
						</span>
						<Button
							size="sm"
							variant="ghost"
							className="h-7 px-2"
							onClick={ () => copy(outputTypescript, "TypeScript 代码") }
							disabled={ !outputTypescript }
						>
							<Copy className="h-3 w-3 mr-1" />
							<span className="text-xs">复制</span>
						</Button>
					</div>
					<Textarea
						value={ outputTypescript }
						readOnly
						placeholder="TypeScript 接口定义将显示在这里..."
						className="flex-1 min-h-0 font-mono text-sm resize-none bg-gray-50"
					/>
				</div>
			</div>
		</ToolPage>
	)
}
