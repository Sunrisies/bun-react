import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { createLazyFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createLazyFileRoute('/calculateDistance')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()

  // 统一的状态管理 - 支持多种格式输入
  const [input1, setInput1] = useState('')
  const [input2, setInput2] = useState('')

  const [unit, setUnit] = useState('m')
  const [distance, setDistance] = useState('')
  const [mode, setMode] = useState('separate') // separate 或 combined

  // 增强的坐标解析函数，支持多种格式
  const parseCoordinates = (str: string) => {
    if (!str || str.trim() === '') return null

    // 去除首尾空格
    str = str.trim()

    // 支持的格式：
    // 1. "32.223851,119.420778" - 标准格式
    // 2. "119.420778,32.223851" - 反序格式
    // 3. "32.223851" - 单个数值（需要另一个点配合）
    // 4. "经度: 119.420778, 纬度: 32.223851" - 带标签格式
    // 5. "32.223851 119.420778" - 空格分隔

    // 尝试提取数字
    const numberRegex = /-?\d+\.?\d*/g
    const numbers = str.match(numberRegex)

    if (!numbers || numbers.length === 0) return null

    // 如果只有一个数字，返回null（需要另一个点）
    if (numbers.length === 1) {
      return null
    }

    // 如果有两个或更多数字，取前两个
    const num1 = parseFloat(numbers[0])
    const num2 = parseFloat(numbers[1])

    if (isNaN(num1) || isNaN(num2)) return null

    // 判断哪个是经度，哪个是纬度
    // 经度范围：-180 到 180，纬度范围：-90 到 90
    if (Math.abs(num1) <= 180 && Math.abs(num2) <= 90) {
      // 假设第一个是经度，第二个是纬度
      return { lng: num1, lat: num2 }
    } else if (Math.abs(num2) <= 180 && Math.abs(num1) <= 90) {
      // 反过来
      return { lng: num2, lat: num1 }
    } else {
      // 无法判断，尝试第一个组合
      return { lng: num1, lat: num2 }
    }
  }

  // 从输入框获取坐标数据
  const getCoordinates = () => {
    let coord1: { lng: number; lat: number } | null = null
    let coord2: { lng: number; lat: number } | null = null

    if (mode === 'separate') {
      // 分开输入模式 - 每个输入框只能接受一个坐标点
      // 需要4个输入框，但我们只有2个，所以需要改变策略
      // 将输入框改为支持粘贴完整坐标
      coord1 = parseCoordinates(input1)
      coord2 = parseCoordinates(input2)
    } else {
      // 合并输入模式 - 支持多种格式
      coord1 = parseCoordinates(input1)
      coord2 = parseCoordinates(input2)
    }

    return { coord1, coord2 }
  }

  const calculateDistance = () => {
    const { coord1, coord2 } = getCoordinates()

    if (!coord1 || !coord2) {
      alert("请输入有效的坐标点。\n\n支持格式：\n• 经度,纬度 (如: 119.420778,32.223851)\n• 纬度,经度 (如: 32.223851,119.420778)\n• 带标签的格式\n• 空格分隔")
      return
    }

    // 验证经纬度范围
    if (Math.abs(coord1.lat) > 90 || Math.abs(coord2.lat) > 90 ||
      Math.abs(coord1.lng) > 180 || Math.abs(coord2.lng) > 180) {
      alert("经纬度数值超出有效范围\n纬度: -90 到 90\n经度: -180 到 180")
      return
    }

    // 计算距离（使用Haversine公式）
    const R = {
      km: 6371,
      m: 6371000,
      mi: 3956
    }[unit]

    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
    const dLon = (coord2.lng - coord1.lng) * Math.PI / 180

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coord1.lat * Math.PI / 180) *
      Math.cos(coord2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const rawDistance = R! * c

    // 格式化输出
    const formatted = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2
    }).format(rawDistance)

    setDistance(`${formatted} ${unit}`)
  }

  return (
    <div className='flex h-full items-center justify-center p-4'>
      <Card className="w-full max-w-2xl">
        <CardHeader className='flex flex-row justify-between items-center'>
          <div>
            <CardTitle className="text-xl">地理距离计算器</CardTitle>
            <CardDescription>
              输入两个地理坐标点计算距离，支持多种格式粘贴
              { mode === 'separate' ? ' (每个输入框粘贴一个完整坐标)' : ' (每个输入框粘贴一个完整坐标)' }
            </CardDescription>
          </div>
          <div className=''>
            <Button onClick={ () => navigate({ to: '/' }) }>返回</Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>输入模式</Label>
              <Select value={ mode } onValueChange={ setMode }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="separate">分开输入</SelectItem>
                  <SelectItem value="combined">合并输入</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>计算单位</Label>
              <Select value={ unit } onValueChange={ setUnit }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="m">米</SelectItem>
                  <SelectItem value="km">千米</SelectItem>
                  <SelectItem value="mi">英里</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>第一个点（支持复制粘贴）</Label>
              <Input
                placeholder="例如: 32.223851,119.420778 或 119.420778,32.223851"
                value={ input1 }
                onChange={ e => setInput1(e.target.value) }
              />
              <p className="text-xs text-muted-foreground">
                支持格式: 经度,纬度 | 纬度,经度 | 带标签 | 空格分隔
              </p>
            </div>

            <div className="space-y-2">
              <Label>第二个点（支持复制粘贴）</Label>
              <Input
                placeholder="例如: 32.223851,119.420778 或 119.420778,32.223851"
                value={ input2 }
                onChange={ e => setInput2(e.target.value) }
              />
              <p className="text-xs text-muted-foreground">
                支持格式: 经度,纬度 | 纬度,经度 | 带标签 | 空格分隔
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button
              className="w-full max-w-xs"
              onClick={ calculateDistance }
            >
              计算距离
            </Button>

            { distance && (
              <div className="text-2xl font-semibold text-primary">
                { distance }
              </div>
            ) }
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm space-y-2">
            <p className="font-semibold">支持的粘贴格式示例：</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>32.223851,119.420778</li>
              <li>119.420778,32.223851</li>
              <li>经度: 119.420778, 纬度: 32.223851</li>
              <li>32.223851 119.420778</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
