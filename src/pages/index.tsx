import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/")({
	component: Index,
});

function Index() {
	const navigate = useNavigate();
	const observerRef = useRef<IntersectionObserver | null>(null);

	// 原有的滚动动画和状态恢复逻辑
	useEffect(() => {
		try {
			if (typeof window !== "undefined") {
				if (window.history && "scrollRestoration" in window.history) {
					window.history.scrollRestoration = "manual";
				}
				const raw = sessionStorage.getItem("HOME_STATE");
				if (raw) {
					const parsed = JSON.parse(raw);
					const y = Number(parsed?.scrollY || 0);
					if (!Number.isNaN(y) && y > 0) {
						requestAnimationFrame(() => {
							window.scrollTo({ top: y, behavior: "auto" });
						});
					}
				}

				// 滚动动画初始化
				observerRef.current = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							if (entry.isIntersecting) {
								entry.target.classList.add("animate-fade-in");
								observerRef.current?.unobserve(entry.target);
							}
						});
					},
					{
						threshold: 0.1,
						rootMargin: "0px 0px -50px 0px",
					},
				);

				// 观察所有需要动画的元素
				const animatedElements =
					document.querySelectorAll(".animate-on-scroll");
				animatedElements.forEach((el) => {
					observerRef.current?.observe(el);
				});

				return () => {
					observerRef.current?.disconnect();
				};
			}
		} catch {
			// 静默处理错误
		}
	}, []);

	const handleEnterTool = (path: string) => {
		try {
			const state = {
				scrollY: typeof window !== "undefined" ? window.scrollY : 0,
			};
			sessionStorage.setItem("HOME_STATE", JSON.stringify(state));
		} catch {
			// 静默处理错误
		}
		navigate({ to: path });
	};
	const categories = [
		{
			title: "文件处理工具",
			items: [
				{
					title: "PDF合并",
					description: "PDF合并",
					path: "/pdfMerger",
				},
				{
					title: "PDF转Word",
					description: "PDF转Word",
					path: "/pdfToWord",
				},
				{
					title: "PDF拆分",
					description: "PDF拆分",
					path: "/pdfSplitter",
				},
				{
					title: "图片转PDF",
					description: "合并多张图片为PDF文件",
					path: "/imageToPdf",
				},
				{
					title: "图片压缩工具",
					description: "图片压缩工具",
					path: "/imageCompressor",
				},
				{
					title: "视频转GIF",
					description: "转换视频片段为GIF动图",
					path: "/videoToGif",
				},
				{
					title: "图片转base64",
					description: "图片转base64",
					path: "/base64Converter",
				},
				{
					title: "上传文件",
					description: "上传文件",
					path: "/fileUploader",
				},
				{
					title: "图片信息查看器",
					description: "支持查看图片信息",
					path: "/imageMetadata",
				},
				{
					title: "图片水印工具",
					description: "支持给图片添加文字水印，可批量处理",
					path: "/watermark",
				},
				{
					title: "图库",
					description: "图片浏览与管理工具，支持缩放、旋转等操作",
					path: "/imageGallery",
				},
				{
					title: "音频MD5计算",
					description: "计算音频文件的MD5哈希值",
					path: "/audioMd5",
				},
			],
		},
		{
			title: "编码转换工具",
			items: [
				{
					title: "jsonToTs",
					description: "将JSON转换为TypeScript interface 类型定义",
					path: "/jsonToTs",
				},
				{
					title: "hex跟字符串互转",
					description: "支持hex跟字符串互转",
					path: "/hexStringConverter",
				},
				{
					title: "颜色转换器",
					description: "16进制颜色跟RGB颜色互转",
					path: "/colorConverter",
				},
				{
					title: "时间戳转换",
					description: "支持时间戳转换",
					path: "/timestampConverter",
				},
				{
					title: "YAML/JSON转换",
					description: "支持YAML和JSON格式互转",
					path: "/yamlJsonConverter",
				},
				{
					title: "CSV/JSON转换",
					description: "支持CSV和JSON格式互转，支持自定义分隔符",
					path: "/csvJsonConverter",
				},
			],
		},
		{
			title: "网络工具",
			items: [
				{
					title: "websocket客户端",
					description: "支持websocket客户端",
					path: "/websocketClient",
				},
				{
					title: "MQTT客户端",
					description: "支持MQTT消息发布订阅",
					path: "/mqttClient",
				},
				{
					title: "http状态码",
					description: "http状态码",
					path: "/httpStatus",
				},
				{
					title: "http请求头",
					description: "http请求头",
					path: "/httpHeaders",
				},
				{
					title: "端口工具",
					description: "端口工具",
					path: "/portTable",
				},
			],
		},
		{
			title: "坐标/地理工具",
			items: [
				{
					title: "地图坐标工具",
					description: "支持输入坐标、点击地图获取坐标、批量导入",
					path: "/leafletMap",
				},
				{
					title: "经纬度之间距离计算",
					description: "计算两个经纬度之间的距离",
					path: "/calculateDistance",
				},
				{
					title: "WGS84坐标系与GCJ02坐标系互转",
					description: "WGS84坐标系与GCJ02坐标系互转",
					path: "/coordinate",
				},
			],
		},
		{
			title: "开发辅助工具",
			items: [
				{
					title: "JSON格式化",
					description: "JSON格式化",
					path: "/jsonFormatter",
				},
				{
					title: "CSS格式化",
					description: "CSS代码格式化工具",
					path: "/cssFormatter",
				},
				{
					title: "SCSS转CSS",
					description: "SCSS代码转换为CSS代码",
					path: "/scssConverter",
				},
				{
					title: "ascii码对应表",
					description: "ascii码对应表",
					path: "/asciiTable",
				},
				{
					title: "二维码生成器",
					description: "支持生成二维码",
					path: "/qrGenerator",
				},
				{
					title: "JavaScript格式化",
					description: "JavaScript代码格式化工具",
					path: "/jsFormatter",
				},
				{
					title: "html转js",
					description: "html转js",
					path: "/htmlJsConverter",
				},
				{
					title: "文本对比工具",
					description: "对比两段文本的差异，支持高亮显示",
					path: "/textDiff",
				},
				{
					title: "Hash计算器",
					description: "计算文本或文件的MD5/SHA1/SHA256/SHA512等Hash值",
					path: "/hashCalculator",
				},
				{
					title: "JWT解码器",
					description: "解码和解析JWT Token，查看Header、Payload和签名",
					path: "/jwtDecoder",
				},
				{
					title: "JWT生成器",
					description: "创建和签名JWT Token，支持HMAC算法",
					path: "/jwtGenerator",
				},
				{
					title: "Markdown转微信公众号",
					description: "Markdown格式转换为微信公众号格式",
					path: "/markdownToWechat",
				},
			],
		},

		{
			title: "其他工具",
			items: [
				{
					title: "signature",
					description: "签名生成器",
					path: "/signature",
				},
				{
					title: "浏览器标签",
					description: "支持导入浏览器标签数据",
					path: "/browserTabs",
				},
			],
		},
	];

	return (
		<main className="px-6 md:px-10 lg:px-20 py-8 min-h-screen relative overflow-hidden">
			<div className="relative ">
				{/* Hero Section */}
				<div className="max-w-7xl mx-auto mb-12 text-center animate-on-scroll opacity-0">
					<div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-full border border-blue-200/50 dark:border-blue-700/50">
						<span className="text-sm font-medium text-blue-600 dark:text-blue-400">
							🛠️ 全能工具箱
						</span>
					</div>
					<h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-600 dark:from-gray-100 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4 tracking-tight">
						Sunrise 工具库
					</h1>
					<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
						一站式解决您的日常开发需求，高效、优雅、强大
					</p>

					{/* Quick Stats */}
					<div className="mt-8 flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
							{categories.reduce((acc, cat) => acc + cat.items.length, 0)}+ 工具
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
							持续更新
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
							免费使用
						</div>
					</div>
				</div>

				{/* Categories Grid */}
				<div className="max-w-7xl mx-auto space-y-12">
					{categories.map((category, index) => (
						<div
							key={category.title}
							className="animate-on-scroll opacity-0"
							style={{ animationDelay: `${index * 100}ms` }}
						>
							{/* Category Header */}
							<div className="flex items-center justify-between mb-6">
								<div className="flex items-center gap-3">
									<div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
									<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
										{category.title}
									</h2>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 rounded-full border border-blue-200/50 dark:border-blue-700/50">
										{category.items.length} 个工具
									</span>
								</div>
							</div>

							{/* Tools Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
								{category.items.map((item) => (
									<Card
										key={item.path}
										className="group cursor-pointer bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 hover:border-blue-300/50 dark:hover:border-blue-500/50 hover:shadow-xl dark:hover:shadow-blue-500/20 transition-all duration-300 rounded-xl overflow-hidden p-0"
										onClick={() => handleEnterTool(item.path)}
									>
										<div className="relative overflow-hidden">
											{/* Hover gradient overlay */}
											<div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 dark:group-hover:from-blue-400/20 dark:group-hover:to-purple-400/20 transition-all duration-300"></div>

											<CardHeader className="p-5 pb-4 relative z-10">
												<div className="flex items-start justify-between mb-2">
													<CardTitle className="text-base font-bold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
														{item.title}
													</CardTitle>
													<span className="text-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
														→
													</span>
												</div>
												<CardDescription className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 line-clamp-2 leading-relaxed min-h-[2.5em]">
													{item.description}
												</CardDescription>
											</CardHeader>

											{/* Decorative bottom bar */}
											<div className="h-0.5 bg-gradient-to-r from-transparent via-blue-200/50 to-transparent dark:via-blue-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
										</div>
									</Card>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Footer Note */}
				<div
					className="max-w-7xl mx-auto mt-16 text-center text-sm text-gray-500 dark:text-gray-400 animate-on-scroll opacity-0"
					style={{ animationDelay: `${categories.length * 100}ms` }}
				>
					<p>✨ 更多实用工具持续开发中...</p>
				</div>
			</div>
		</main>
	);
}
