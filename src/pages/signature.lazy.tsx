import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'

export const Route = createLazyFileRoute('/signature')({
    component: RouteComponent,
})

function RouteComponent() {
    const [isEnglish, setIsEnglish] = useState(true)
    const [inputText, setInputText] = useState('')
    const [signatureName, setSignatureName] = useState('')
    const [signatures, setSignatures] = useState<Array<{ name: string; svg: string }>>([])
    const svgRef = useRef<SVGSVGElement>(null)
    const [fontSize, setFontSize] = useState(72)
    // 嵌入字体
    const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script&display=swap');
    .signature-text {
      font-family: 'Dancing Script', cursive;
      font-size: 24px;
      stroke-width: 1;
    }
  `
    // 检测是否纯英文（允许空格和常见标点）
    const checkEnglish = (text: string) => {
        return /^[A-Za-z\s.,'!?-]+$/.test(text)
    }
    // 修改输入处理函数
    const handleInputChange = (text: string) => {
        const trimmed = text.slice(0, 10)
        setInputText(trimmed)
        setIsEnglish(checkEnglish(trimmed))
    }

    const generateSignature = () => {
        if (!inputText.trim() || inputText.length > 10) return

        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200">
       <style>${fontStyle}</style>
        <text 
          x="50%" 
          y="50%" 
           dominant-baseline="middle"
           text-anchor="middle" 
          font-family="'Dancing Script', cursive" 
          font-size="${fontSize}px"
          stroke-width="1"
        >
          ${inputText}
        </text>
      </svg>
    `

        if (svgRef.current) {
            svgRef.current.innerHTML = svg
        }
    }

    const handleSave = () => {
        if (signatureName && svgRef.current?.outerHTML) {
            setSignatures(prev => [
                ...prev,
                { name: signatureName, svg: svgRef.current!.outerHTML }
            ])
        }
    }
    const navigate = useNavigate()

    const handleExport = () => {
        if (!svgRef.current) return

        const svgData = new XMLSerializer().serializeToString(svgRef.current)
        const blob = new Blob([svgData], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        const downloadName = signatureName || '签名' + Date.now()
        link.download = `${downloadName}.svg`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    const handleClear = () => {
        setInputText('')
        setSignatureName('')
        if (svgRef.current) {
            svgRef.current.innerHTML = ''
        }
    }

    return (
        <Card className="max-w-2xl mx-auto my-8">
            <CardHeader className="text-2xl font-bold">签名生成器</CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Input
                        value={ inputText }
                        onChange={ (e) => handleInputChange(e.target.value) }
                        placeholder="输入签名内容（最多10个字符）"
                    />
                    <div className="text-sm text-muted-foreground">
                        已输入 { inputText.length }/10 个字符
                    </div>
                    { !isEnglish && (
                        <span className="text-orange-600">
                            仅支持英文字符和常用标点
                        </span>
                    ) }
                </div>

                <div className="flex gap-4">
                    <Input
                        value={ signatureName }
                        onChange={ (e) => setSignatureName(e.target.value) }
                        placeholder="签名名称"
                        className="flex-1"
                    />
                    <Input
                        type="number"
                        value={ fontSize }
                        onChange={ (e) => setFontSize(Number(e.target.value)) }
                        className="w-24"
                    />
                </div>

                <div className="border rounded-lg p-4 bg-background">
                    <svg
                        ref={ svgRef }
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 600 200"
                        className="w-full h-32"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    <Button onClick={ generateSignature }>生成签名</Button>
                    <Button variant="outline" onClick={ handleClear }>清除</Button>
                    <Button variant="secondary" onClick={ handleExport }>导出SVG</Button>
                    <Button onClick={ handleSave }>保存签名</Button>
                    <Button onClick={ () => navigate({ to: '/' }) }>返回</Button>

                </div>
            </CardContent>

            { signatures.length > 0 && (
                <CardFooter className="flex flex-col items-start gap-2">
                    <h3 className="font-medium">已保存签名：</h3>
                    <div className="flex flex-wrap gap-2">
                        { signatures.map((sig, index) => (
                            <div
                                key={ index }
                                className="border p-2 rounded-md"
                                dangerouslySetInnerHTML={ { __html: sig.svg } }
                            />
                        )) }
                    </div>
                </CardFooter>
            ) }
        </Card>
    )
}
