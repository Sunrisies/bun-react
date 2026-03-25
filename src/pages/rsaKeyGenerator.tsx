import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { copyToClipboard } from "@/lib/utils"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Copy, Download, Info, Key, Loader2 } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/rsaKeyGenerator")({
	component: RsaKeyGenerator,
})

type KeySize = 1024 | 2048 | 4096
type Format = "pem" | "jwk"

function RsaKeyGenerator() {
	const navigate = useNavigate()
	const [keySize, setKeySize] = useState<KeySize>(2048)
	const [format, setFormat] = useState<Format>("pem")
	const [extractable, setExtractable] = useState(true)
	const [generating, setGenerating] = useState(false)
	const [publicKey, setPublicKey] = useState("")
	const [privateKey, setPrivateKey] = useState("")

	const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
		const bytes = new Uint8Array(buffer)
		let binary = ""
		for (let i = 0; i < bytes.byteLength; i++) {
			binary += String.fromCharCode(bytes[i])
		}
		return btoa(binary)
	}

	const formatPem = (base64: string, type: "PUBLIC" | "PRIVATE"): string => {
		const lines = base64.match(/.{1,64}/g) || []
		return `-----BEGIN ${type} KEY-----\n${lines.join("\n")}\n-----END ${type} KEY-----`
	}

	const generateKeys = useCallback(async () => {
		setGenerating(true)
		setPublicKey("")
		setPrivateKey("")

		try {
			const keyPair = await crypto.subtle.generateKey(
				{
					name: "RSA-OAEP",
					modulusLength: keySize,
					publicExponent: new Uint8Array([1, 0, 1]),
					hash: "SHA-256",
				},
				extractable,
				["encrypt", "decrypt"],
			)

			if (format === "pem") {
				// 导出公钥
				const publicBuffer = await crypto.subtle.exportKey(
					"spki",
					keyPair.publicKey,
				)
				const publicBase64 = arrayBufferToBase64(publicBuffer)
				setPublicKey(formatPem(publicBase64, "PUBLIC"))

				// 导出私钥
				const privateBuffer = await crypto.subtle.exportKey(
					"pkcs8",
					keyPair.privateKey,
				)
				const privateBase64 = arrayBufferToBase64(privateBuffer)
				setPrivateKey(formatPem(privateBase64, "PRIVATE"))
			} else {
				// 导出为 JWK 格式
				const publicJwk = await crypto.subtle.exportKey(
					"jwk",
					keyPair.publicKey,
				)
				const privateJwk = await crypto.subtle.exportKey(
					"jwk",
					keyPair.privateKey,
				)
				setPublicKey(JSON.stringify(publicJwk, null, 2))
				setPrivateKey(JSON.stringify(privateJwk, null, 2))
			}

			toast.success("密钥对生成成功")
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "生成失败")
		} finally {
			setGenerating(false)
		}
	}, [keySize, format, extractable])

	const copyKey = (key: string, type: string) => {
		if (!key) return
		copyToClipboard(key)
		toast.success(`已复制${type}`)
	}

	const downloadKey = (content: string, filename: string) => {
		const blob = new Blob([content], { type: "text/plain" })
		const url = URL.createObjectURL(blob)
		const a = document.createElement("a")
		a.href = url
		a.download = filename
		a.click()
		URL.revokeObjectURL(url)
	}

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full  mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							RSA 密钥对生成
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600 space-y-1">
										<p>使用 Web Crypto API 在本地生成 RSA 密钥对。</p>
										<p>私钥请妥善保管，切勿泄露！</p>
									</div>
								</div>
							</div>
						</CardTitle>
						<Button
							onClick={ () => navigate({ to: "/" }) }
							variant="ghost"
							size="sm"
						>
							<ArrowLeft className="h-4 w-4 mr-1" />
							返回
						</Button>
					</div>
				</CardHeader>
				<CardContent className="flex-1 min-h-0 p-4 overflow-hidden">
					<div className="h-full grid grid-cols-[300px_1fr] gap-4">
						{/* 左侧：配置 */ }
						<div className="flex flex-col gap-4">
							<div className="space-y-3 p-4 bg-gray-50 rounded-lg">
								<Label className="text-sm font-medium">配置选项</Label>

								<div className="space-y-2">
									<Label className="text-xs text-gray-500">密钥长度</Label>
									<Select
										value={ String(keySize) }
										onValueChange={ (v) => setKeySize(parseInt(v) as KeySize) }
									>
										<SelectTrigger className="h-9">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1024">1024 位 (不推荐)</SelectItem>
											<SelectItem value="2048">2048 位 (推荐)</SelectItem>
											<SelectItem value="4096">4096 位 (高安全)</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="space-y-2">
									<Label className="text-xs text-gray-500">输出格式</Label>
									<Select
										value={ format }
										onValueChange={ (v) => setFormat(v as Format) }
									>
										<SelectTrigger className="h-9">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="pem">PEM 格式</SelectItem>
											<SelectItem value="jwk">JWK 格式</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className="flex items-center justify-between py-2">
									<Label className="text-xs text-gray-500">可导出</Label>
									<Switch
										checked={ extractable }
										onCheckedChange={ setExtractable }
									/>
								</div>
							</div>

							<Button
								onClick={ generateKeys }
								disabled={ generating }
								className="w-full"
							>
								{ generating ? (
									<>
										<Loader2 className="h-4 w-4 mr-2 animate-spin" />
										生成中...
									</>
								) : (
									<>
										<Key className="h-4 w-4 mr-2" />
										生成密钥对
									</>
								) }
							</Button>

							<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-1">
								<p>• 公钥用于加密，可公开分享</p>
								<p>• 私钥用于解密，必须保密</p>
								<p>• 2048 位是推荐的安全长度</p>
							</div>

							<div className="p-3 bg-yellow-50 rounded-lg text-xs text-yellow-700">
								⚠️ 私钥切勿泄露或上传到服务器
							</div>
						</div>

						{/* 右侧：密钥显示 */ }
						<div className="grid grid-cols-2 gap-3 min-h-0">
							{/* 公钥 */ }
							<div className="flex flex-col min-h-0">
								<div className="flex items-center justify-between mb-2">
									<Label className="text-sm font-medium text-green-700">
										<Key className="h-3 w-3 inline mr-1" />
										公钥
									</Label>
									<div className="flex gap-1">
										<Button
											size="sm"
											variant="ghost"
											className="h-6 px-2"
											onClick={ () => copyKey(publicKey, "公钥") }
											disabled={ !publicKey }
										>
											<Copy className="h-3 w-3" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											className="h-6 px-2"
											onClick={ () => downloadKey(publicKey, "public_key.pem") }
											disabled={ !publicKey }
										>
											<Download className="h-3 w-3" />
										</Button>
									</div>
								</div>
								<Textarea
									value={ publicKey }
									readOnly
									placeholder="点击生成按钮..."
									className="flex-1 min-h-0 font-mono text-[10px] bg-green-50 resize-none"
								/>
							</div>

							{/* 私钥 */ }
							<div className="flex flex-col min-h-0">
								<div className="flex items-center justify-between mb-2">
									<Label className="text-sm font-medium text-red-700">
										<Key className="h-3 w-3 inline mr-1" />
										私钥
									</Label>
									<div className="flex gap-1">
										<Button
											size="sm"
											variant="ghost"
											className="h-6 px-2"
											onClick={ () => copyKey(privateKey, "私钥") }
											disabled={ !privateKey }
										>
											<Copy className="h-3 w-3" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											className="h-6 px-2"
											onClick={ () => downloadKey(privateKey, "private_key.pem") }
											disabled={ !privateKey }
										>
											<Download className="h-3 w-3" />
										</Button>
									</div>
								</div>
								<Textarea
									value={ privateKey }
									readOnly
									placeholder="点击生成按钮..."
									className="flex-1 min-h-0 font-mono text-[10px] bg-red-50 resize-none"
								/>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
