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
  // 分开输入模式的状态
  const [point1, setPoint1] = useState({ lng: '', lat: '' })
  const [point2, setPoint2] = useState({ lng: '', lat: '' })

  // 合并输入模式的状态
  const [combined1, setCombined1] = useState('')
  const [combined2, setCombined2] = useState('')

  const [unit, setUnit] = useState('m')
  const [distance, setDistance] = useState('')
  const [mode, setMode] = useState('separate')

  const parseCoordinates = (str: string) => {
    const parts = str.split(/,\s*/).map(parseFloat)
    if (parts.length !== 2 || parts.some(isNaN)) return null
    return { lng: parts[0], lat: parts[1] }
  }

  const calculateDistance = () => {
    let coord1, coord2

    if (mode === 'separate') {
      coord1 = {
        lng: parseFloat(point1.lng),
        lat: parseFloat(point1.lat)
      }
      coord2 = {
        lng: parseFloat(point2.lng),
        lat: parseFloat(point2.lat)
      }
    } else {
      coord1 = parseCoordinates(combined1)
      coord2 = parseCoordinates(combined2)
    }

    if (!coord1 || !coord2) {
      alert("请输入有效的经纬度值")
      return
    }

    // 验证经纬度范围
    if (Math.abs(coord1.lat) > 90 || Math.abs(coord2.lat) > 90 ||
      Math.abs(coord1.lng) > 180 || Math.abs(coord2.lng) > 180) {
      alert("经纬度数值超出有效范围")
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
            <CardDescription>输入两个地理坐标点计算它们之间的距离</CardDescription>
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

          { mode === 'separate' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>第一个点</Label>
                <Input
                  placeholder="经度"
                  value={ point1.lng }
                  onChange={ e => setPoint1(p => ({ ...p, lng: e.target.value })) }
                />
                <Input
                  placeholder="纬度"
                  value={ point1.lat }
                  onChange={ e => setPoint1(p => ({ ...p, lat: e.target.value })) }
                />
              </div>

              <div className="space-y-2">
                <Label>第二个点</Label>
                <Input
                  placeholder="经度"
                  value={ point2.lng }
                  onChange={ e => setPoint2(p => ({ ...p, lng: e.target.value })) }
                />
                <Input
                  placeholder="纬度"
                  value={ point2.lat }
                  onChange={ e => setPoint2(p => ({ ...p, lat: e.target.value })) }
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>第一个点（经度,纬度）</Label>
                <Input
                  placeholder="例如: 116.3975,39.9087"
                  value={ combined1 }
                  onChange={ e => setCombined1(e.target.value) }
                />
              </div>

              <div className="space-y-2">
                <Label>第二个点（经度,纬度）</Label>
                <Input
                  placeholder="例如：121.4737,31.2304"
                  value={ combined2 }
                  onChange={ e => setCombined2(e.target.value) }
                />
              </div>
            </div>
          ) }

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
        </CardContent>
      </Card>
    </div>
  )
}
