import { createFileRoute } from "@tanstack/react-router"
import { useState, useRef, useEffect, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, MapPin, Trash2, Plus, Target } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import 'leaflet/dist/leaflet.css'
import { addMap } from "@/utils/map"
// import "leaflet.chinatmsproviders"
export const Route = createFileRoute("/leafletMap")({
    component: LeafletMapComponent,
})

interface Coordinate {
    id: string
    lat: number
    lng: number
    name?: string
}
const TDT_KEY = 'b523cf004dc0b0eb1d6ec8bf9d381ae5'
function LeafletMapComponent() {
    const navigate = useNavigate()
    const [coordinates, setCoordinates] = useState<Coordinate[]>([])
    const [latInput, setLatInput] = useState("")
    const [lngInput, setLngInput] = useState("")
    const [nameInput, setNameInput] = useState("")
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

    const mapRef = useRef<any>(null)
    const markersRef = useRef<any[]>([])
    const mapContainerRef = useRef<HTMLDivElement>(null)

    // 动态加载Leaflet并初始化地图
    useEffect(() => {
        const initMap = async () => {
            // 防止重复初始化
            if (mapRef.current || status === "ready") {
                return
            }

            try {
                setStatus("loading")

                if (typeof window === 'undefined') {
                    return
                }

                // 动态加载Leaflet
                let L: any = window.L
                if (!L) {
                    const leaflet = await import('leaflet')
                    L = leaflet
                    window.L = L
                }

                // 等待容器准备好
                const waitForContainer = () => {
                    return new Promise((resolve) => {
                        if (mapContainerRef.current) {
                            resolve(true)
                        } else {
                            let attempts = 0
                            const check = setInterval(() => {
                                attempts++
                                if (mapContainerRef.current || attempts > 50) {
                                    clearInterval(check)
                                    resolve(!!mapContainerRef.current)
                                }
                            }, 50)
                        }
                    })
                }

                const containerReady = await waitForContainer()
                if (!containerReady || !mapContainerRef.current) {
                    throw new Error("地图容器未准备好")
                }

                // 检查容器是否已经被初始化
                if (mapContainerRef.current.classList.contains('leaflet-container')) {
                    console.warn("容器已被初始化，跳过")
                    setStatus("ready")
                    return
                }
                // 创建地图
                mapRef.current = L.map(mapContainerRef.current, {
                    center: [39.9042, 116.4074],
                    zoomControl: false,
                    zoom: 18,
                    maxZoom: 24,
                    minZoom: 5,
                    renderer: L.canvas({ tolerance: 16 }),
                    attributionControl: false
                })
                // addMap()
                // 添加天地图层
                // const imgm = L.tileLayer.chinaProvider('TianDiTu.Satellite.Map', {
                //     key: TDT_KEY,
                //     maxZoom: 24,
                //     maxNativeZoom: 18,
                //     minZoom: 5
                // }).addTo(mapRef.current)

                // const imga = L.tileLayer.chinaProvider('TianDiTu.Satellite.Annotion', {
                //     key: TDT_KEY,
                //     maxZoom: 24,
                //     maxNativeZoom: 18
                // }).addTo(mapRef.current)
                // 初始化中国地图提供商
                const LWithProviders = addMap(L)

                // 添加天地图卫星图层
                LWithProviders.tileLayer.chinaProvider('TianDiTu.Satellite.Map', {
                    key: TDT_KEY,
                    maxZoom: 24,
                    maxNativeZoom: 18,
                    minZoom: 5
                }).addTo(mapRef.current)

                // 添加天地图注记图层
                LWithProviders.tileLayer.chinaProvider('TianDiTu.Satellite.Annotion', {
                    key: TDT_KEY,
                    maxZoom: 24,
                    maxNativeZoom: 18
                }).addTo(mapRef.current)
                // // 添加地图图层
                // L.tileLayer(`//t{s}.tianditu.gov.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}&tk=${TDT_KEY}`, {
                //     attribution: '© OpenStreetMap contributors',
                //     maxZoom: 18
                // }).addTo(mapRef.current)

                // 点击地图事件
                mapRef.current.on('click', (e: { latlng: { lat: number; lng: number } }) => {
                    const { lat, lng } = e.latlng
                    setLatInput(lat.toFixed(6))
                    setLngInput(lng.toFixed(6))
                    toast.success(`已获取坐标: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
                })

                // 确保地图尺寸正确
                setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.invalidateSize()
                    }
                }, 200)

                setStatus("ready")
                toast.success("地图初始化成功")

            } catch (error) {
                console.error("地图初始化失败:", error)
                setStatus("error")
                toast.error("地图加载失败: " + (error as Error).message)
            }
        }

        initMap()

        // 清理函数
        return () => {
            if (mapRef.current) {
                try {
                    mapRef.current.remove()
                } catch (e) {
                    console.error("清理地图失败:", e)
                }
                mapRef.current = null
            }
        }
    }, [])

    // 更新地图标记
    useEffect(() => {
        if (!mapRef.current || status !== "ready" || !window.L) return

        try {
            // 清除现有标记
            markersRef.current.forEach(marker => {
                if (marker.remove) {
                    marker.remove()
                }
            })
            markersRef.current = []

            // 添加新标记
            coordinates.forEach(coord => {
                const marker = window.L.marker([coord.lat, coord.lng])
                    .addTo(mapRef.current)
                    .bindPopup(`
                        <div style="text-align: center; padding: 8px;">
                            <strong style="font-size: 14px;">${coord.name || '未命名'}</strong><br/>
                            <span style="font-size: 12px; color: #666;">
                                ${coord.lat.toFixed(6)}, ${coord.lng.toFixed(6)}
                            </span>
                        </div>
                    `)
                markersRef.current.push(marker)
            })

            // 如果有坐标，调整视图
            if (coordinates.length > 0 && markersRef.current.length > 0) {
                const group = window.L.featureGroup(markersRef.current)
                mapRef.current.fitBounds(group.getBounds().pad(0.1))
            }
        } catch (error) {
            console.error("更新标记失败:", error)
        }
    }, [coordinates, status])

    // 添加坐标
    const addCoordinate = () => {
        if (!latInput || !lngInput) {
            toast.error("请输入经纬度")
            return
        }

        const lat = parseFloat(latInput)
        const lng = parseFloat(lngInput)

        if (isNaN(lat) || isNaN(lng)) {
            toast.error("请输入有效的数字")
            return
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            toast.error("纬度范围:-90~90, 经度范围:-180~180")
            return
        }

        const newCoord: Coordinate = {
            id: Date.now().toString(),
            lat,
            lng,
            name: nameInput || `点-${coordinates.length + 1}`
        }

        setCoordinates([...coordinates, newCoord])
        setLatInput("")
        setLngInput("")
        setNameInput("")
        toast.success("坐标已添加")
    }

    // 删除坐标
    const removeCoordinate = (id: string) => {
        setCoordinates(coordinates.filter(c => c.id !== id))
        toast.success("坐标已删除")
    }

    // 清空所有
    const clearAll = () => {
        setCoordinates([])
        toast.success("已清空所有坐标")
    }

    // 从文本批量导入
    const importFromText = (text: string) => {
        try {
            const lines = text.split('\n').filter(line => line.trim())
            const newCoords: Coordinate[] = []

            for (const line of lines) {
                const parts = line.split(',').map(p => p.trim())
                if (parts.length >= 2) {
                    const lat = parseFloat(parts[0])
                    const lng = parseFloat(parts[1])
                    const name = parts[2] || `点-${newCoords.length + 1}`

                    if (!isNaN(lat) && !isNaN(lng)) {
                        newCoords.push({
                            id: Date.now().toString() + Math.random(),
                            lat,
                            lng,
                            name
                        })
                    }
                }
            }

            if (newCoords.length > 0) {
                setCoordinates([...coordinates, ...newCoords])
                toast.success(`成功导入 ${newCoords.length} 个坐标`)
            } else {
                toast.error("未找到有效坐标")
            }
        } catch {
            toast.error("导入失败，请检查格式")
        }
    }

    // 生成坐标文本
    const getCoordinatesText = () => {
        return coordinates.map(c => `${c.lat},${c.lng},${c.name}`).join('\n')
    }

    // 获取当前位置
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast.error("浏览器不支持定位")
            return
        }

        toast.loading("正在获取位置...", { id: "location" })
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLatInput(pos.coords.latitude.toFixed(6))
                setLngInput(pos.coords.longitude.toFixed(6))
                toast.success("已获取当前位置", { id: "location" })
            },
            (error) => {
                toast.error("无法获取位置: " + error.message, { id: "location" })
            }
        )
    }

    return (
        <div className="h-[calc(100vh-4.2rem)] flex flex-col md:p-6 overflow-hidden">
            <Card className="w-full h-full flex flex-col dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="border-b dark:border-gray-700">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                地图坐标工具
                            </CardTitle>
                            <Badge variant="outline" className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                { coordinates.length } 个点
                            </Badge>
                        </div>
                        <Button onClick={ () => navigate({ to: "/" }) } variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            返回首页
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-hidden">
                    <div className="flex h-full">
                        {/* 左侧控制面板 */ }
                        <div className="w-1/3 p-4 border-r dark:border-gray-700 overflow-y-auto">
                            <div className="space-y-4">
                                {/* 坐标输入区 */ }
                                <div className="space-y-3">
                                    <Label className="flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        添加坐标
                                    </Label>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs">纬度</Label>
                                            <Input
                                                value={ latInput }
                                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setLatInput(e.target.value) }
                                                placeholder="例如: 39.9042"
                                                className="text-xs"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">经度</Label>
                                            <Input
                                                value={ lngInput }
                                                onChange={ (e: ChangeEvent<HTMLInputElement>) => setLngInput(e.target.value) }
                                                placeholder="例如: 116.4074"
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>

                                    <Input
                                        value={ nameInput }
                                        onChange={ (e: ChangeEvent<HTMLInputElement>) => setNameInput(e.target.value) }
                                        placeholder="名称 (可选)"
                                        className="text-xs"
                                    />

                                    <div className="flex gap-2">
                                        <Button onClick={ addCoordinate } className="flex-1" size="sm">
                                            <Plus className="h-4 w-4 mr-1" />
                                            添加
                                        </Button>
                                        <Button onClick={ getCurrentLocation } variant="outline" size="sm">
                                            获取当前位置
                                        </Button>
                                    </div>
                                </div>

                                {/* 批量导入 */ }
                                <div className="space-y-2">
                                    <Label className="text-sm">批量导入 (每行: lat,lng,名称)</Label>
                                    <Textarea
                                        placeholder="39.9042,116.4074,北京"
                                        rows={ 4 }
                                        className="text-xs font-mono"
                                        onChange={ (e: ChangeEvent<HTMLTextAreaElement>) => {
                                            if (e.target.value) {
                                                importFromText(e.target.value)
                                                e.target.value = ""
                                            }
                                        } }
                                    />
                                </div>

                                {/* 坐标列表 */ }
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>坐标列表</Label>
                                        { coordinates.length > 0 && (
                                            <Button
                                                onClick={ clearAll }
                                                variant="destructive"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                清空
                                            </Button>
                                        ) }
                                    </div>

                                    <div className="space-y-1 max-h-60 overflow-y-auto">
                                        { coordinates.map(coord => (
                                            <div key={ coord.id } className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs">
                                                <div className="flex-1 overflow-hidden">
                                                    <div className="font-medium truncate">{ coord.name }</div>
                                                    <div className="text-gray-500 font-mono">
                                                        { coord.lat.toFixed(4) }, { coord.lng.toFixed(4) }
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={ () => removeCoordinate(coord.id) }
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 w-6 p-0 ml-2"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )) }
                                        { coordinates.length === 0 && (
                                            <div className="text-center text-gray-400 text-sm py-4">
                                                暂无坐标数据
                                            </div>
                                        ) }
                                    </div>
                                </div>

                                {/* 数据导出 */ }
                                { coordinates.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="text-sm">导出数据</Label>
                                        <Textarea
                                            value={ getCoordinatesText() }
                                            readOnly
                                            rows={ 3 }
                                            className="text-xs font-mono"
                                        />
                                        <Button
                                            onClick={ () => {
                                                navigator.clipboard.writeText(getCoordinatesText())
                                                toast.success("已复制到剪贴板")
                                            } }
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            复制数据
                                        </Button>
                                    </div>
                                ) }
                            </div>
                        </div>

                        {/* 右侧地图区域 */ }
                        <div className="w-2/3 relative bg-gray-100 dark:bg-gray-900">
                            {/* 地图容器 */ }
                            <div
                                ref={ mapContainerRef }
                                className="w-full h-full"
                                style={ { minHeight: '400px', height: '100%' } }
                            />

                            {/* 地图提示 */ }
                            <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded shadow text-xs z-[1000]">
                                <div>🖱️ 点击地图获取坐标</div>
                                <div>📍 { coordinates.length } 个标记点</div>
                            </div>

                            {/* 状态提示 */ }
                            { status === "loading" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
                                        <div className="text-sm font-medium">正在加载地图...</div>
                                    </div>
                                </div>
                            ) }

                            { status === "error" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-gray-900/90">
                                    <div className="text-center p-6">
                                        <div className="text-red-500 text-4xl mb-2">⚠️</div>
                                        <div className="text-sm font-medium mb-2">地图加载失败</div>
                                        <Button onClick={ () => window.location.reload() } size="sm">
                                            重试
                                        </Button>
                                    </div>
                                </div>
                            ) }
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

// 扩展 window 接口以支持 Leaflet
declare global {
    interface Window {
        L: any
    }
}
