import { BackButton } from "@/components/BackButton";
import { InfoTooltip } from "@/components/InfoTooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCopy } from "@/hooks";
import { createFileRoute } from "@tanstack/react-router";
import { Gift, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/wheelSpinner")({
	component: WheelSpinner,
});

interface Prize {
	id: number;
	name: string;
	color: string;
}

let prizeId = 0;

const colors = [
	"#FF6B6B",
	"#4ECDC4",
	"#45B7D1",
	"#96CEB4",
	"#FFEAA7",
	"#DDA0DD",
	"#98D8C8",
	"#F7DC6F",
	"#BB8FCE",
	"#85C1E9",
	"#F8B500",
	"#FF6F61",
];

const defaultPrizes: Omit<Prize, "id">[] = [
	{ name: "一等奖", color: "#FF6B6B" },
	{ name: "二等奖", color: "#4ECDC4" },
	{ name: "三等奖", color: "#45B7D1" },
	{ name: "谢谢参与", color: "#96CEB4" },
	{ name: "再来一次", color: "#FFEAA7" },
	{ name: "幸运奖", color: "#DDA0DD" },
];

function WheelSpinner() {
	const { copy } = useCopy();
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number>(0);

	const [prizes, setPrizes] = useState<Prize[]>(() =>
		defaultPrizes.map((p) => ({ ...p, id: prizeId++ })),
	);
	const [spinning, setSpinning] = useState(false);
	const [result, setResult] = useState<string | null>(null);
	const [newPrize, setNewPrize] = useState("");
	const [rotation, setRotation] = useState(0);

	const drawWheel = useCallback(
		(rot: number) => {
			const canvas = canvasRef.current;
			if (!canvas) return;
			const ctx = canvas.getContext("2d");
			if (!ctx) return;

			const size = canvas.width;
			const cx = size / 2;
			const cy = size / 2;
			const r = size / 2 - 30;

			ctx.clearRect(0, 0, size, size);
			const sliceAngle = (2 * Math.PI) / prizes.length;

			ctx.save();
			ctx.translate(cx, cy);
			ctx.rotate(rot - Math.PI / 2);

			prizes.forEach((prize, i) => {
				const start = i * sliceAngle;
				const end = start + sliceAngle;
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.arc(0, 0, r, start, end);
				ctx.closePath();
				ctx.fillStyle = prize.color;
				ctx.fill();
				ctx.strokeStyle = "#fff";
				ctx.lineWidth = 3;
				ctx.stroke();

				ctx.save();
				ctx.rotate(start + sliceAngle / 2);
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "#fff";
				ctx.font = "bold 16px sans-serif";
				ctx.shadowColor = "rgba(0,0,0,0.4)";
				ctx.shadowBlur = 3;
				ctx.fillText(prize.name, r * 0.65, 0);
				ctx.restore();
			});

			ctx.restore();

			ctx.beginPath();
			ctx.arc(cx, cy, r + 5, 0, 2 * Math.PI);
			ctx.strokeStyle = "#333";
			ctx.lineWidth = 8;
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(cx, cy, 35, 0, 2 * Math.PI);
			ctx.fillStyle = "#fff";
			ctx.fill();
			ctx.strokeStyle = "#333";
			ctx.lineWidth = 4;
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(cx, cy - r - 20);
			ctx.lineTo(cx - 18, cy - r - 45);
			ctx.lineTo(cx + 18, cy - r - 45);
			ctx.closePath();
			ctx.fillStyle = "#e74c3c";
			ctx.fill();
			ctx.strokeStyle = "#c0392b";
			ctx.lineWidth = 2;
			ctx.stroke();
		},
		[prizes],
	);

	useEffect(() => {
		drawWheel(0);
	}, [drawWheel]);

	const spin = useCallback(() => {
		if (spinning || prizes.length < 2) return;
		setSpinning(true);
		setResult(null);

		const totalSpins = 5 + Math.random() * 3;
		const targetRotation = rotation + totalSpins * 2 * Math.PI;
		const duration = 4000;
		const startTime = performance.now();
		const startRotation = rotation;

		const animate = (now: number) => {
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 4);
			const currentRot =
				startRotation + (targetRotation - startRotation) * eased;

			setRotation(currentRot);
			drawWheel(currentRot);

			if (progress < 1) {
				animRef.current = requestAnimationFrame(animate);
			} else {
				const sliceAngle = (2 * Math.PI) / prizes.length;
				const normalized =
					((currentRot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
				const index =
					Math.floor(
						((2 * Math.PI - normalized) % (2 * Math.PI)) / sliceAngle,
					) % prizes.length;
				setResult(prizes[index].name);
				setSpinning(false);
				toast.success(`恭喜获得: ${prizes[index].name}`);
			}
		};

		animRef.current = requestAnimationFrame(animate);
	}, [spinning, rotation, prizes, drawWheel]);

	const addPrize = () => {
		if (!newPrize.trim()) return;
		if (prizes.length >= 12) {
			toast.error("最多 12 个奖项");
			return;
		}
		setPrizes([
			...prizes,
			{
				id: prizeId++,
				name: newPrize.trim(),
				color: colors[prizes.length % colors.length],
			},
		]);
		setNewPrize("");
	};

	const removePrize = (id: number) => {
		if (prizes.length <= 2) {
			toast.error("至少保留 2 个");
			return;
		}
		setPrizes(prizes.filter((p) => p.id !== id));
	};

	const reset = () => {
		cancelAnimationFrame(animRef.current);
		setPrizes(defaultPrizes.map((p) => ({ ...p, id: prizeId++ })));
		setRotation(0);
		setResult(null);
		setSpinning(false);
		drawWheel(0);
	};

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							转盘抽奖
							<InfoTooltip content="自定义奖项，点击开始抽奖。" />
						</CardTitle>
						<div className="flex gap-2">
							<Button onClick={reset} variant="outline" size="sm">
								重置
							</Button>
							<BackButton />
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex-1 min-h-0 p-4 overflow-hidden">
					<div className="h-full grid grid-cols-[280px_1fr] gap-6">
						{/* 左侧 */}
						<div className="flex flex-col gap-4">
							<div className="p-4 bg-gray-50 rounded-lg flex-1 flex flex-col">
								<h3 className="font-medium text-sm mb-3">
									奖项 ({prizes.length}/12)
								</h3>
								<div className="flex gap-2 mb-3">
									<Input
										value={newPrize}
										onChange={(e) => setNewPrize(e.target.value)}
										placeholder="输入奖项名称"
										className="h-8 text-sm"
										onKeyDown={(e) => e.key === "Enter" && addPrize()}
									/>
									<Button
										size="sm"
										onClick={addPrize}
										disabled={!newPrize.trim()}
									>
										<Plus className="h-4 w-4" />
									</Button>
								</div>
								<div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
									{prizes.map((prize) => (
										<div
											key={prize.id}
											className="flex items-center gap-2 p-2 bg-white rounded border group"
										>
											<div
												className="w-4 h-4 rounded flex-shrink-0"
												style={{ backgroundColor: prize.color }}
											/>
											<span className="flex-1 text-sm truncate">
												{prize.name}
											</span>
											<button
												onClick={() => removePrize(prize.id)}
												className="h-5 w-5 flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
											>
												<Trash2 className="h-3 w-3" />
											</button>
										</div>
									))}
								</div>
							</div>

							{result && (
								<div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border border-yellow-300">
									<div className="flex items-center gap-2 mb-2">
										<Gift className="h-5 w-5 text-yellow-600" />
										<span className="font-medium text-yellow-700">
											中奖结果
										</span>
									</div>
									<div className="text-3xl font-bold text-center text-yellow-800 mb-3">
										{result}
									</div>
									<Button
										size="sm"
										variant="outline"
										className="w-full"
										onClick={() => copy(result)}
									>
										复制
									</Button>
								</div>
							)}
						</div>

						{/* 右侧：转盘 */}
						<div className="flex items-center justify-center">
							<div className="relative">
								<canvas ref={canvasRef} width={400} height={400} />
								<button
									onClick={spin}
									disabled={spinning || prizes.length < 2}
									className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white border-4 border-gray-800 shadow-lg hover:bg-gray-100 disabled:opacity-50 flex items-center justify-center font-bold text-lg"
								>
									{spinning ? "..." : "GO"}
								</button>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
