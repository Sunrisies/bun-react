import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { copyToClipboard } from "@/lib/utils"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, BookOpen, Copy, FileText, Type } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/hashCalculator")({
  component: HashCalculator,
})

type HashAlgorithm = "MD5" | "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512"

interface HashResult {
  algorithm: string
  hex: string
  base64: string
}

// MD5 算法实现
function md5(input: string): string {
  function rotateLeft(lValue: number, iShiftBits: number): number {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits))
  }

  function addUnsigned(lX: number, lY: number): number {
    const lX8 = lX & 0x80000000
    const lY8 = lY & 0x80000000
    const lX4 = lX & 0x40000000
    const lY4 = lY & 0x40000000
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff)
    if (lX4 & lY4) {
      return lResult ^ 0x80000000 ^ lX8 ^ lY8
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return lResult ^ 0xc0000000 ^ lX8 ^ lY8
      } else {
        return lResult ^ 0x40000000 ^ lX8 ^ lY8
      }
    } else {
      return lResult ^ lX8 ^ lY8
    }
  }

  function F(x: number, y: number, z: number): number {
    return (x & y) | (~x & z)
  }

  function G(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z)
  }

  function H(x: number, y: number, z: number): number {
    return x ^ y ^ z
  }

  function I(x: number, y: number, z: number): number {
    return y ^ (x | ~z)
  }

  function FF(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number,
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function GG(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number,
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function HH(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number,
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function II(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number,
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac))
    return addUnsigned(rotateLeft(a, s), b)
  }

  function convertToWordArray(str: string): number[] {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(str)
    const len = bytes.length
    const words: number[] = []

    // 将字节转换为32位字（小端序）
    for (let i = 0; i < len; i += 4) {
      let word = 0
      for (let j = 0; j < 4 && i + j < len; j++) {
        word |= bytes[i + j] << (j * 8)
      }
      words.push(word >>> 0) // 确保为无符号32位整数
    }

    // 添加填充位
    const bitLen = len * 8
    const padIndex = Math.floor(len / 4)
    const bytePos = len % 4

    if (bytePos === 0) {
      words.push(0x00000080)
    } else if (bytePos === 1) {
      words[padIndex] = (words[padIndex] & 0x000000ff) | 0x00008000
    } else if (bytePos === 2) {
      words[padIndex] = (words[padIndex] & 0x0000ffff) | 0x00800000
    } else if (bytePos === 3) {
      words[padIndex] = (words[padIndex] & 0x00ffffff) | 0x80000000
    }

    // 填充到 16 的倍数，确保有空间存储长度
    while (words.length % 16 !== 14) {
      words.push(0)
    }

    // 添加原始长度（64位，低32位在前）
    words.push(bitLen >>> 0)
    words.push((bitLen / 0x100000000) >>> 0)

    return words
  }

  function wordToHex(value: number): string {
    let hex = ""
    for (let i = 0; i < 4; i++) {
      const byte = (value >>> (i * 8)) & 0xff
      hex += byte.toString(16).padStart(2, "0")
    }
    return hex
  }

  const x = convertToWordArray(input)

  let a = 0x67452301
  let b = 0xefcdab89
  let c = 0x98badcfe
  let d = 0x10325476

  const S11 = 7,
    S12 = 12,
    S13 = 17,
    S14 = 22
  const S21 = 5,
    S22 = 9,
    S23 = 14,
    S24 = 20
  const S31 = 4,
    S32 = 11,
    S33 = 16,
    S34 = 23
  const S41 = 6,
    S42 = 10,
    S43 = 15,
    S44 = 21

  for (let k = 0; k < x.length; k += 16) {
    const AA = a,
      BB = b,
      CC = c,
      DD = d

    // 第一轮
    a = FF(a, b, c, d, x[k], S11, 0xd76aa478)
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756)
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db)
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee)
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf)
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a)
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613)
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501)
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8)
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af)
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1)
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be)
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122)
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193)
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e)
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821)

    // 第二轮
    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562)
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340)
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51)
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa)
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d)
    d = GG(d, a, b, c, x[k + 10], S22, 0x02441453)
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681)
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8)
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6)
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6)
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87)
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed)
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905)
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8)
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9)
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a)

    // 第三轮
    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942)
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681)
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122)
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c)
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44)
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9)
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60)
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70)
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6)
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa)
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085)
    b = HH(b, c, d, a, x[k + 6], S34, 0x04881d05)
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039)
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5)
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8)
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665)

    // 第四轮
    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244)
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97)
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7)
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039)
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3)
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92)
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d)
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1)
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f)
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0)
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314)
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1)
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82)
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235)
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb)
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391)

    a = addUnsigned(a, AA)
    b = addUnsigned(b, BB)
    c = addUnsigned(c, CC)
    d = addUnsigned(d, DD)
  }

  return (
    wordToHex(a) +
    wordToHex(b) +
    wordToHex(c) +
    wordToHex(d)
  ).toLowerCase()
}

// 将十六进制字符串转换为 Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return bytes
}

// 将 Uint8Array 转换为 Base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

async function calculateHash(
  text: string,
  algorithm: HashAlgorithm,
): Promise<{ hex: string; base64: string }> {
  if (algorithm === "MD5") {
    const hex = md5(text)
    const bytes = hexToBytes(hex)
    return { hex, base64: bytesToBase64(bytes) }
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(text)

  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  const base64 = bytesToBase64(new Uint8Array(hashBuffer))

  return { hex, base64 }
}

async function calculateFileHash(
  file: File,
  algorithm: HashAlgorithm,
): Promise<{ hex: string; base64: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)

        if (algorithm === "MD5") {
          const decoder = new TextDecoder()
          const text = decoder.decode(uint8Array)
          const hex = md5(text)
          const bytes = hexToBytes(hex)
          resolve({ hex, base64: bytesToBase64(bytes) })
        } else {
          const hashBuffer = await crypto.subtle.digest(algorithm, uint8Array)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          const hex = hashArray
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
          const base64 = bytesToBase64(new Uint8Array(hashBuffer))
          resolve({ hex, base64 })
        }
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error("文件读取失败"))
    reader.readAsArrayBuffer(file)
  })
}

function HashCalculator() {
  const navigate = useNavigate()
  const [inputText, setInputText] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("SHA-256")
  const [results, setResults] = useState<HashResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"text" | "file">("text")
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateAllAlgorithms = useCallback(async () => {
    setIsCalculating(true)
    setError(null)

    try {
      const text = activeTab === "text" ? inputText : ""

      if (activeTab === "text" && !text.trim()) {
        setResults([])
        setError(null)
        return
      }

      if (activeTab === "file" && !selectedFile) {
        setResults([])
        setError("请选择文件")
        return
      }

      const algorithms: HashAlgorithm[] = [
        "MD5",
        "SHA-1",
        "SHA-256",
        "SHA-384",
        "SHA-512",
      ]
      const newResults: HashResult[] = []

      if (activeTab === "text") {
        for (const algo of algorithms) {
          const { hex, base64 } = await calculateHash(text, algo)
          newResults.push({ algorithm: algo, hex, base64 })
        }
      } else if (selectedFile) {
        for (const algo of algorithms) {
          const { hex, base64 } = await calculateFileHash(selectedFile, algo)
          newResults.push({ algorithm: algo, hex, base64 })
        }
      }

      setResults(newResults)
    } catch (err) {
      console.error("计算 Hash 失败", err)
      setError("计算 Hash 失败，请检查输入")
      setResults([])
    } finally {
      setIsCalculating(false)
    }
  }, [inputText, selectedFile, activeTab])

  const calculateSingleAlgorithm = useCallback(async () => {
    setIsCalculating(true)
    setError(null)

    try {
      if (activeTab === "text" && !inputText.trim()) {
        setResults([])
        setError(null)
        return
      }

      if (activeTab === "file" && !selectedFile) {
        setResults([])
        setError("请选择文件")
        return
      }

      let result: { hex: string; base64: string }
      if (activeTab === "text") {
        result = await calculateHash(inputText, algorithm)
      } else if (selectedFile) {
        result = await calculateFileHash(selectedFile, algorithm)
      } else {
        return
      }

      setResults([{ algorithm, hex: result.hex, base64: result.base64 }])
    } catch (err) {
      console.error("计算 Hash 失败", err)
      setError("计算 Hash 失败，请检查输入")
      setResults([])
    } finally {
      setIsCalculating(false)
    }
  }, [inputText, selectedFile, algorithm, activeTab])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
    }
  }

  const loadSampleData = () => {
    setInputText("Hello, World! 这是一个 Hash 计算器测试。")
    toast.success("示例数据已加载")
  }

  return (
    <div className="min-h-[calc(100vh-4.2rem)] p-4 md:p-6">
      <Card className="w-full max-w-4xl mx-auto px-3 py-2 shadow-lg">
        <CardHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              Hash 计算器
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span className="text-xs">算法说明</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Hash 算法对比与使用场景</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 pt-4">
                    {/* 算法对比表 */ }
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-800">
                        算法对比
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-200 p-2 text-left">
                                算法
                              </th>
                              <th className="border border-gray-200 p-2 text-left">
                                输出长度
                              </th>
                              <th className="border border-gray-200 p-2 text-left">
                                安全性
                              </th>
                              <th className="border border-gray-200 p-2 text-left">
                                速度
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-200 p-2 font-mono">
                                MD5
                              </td>
                              <td className="border border-gray-200 p-2">
                                128位 (32字符)
                              </td>
                              <td className="border border-gray-200 p-2">
                                <span className="text-red-600 font-medium">
                                  已不安全
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2">
                                极快
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-200 p-2 font-mono">
                                SHA-1
                              </td>
                              <td className="border border-gray-200 p-2">
                                160位 (40字符)
                              </td>
                              <td className="border border-gray-200 p-2">
                                <span className="text-orange-600 font-medium">
                                  不推荐
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2">快</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-200 p-2 font-mono">
                                SHA-256
                              </td>
                              <td className="border border-gray-200 p-2">
                                256位 (64字符)
                              </td>
                              <td className="border border-gray-200 p-2">
                                <span className="text-green-600 font-medium">
                                  安全
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2">
                                较快
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td className="border border-gray-200 p-2 font-mono">
                                SHA-384
                              </td>
                              <td className="border border-gray-200 p-2">
                                384位 (96字符)
                              </td>
                              <td className="border border-gray-200 p-2">
                                <span className="text-green-600 font-medium">
                                  安全
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2">
                                中等
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-200 p-2 font-mono">
                                SHA-512
                              </td>
                              <td className="border border-gray-200 p-2">
                                512位 (128字符)
                              </td>
                              <td className="border border-gray-200 p-2">
                                <span className="text-green-600 font-medium">
                                  安全
                                </span>
                              </td>
                              <td className="border border-gray-200 p-2">
                                中等
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 使用场景 */ }
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-800">
                        使用场景
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800 mb-1">
                            MD5
                          </div>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            <li>文件完整性校验（非安全场景）</li>
                            <li>生成简单的唯一标识符</li>
                            <li>缓存键值生成</li>
                            <li className="text-red-600">
                              ⚠️ 不要用于密码存储或数字签名
                            </li>
                          </ul>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800 mb-1">
                            SHA-1
                          </div>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            <li>Git 版本控制的提交哈希</li>
                            <li>旧系统的兼容性需求</li>
                            <li className="text-orange-600">
                              ⚠️ 不推荐用于新项目
                            </li>
                          </ul>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-gray-800 mb-1">
                            SHA-256 / SHA-384 / SHA-512
                          </div>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            <li>数字签名和证书</li>
                            <li>区块链和加密货币</li>
                            <li>安全的密码存储（需加盐）</li>
                            <li>API 签名验证</li>
                            <li>HTTPS/SSL 证书</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Hex 与 Base64 说明 */ }
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-800">
                        Hex 与 Base64 格式
                      </h3>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-2">
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">
                            Hex (十六进制):
                          </span>{ " " }
                          使用 0-9 和 a-f 表示，每字节需要2个字符
                        </p>
                        <p className="text-gray-600">
                          <span className="font-medium text-gray-800">
                            Base64:
                          </span>{ " " }
                          使用 A-Z, a-z, 0-9, +, / 表示，比 Hex 更紧凑
                        </p>
                        <div className="mt-2 p-2 bg-white rounded border text-xs font-mono">
                          <div className="text-gray-500 mb-1">
                            示例 ("Hello" 的 MD5):
                          </div>
                          <div>
                            Hex:{ " " }
                            <span className="text-blue-600">
                              8b1a9953c4611296a827abf8c47804d7
                            </span>
                          </div>
                          <div>
                            Base64:{ " " }
                            <span className="text-green-600">
                              ixqVU8RhEaCoJ6v0x3gE1w==
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>

            <Button
              onClick={ () => navigate({ to: "/" }) }
              variant="ghost"
              className="dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 输入类型选择 */ }
            <Tabs
              value={ activeTab }
              onValueChange={ (v) => setActiveTab(v as "text" | "file") }
            >
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  文本输入
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  文件输入
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>输入文本</Label>
                    <Button
                      onClick={ loadSampleData }
                      variant="outline"
                      size="sm"
                    >
                      加载示例
                    </Button>
                  </div>
                  <Textarea
                    placeholder="请输入要计算 Hash 的文本..."
                    value={ inputText }
                    onChange={ (e) => {
                      setInputText(e.target.value)
                      setError(null)
                    } }
                    className="h-24 font-mono resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="file" className="mt-4">
                <div className="space-y-2">
                  <Label>选择文件</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      onChange={ handleFileChange }
                      className="flex-1"
                    />
                    { selectedFile && (
                      <span className="text-sm text-gray-500 whitespace-nowrap">
                        { selectedFile.name } (
                        { (selectedFile.size / 1024).toFixed(2) } KB)
                      </span>
                    ) }
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* 算法选择与操作 */ }
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Label>算法</Label>
                <Select
                  value={ algorithm }
                  onValueChange={ (v) => setAlgorithm(v as HashAlgorithm) }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MD5">MD5</SelectItem>
                    <SelectItem value="SHA-1">SHA-1</SelectItem>
                    <SelectItem value="SHA-256">SHA-256</SelectItem>
                    <SelectItem value="SHA-384">SHA-384</SelectItem>
                    <SelectItem value="SHA-512">SHA-512</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={ calculateSingleAlgorithm }
                disabled={ isCalculating }
                size="sm"
              >
                计算 { algorithm }
              </Button>
              <Button
                onClick={ calculateAllAlgorithms }
                variant="outline"
                disabled={ isCalculating }
                size="sm"
              >
                计算所有算法
              </Button>
            </div>

            {/* 错误提示 */ }
            { error && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">{ error }</p>
              </div>
            ) }

            {/* 结果显示 */ }
            { results.length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">计算结果</Label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-2 font-semibold">算法</th>
                        <th className="text-left p-2 font-semibold">
                          Hex (十六进制)
                        </th>
                        <th className="text-left p-2 font-semibold">Base64</th>
                        <th className="text-center p-2 font-semibold w-20">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      { results.map((result) => (
                        <tr
                          key={ result.algorithm }
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-2">
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                              { result.algorithm }
                            </span>
                          </td>
                          <td className="p-2">
                            <code className="text-xs font-mono break-all text-gray-700">
                              { result.hex }
                            </code>
                          </td>
                          <td className="p-2">
                            <code className="text-xs font-mono break-all text-gray-700">
                              { result.base64 }
                            </code>
                          </td>
                          <td className="p-2 text-center">
                            <div className="flex gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={ () => copyToClipboard(result.hex) }
                                title="复制 Hex"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                onClick={ () => copyToClipboard(result.base64) }
                                title="复制 Base64"
                              >
                                <span className="text-xs font-bold">64</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )) }
                    </tbody>
                  </table>
                </div>
              </div>
            ) }
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
