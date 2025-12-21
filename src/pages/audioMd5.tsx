import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Upload, Hash, Copy, CheckCheck } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useDropzone } from "react-dropzone"

export const Route = createFileRoute("/audioMd5")({
  component: RouteComponent,
})

// 纯JavaScript实现MD5算法
function md5(data: ArrayBuffer): string {
  // MD5常量
  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ]

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ]

  const H0 = 0x67452301
  const H1 = 0xefcdab89
  const H2 = 0x98badcfe
  const H3 = 0x10325476

  // 转换字节数组
  const bytes = new Uint8Array(data)
  const bitLength = bytes.length * 8

  // 填充
  const paddingLength = ((bitLength + 64) % 512) + (448 - ((bitLength + 64) % 512)) % 512
  const totalLength = (bitLength + paddingLength + 64) / 8 + 8

  const padded = new Uint8Array(totalLength)
  padded.set(bytes)

  // 添加填充位
  padded[bytes.length] = 0x80

  // 添加原始长度（小端序）
  const bits = BigInt(bitLength)
  const lengthBuffer = new ArrayBuffer(8)
  const lengthView = new DataView(lengthBuffer)
  lengthView.setBigUint64(0, bits, true)
  padded.set(new Uint8Array(lengthBuffer), totalLength - 8)

  // 处理每个512位块
  let a = H0, b = H1, c = H2, d = H3

  for (let i = 0; i < padded.length; i += 64) {
    const chunk = padded.slice(i, i + 64)
    const words = new Uint32Array(16)

    for (let j = 0; j < 16; j++) {
      words[j] = (chunk[j * 4]) | (chunk[j * 4 + 1] << 8) |
        (chunk[j * 4 + 2] << 16) | (chunk[j * 4 + 3] << 24)
    }

    let F = 0, g = 0
    const tempA = a, tempB = b, tempC = c, tempD = d

    for (let j = 0; j < 64; j++) {
      if (j < 16) {
        F = (b & c) | ((~b) & d)
        g = j
      } else if (j < 32) {
        F = (d & b) | ((~d) & c)
        g = (5 * j + 1) % 16
      } else if (j < 48) {
        F = b ^ c ^ d
        g = (3 * j + 5) % 16
      } else {
        F = c ^ (b | (~d))
        g = (7 * j) % 16
      }

      const temp = d
      d = c
      c = b
      b = (b + ((tempA + F + K[j] + words[g]) << S[j] |
        (tempA + F + K[j] + words[g]) >>> (32 - S[j]))) | 0
      a = temp
    }

    a = (a + tempA) | 0
    b = (b + tempB) | 0
    c = (c + tempC) | 0
    d = (d + tempD) | 0
  }

  // 转换为十六进制
  const result = [
    (a >>> 0).toString(16).padStart(8, '0'),
    (b >>> 0).toString(16).padStart(8, '0'),
    (c >>> 0).toString(16).padStart(8, '0'),
    (d >>> 0).toString(16).padStart(8, '0')
  ].join('')

  return result
}

// 计算文件MD5的函数
async function calculateMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = function (e) {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const md5Hash = md5(arrayBuffer)
        resolve(md5Hash)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = function () {
      reject(new Error('文件读取失败'))
    }

    reader.readAsArrayBuffer(file)
  })
}

function RouteComponent() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [md5, setMd5] = useState<string>('')
  const [calculating, setCalculating] = useState(false)
  const [copied, setCopied] = useState(false)

  // 处理文件选择
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const selectedFile = acceptedFiles[0]

    // 简单的音频文件类型检查
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3', 'audio/x-m4a', 'audio/aac']
    const extension = selectedFile.name.split('.').pop()?.toLowerCase()
    const isAudio = audioTypes.includes(selectedFile.type) ||
      ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(extension || '')

    if (!isAudio) {
      toast.error('请选择音频文件')
      return
    }

    setFile(selectedFile)
    setMd5('')
    toast.success(`已选择: ${selectedFile.name}`)
  }, [])

  // 计算MD5
  const handleCalculate = async () => {
    if (!file) {
      toast.error('请先选择音频文件')
      return
    }

    setCalculating(true)
    try {
      const md5Hash = await calculateMD5(file)
      setMd5(md5Hash)
      toast.success('MD5计算完成')
    } catch (error) {
      console.error('MD5计算失败:', error)
      toast.error('MD5计算失败')
    } finally {
      setCalculating(false)
    }
  }

  // 复制MD5到剪贴板
  const copyMD5 = async () => {
    if (!md5) return

    try {
      await navigator.clipboard.writeText(md5)
      setCopied(true)
      toast.success('已复制MD5到剪贴板')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败', err)
      toast.error('复制失败')
    }
  }

  // 清空选择
  const clearFile = () => {
    setFile(null)
    setMd5('')
    setCopied(false)
    toast.success('已清空')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.wma']
    },
    maxFiles: 1,
  })

  return (
    <div className="h-[calc(100vh-4.2rem)] p-4 md:p-6 overflow-hidden">
      <Card className="w-full max-w-2xl mx-auto h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="flex-shrink-0 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle>音频文件MD5计算</CardTitle>
            <Button onClick={ () => navigate({ to: "/" }) } variant="ghost" className="dark:hover:bg-gray-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 overflow-y-auto min-h-0 p-6">
          {/* 文件选择区域 */ }
          <div
            { ...getRootProps() }
            className={ `border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-300"}
              ${calculating ? "pointer-events-none opacity-50" : ""}` }
          >
            <input { ...getInputProps() } disabled={ calculating } />
            <Upload className="h-12 w-12 mx-auto mb-4 text-blue-500" />
            <p className="text-xl font-medium text-gray-700 mb-2">
              { isDragActive ? "松开鼠标选择" : calculating ? "计算中..." : "拖放音频文件或点击选择" }
            </p>
            <p className="text-sm text-gray-500">
              支持 MP3, WAV, OGG, M4A, AAC, FLAC, WMA 等格式
            </p>
          </div>

          {/* 文件信息区域 */ }
          { file && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Hash className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <p className="font-medium">{ file.name }</p>
                    <p className="text-sm text-gray-500">
                      { (file.size / 1024).toFixed(2) } KB - { file.type || '未知类型' }
                    </p>
                  </div>
                </div>

                { md5 && (
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-3 flex items-center justify-between gap-2">
                    <code className="text-sm font-mono text-blue-600 dark:text-blue-400 break-all flex-1">
                      { md5 }
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 flex-shrink-0"
                      onClick={ copyMD5 }
                    >
                      { copied ? (
                        <CheckCheck className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      ) }
                    </Button>
                  </div>
                ) }
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={ clearFile }
                  disabled={ calculating }
                >
                  清空
                </Button>
                <Button
                  variant="default"
                  onClick={ handleCalculate }
                  disabled={ calculating || !file }
                >
                  { calculating ? '计算中...' : '计算MD5' }
                </Button>
              </div>
            </div>
          ) }

          {/* 说明区域 */ }
          <div className="text-sm text-gray-500 space-y-2 mt-4">
            <p className="font-medium">说明：</p>
            <ul className="list-disc list-inside space-y-1">
              <li>使用纯JavaScript实现MD5算法</li>
              <li>所有计算在本地完成，文件不会上传到服务器</li>
              <li>支持常见的音频格式</li>
              <li>计算结果可以一键复制</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
