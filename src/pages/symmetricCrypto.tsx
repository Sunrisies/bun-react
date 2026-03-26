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
import { Textarea } from "@/components/ui/textarea";
import { useCopy, useSample } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/symmetricCrypto")({
	component: SymmetricCrypto,
});

type Algorithm = "AES-GCM" | "AES-CBC" | "AES-CTR";
type OutputFormat = "base64" | "hex";

function hexToBytes(hex: string): Uint8Array {
	const bytes = new Uint8Array(hex.length / 2);
	for (let i = 0; i < hex.length; i += 2) {
		bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
	}
	return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

function bytesToBase64(bytes: Uint8Array): string {
	let binary = "";
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

function textToBytes(text: string): Uint8Array {
	return new TextEncoder().encode(text);
}

function bytesToText(bytes: Uint8Array): string {
	return new TextDecoder().decode(bytes);
}

async function deriveKey(
	password: string,
	algorithm: Algorithm,
): Promise<CryptoKey> {
	const keyBytes = textToBytes(password);

	let keyLength: number;
	if (algorithm.startsWith("AES-256")) {
		keyLength = 32;
	} else if (algorithm.startsWith("AES-192")) {
		keyLength = 24;
	} else {
		keyLength = 16;
	}

	const paddedKey = new Uint8Array(keyLength);
	paddedKey.set(keyBytes.slice(0, keyLength));

	return crypto.subtle.importKey("raw", paddedKey, algorithm, false, [
		"encrypt",
		"decrypt",
	]);
}

function getAlgoParams(
	algorithm: Algorithm,
	iv: Uint8Array,
): AlgorithmIdentifier | AesGcmParams | AesCbcParams | AesCtrParams {
	if (algorithm === "AES-GCM") {
		return { name: "AES-GCM", iv, tagLength: 128 };
	} else if (algorithm === "AES-CBC") {
		return { name: "AES-CBC", iv };
	} else {
		return { name: "AES-CTR", counter: iv, length: 128 };
	}
}

async function encrypt(
	plaintext: string,
	password: string,
	algorithm: Algorithm,
	outputFormat: OutputFormat,
): Promise<string> {
	const key = await deriveKey(password, algorithm);
	const iv = crypto.getRandomValues(new Uint8Array(16));
	const data = textToBytes(plaintext);

	const algoParams = getAlgoParams(algorithm, iv);
	const encrypted = await crypto.subtle.encrypt(algoParams, key, data);

	const encryptedBytes = new Uint8Array(encrypted);

	const result = new Uint8Array(iv.length + encryptedBytes.length);
	result.set(iv);
	result.set(encryptedBytes, iv.length);

	if (outputFormat === "hex") {
		return bytesToHex(result);
	}
	return bytesToBase64(result);
}

async function decrypt(
	ciphertext: string,
	password: string,
	algorithm: Algorithm,
	inputFormat: OutputFormat,
): Promise<string> {
	let encryptedData: Uint8Array;

	if (inputFormat === "hex") {
		encryptedData = hexToBytes(ciphertext);
	} else {
		encryptedData = base64ToBytes(ciphertext);
	}

	const iv = encryptedData.slice(0, 16);
	const data = encryptedData.slice(16);

	const key = await deriveKey(password, algorithm);
	const algoParams = getAlgoParams(algorithm, iv);

	const decrypted = await crypto.subtle.decrypt(algoParams, key, data);
	return bytesToText(new Uint8Array(decrypted));
}

function SymmetricCrypto() {
	const { copy } = useCopy();
	const [algorithm, setAlgorithm] = useState<Algorithm>("AES-CBC");
	const [password, setPassword] = useState("");
	const [inputText, setInputText] = useState("");
	const [outputText, setOutputText] = useState("");
	const [outputFormat, setOutputFormat] = useState<OutputFormat>("base64");
	const [error, setError] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	const { loadSample } = useSample(
		() => {
			setPassword("my-secret-key-123");
			setInputText("Hello, World! 这是一个加密测试。");
		},
		undefined,
		"示例数据已加载",
	);

	const handleEncrypt = async () => {
		if (!inputText.trim()) {
			setError("请输入要加密的内容");
			return;
		}
		if (!password.trim()) {
			setError("请输入密钥");
			return;
		}
		setIsProcessing(true);
		setError(null);
		try {
			const result = await encrypt(
				inputText,
				password,
				algorithm,
				outputFormat,
			);
			setOutputText(result);
			toast.success("加密成功");
		} catch (err) {
			setError(err instanceof Error ? err.message : "加密失败");
			setOutputText("");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDecrypt = async () => {
		if (!inputText.trim()) {
			setError("请输入要解密的内容");
			return;
		}
		if (!password.trim()) {
			setError("请输入密钥");
			return;
		}
		setIsProcessing(true);
		setError(null);
		try {
			const result = await decrypt(
				inputText,
				password,
				algorithm,
				outputFormat,
			);
			setOutputText(result);
			toast.success("解密成功");
		} catch {
			setError("解密失败，请检查密钥和密文格式是否正确");
			setOutputText("");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<ToolPage
			title="对称加密/解密"
			description="使用 Web Crypto API 实现，支持 AES-CBC、AES-GCM、AES-CTR 算法。所有操作在本地完成，数据不会上传。"
			maxWidth="max-w-4xl"
			actions={
				<Button onClick={loadSample} variant="outline" size="sm">
					示例
				</Button>
			}
		>
			<div className="h-full flex flex-col gap-4">
				<div className="flex gap-4 items-end flex-shrink-0">
					<div className="space-y-1">
						<Label className="text-xs">算法</Label>
						<Select
							value={algorithm}
							onValueChange={(v) => setAlgorithm(v as Algorithm)}
						>
							<SelectTrigger className="w-32 h-8 text-sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="AES-CBC">AES-CBC</SelectItem>
								<SelectItem value="AES-GCM">AES-GCM</SelectItem>
								<SelectItem value="AES-CTR">AES-CTR</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex-1 space-y-1">
						<Label className="text-xs">密钥</Label>
						<Input
							type="text"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="输入加密密钥..."
							className="h-8 text-sm font-mono"
						/>
					</div>
					<div className="space-y-1">
						<Label className="text-xs">输出格式</Label>
						<Select
							value={outputFormat}
							onValueChange={(v) => setOutputFormat(v as OutputFormat)}
						>
							<SelectTrigger className="w-24 h-8 text-sm">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="base64">Base64</SelectItem>
								<SelectItem value="hex">Hex</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{error && (
					<div className="p-2 bg-red-50 rounded-lg border border-red-200 flex-shrink-0">
						<p className="text-xs text-red-600">{error}</p>
					</div>
				)}

				<div className="flex-1 min-h-0 grid grid-cols-2 gap-4">
					<div className="flex flex-col min-h-0">
						<Label className="text-sm font-medium mb-2">
							输入（明文/密文）
						</Label>
						<Textarea
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							placeholder="输入要加密的明文或要解密的密文..."
							className="flex-1 font-mono text-xs resize-none"
						/>
						<div className="flex gap-2 mt-3">
							<Button
								onClick={handleEncrypt}
								disabled={isProcessing}
								className="flex-1"
								size="sm"
							>
								<Lock className="h-4 w-4 mr-1" />
								加密
							</Button>
							<Button
								onClick={handleDecrypt}
								disabled={isProcessing}
								variant="outline"
								className="flex-1"
								size="sm"
							>
								<Unlock className="h-4 w-4 mr-1" />
								解密
							</Button>
						</div>
					</div>
					<div className="flex flex-col min-h-0">
						<div className="flex justify-between items-center mb-2">
							<Label className="text-sm font-medium">输出结果</Label>
							{outputText && (
								<Button
									size="sm"
									variant="ghost"
									className="h-6 px-2"
									onClick={() => copy(outputText)}
								>
									<Copy className="h-3 w-3 mr-1" />
									<span className="text-xs">复制</span>
								</Button>
							)}
						</div>
						<Textarea
							value={outputText}
							readOnly
							placeholder="加密/解密结果将显示在这里..."
							className="flex-1 font-mono text-xs resize-none bg-gray-50"
						/>
					</div>
				</div>

				<div className="flex-shrink-0 grid grid-cols-3 gap-3 text-xs">
					<div className="p-2 bg-gray-50 rounded-lg border">
						<div className="font-medium text-gray-700 mb-1">AES-CBC</div>
						<p className="text-gray-500">密码块链接模式，需要初始化向量</p>
					</div>
					<div className="p-2 bg-gray-50 rounded-lg border">
						<div className="font-medium text-gray-700 mb-1">AES-GCM</div>
						<p className="text-gray-500">
							认证加密模式，提供机密性和完整性保护
						</p>
					</div>
					<div className="p-2 bg-gray-50 rounded-lg border">
						<div className="font-medium text-gray-700 mb-1">AES-CTR</div>
						<p className="text-gray-500">
							计数器模式，可并行处理，适合高速加密
						</p>
					</div>
				</div>
			</div>
		</ToolPage>
	);
}
