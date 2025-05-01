import { createLazyFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
export const Route = createLazyFileRoute("/jsonToTs")({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate()
	const [inputJson, setInputJson] = useState("")
	const [outputTypescript, setOutputTypescript] = useState("")

	function capitalize(str: string): string {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	function jsonToTypeScriptType(
		jsonString: string,
		typeName: string = "RootObject",
	): string {
		let jsonObject: any
		try {
			jsonObject = JSON.parse(jsonString)
		} catch (error) {
			throw new Error("Invalid JSON string")
		}

		const { typeDefinition, nestedTypes } = generateTypeDefinition(
			jsonObject,
			typeName,
		)
		// 修改这里：将 typeDefinition 放在最后，这样嵌套的类型会先定义
		const allNestedTypes = [...nestedTypes, typeDefinition].join("\n\n")
		return allNestedTypes
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

	function getType(
		value: any,
		key: string,
		parentTypeName: string,
		nestedTypes: string[],
	): string {
		if (value === null) return "string"

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
		console.log(typeof value, '===================')
		return typeof value
	}

	const handleConvert = () => {
		try {
			const output = jsonToTypeScriptType(inputJson)
			setOutputTypescript(output)
		} catch (error) {
			toast.error("Error converting JSON to TypeScript")
			// alert(error.message);
		}
	}

	const handleClear = () => {
		setInputJson("")
		setOutputTypescript("")
	}

	return (
		<div className="h-full flex flex-col items-center px-4 bg-gray-50">
			<div className="w-full flex justify-center items-center my-4 gap-4">
				<h1 className="text-2xl font-bold text-gray-800">
					JSON to TypeScript{ " " }
				</h1>
				<Button onClick={ () => navigate({ to: "/" }) }>返回</Button>
			</div>
			<div className="w-full flex-1 flex justify-center items-center border border-gray-300 rounded-md p-4 gap-3">
				<Card className="shadow-lg flex-1 h-full max-w-1/2"> {/* 移除 mb-4 */}
					<CardHeader>
						<CardTitle>输入 JSON</CardTitle>
					</CardHeader>
					<CardContent>
						<Textarea
							value={ inputJson }
							onChange={ (e) => setInputJson(e.target.value) }
							className="w-full h-[74vh] p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
						/>
					</CardContent>
				</Card>
				<div className="flex justify-between items-center mb-2">
					<div className="flex flex-col gap-2"> {/* 修改按钮容器的布局 */}
						<Button onClick={ handleConvert } variant="default">
							转换
						</Button>
						<Button onClick={ handleClear } variant="default">
							清除
						</Button>
					</div>
				</div>
				<Card className="flex-1 h-full">
					<CardHeader className="flex !flex-row justify-between items-center">
						<CardTitle>输出 TypeScript</CardTitle>
						<Button
							variant="default"
							id="copyButton"
							className="copy-btn"
							onClick={ () => {
								console.log(outputTypescript)
								navigator.clipboard.writeText(outputTypescript)
								toast.success("TypeScript 代码已复制到剪贴板")
							} }
						>
							复制
						</Button>
					</CardHeader>
					<CardContent>
						<Textarea
							value={ outputTypescript }
							onChange={ (e) => setInputJson(e.target.value) }
							className="w-full h-[74vh] p-3 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
						/>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
