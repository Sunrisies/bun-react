import { BackButton } from "@/components/BackButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { ArrowLeft, Info, RotateCcw, Trophy } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

export const Route = createFileRoute("/gomoku")({
	component: Gomoku,
})

const BOARD_SIZE = 15
const CELL_SIZE = 38
const PADDING = 30

type Cell = 0 | 1 | 2
type Player = 1 | 2

function Gomoku() {
	const navigate = useNavigate()
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const [board, setBoard] = useState<Cell[][]>(() =>
		Array(BOARD_SIZE)
			.fill(null)
			.map(() => Array(BOARD_SIZE).fill(0)),
	)
	const [currentPlayer, setCurrentPlayer] = useState<Player>(1)
	const [winner, setWinner] = useState<Player | null>(null)
	const [winLine, setWinLine] = useState<[number, number][]>([])
	const [moveCount, setMoveCount] = useState(0)

	const canvasSize = PADDING * 2 + CELL_SIZE * (BOARD_SIZE - 1)

	const drawBoard = useCallback(() => {
		const canvas = canvasRef.current
		if (!canvas) return
		const ctx = canvas.getContext("2d")
		if (!ctx) return

		// 背景
		ctx.fillStyle = "#DEB887"
		ctx.fillRect(0, 0, canvasSize, canvasSize)

		// 网格线
		ctx.strokeStyle = "#8B4513"
		ctx.lineWidth = 1
		for (let i = 0; i < BOARD_SIZE; i++) {
			const pos = PADDING + i * CELL_SIZE
			ctx.beginPath()
			ctx.moveTo(PADDING, pos)
			ctx.lineTo(PADDING + (BOARD_SIZE - 1) * CELL_SIZE, pos)
			ctx.stroke()
			ctx.beginPath()
			ctx.moveTo(pos, PADDING)
			ctx.lineTo(pos, PADDING + (BOARD_SIZE - 1) * CELL_SIZE)
			ctx.stroke()
		}

		// 星位
		const stars = [3, 7, 11]
		ctx.fillStyle = "#8B4513"
		for (const x of stars) {
			for (const y of stars) {
				ctx.beginPath()
				ctx.arc(
					PADDING + x * CELL_SIZE,
					PADDING + y * CELL_SIZE,
					4,
					0,
					2 * Math.PI,
				)
				ctx.fill()
			}
		}

		// 棋子
		for (let y = 0; y < BOARD_SIZE; y++) {
			for (let x = 0; x < BOARD_SIZE; x++) {
				if (board[y][x] !== 0) {
					const cx = PADDING + x * CELL_SIZE
					const cy = PADDING + y * CELL_SIZE
					const r = CELL_SIZE / 2 - 2

					// 棋子阴影
					ctx.beginPath()
					ctx.arc(cx + 2, cy + 2, r, 0, 2 * Math.PI)
					ctx.fillStyle = "rgba(0,0,0,0.3)"
					ctx.fill()

					// 棋子
					ctx.beginPath()
					ctx.arc(cx, cy, r, 0, 2 * Math.PI)
					if (board[y][x] === 1) {
						const gradient = ctx.createRadialGradient(
							cx - 3,
							cy - 3,
							0,
							cx,
							cy,
							r,
						)
						gradient.addColorStop(0, "#555")
						gradient.addColorStop(1, "#000")
						ctx.fillStyle = gradient
					} else {
						const gradient = ctx.createRadialGradient(
							cx - 3,
							cy - 3,
							0,
							cx,
							cy,
							r,
						)
						gradient.addColorStop(0, "#fff")
						gradient.addColorStop(1, "#ccc")
						ctx.fillStyle = gradient
					}
					ctx.fill()
				}
			}
		}

		// 胜利线
		if (winLine.length > 0) {
			ctx.strokeStyle = "#ff0000"
			ctx.lineWidth = 3
			ctx.beginPath()
			ctx.moveTo(
				PADDING + winLine[0][0] * CELL_SIZE,
				PADDING + winLine[0][1] * CELL_SIZE,
			)
			ctx.lineTo(
				PADDING + winLine[winLine.length - 1][0] * CELL_SIZE,
				PADDING + winLine[winLine.length - 1][1] * CELL_SIZE,
			)
			ctx.stroke()
		}
	}, [board, canvasSize, winLine])

	useEffect(() => {
		drawBoard()
	}, [drawBoard])

	const checkWin = useCallback(
		(x: number, y: number, player: Player): [number, number][] | null => {
			const directions = [
				[1, 0],
				[0, 1],
				[1, 1],
				[1, -1],
			]

			for (const [dx, dy] of directions) {
				const line: [number, number][] = [[x, y]]

				// 正向
				for (let i = 1; i < 5; i++) {
					const nx = x + dx * i
					const ny = y + dy * i
					if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break
					if (board[ny][nx] !== player) break
					line.push([nx, ny])
				}

				// 反向
				for (let i = 1; i < 5; i++) {
					const nx = x - dx * i
					const ny = y - dy * i
					if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break
					if (board[ny][nx] !== player) break
					line.unshift([nx, ny])
				}

				if (line.length >= 5) return line
			}

			return null
		},
		[board],
	)

	const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
		if (winner) return

		const canvas = canvasRef.current
		if (!canvas) return

		const rect = canvas.getBoundingClientRect()
		const x = Math.round((e.clientX - rect.left - PADDING) / CELL_SIZE)
		const y = Math.round((e.clientY - rect.top - PADDING) / CELL_SIZE)

		if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return
		if (board[y][x] !== 0) return

		const newBoard = board.map((row) => [...row])
		newBoard[y][x] = currentPlayer
		setBoard(newBoard)
		setMoveCount((c) => c + 1)

		const win = checkWin(x, y, currentPlayer)
		if (win) {
			setWinner(currentPlayer)
			setWinLine(win)
			toast.success(currentPlayer === 1 ? "黑棋获胜！" : "白棋获胜！")
		} else if (moveCount + 1 === BOARD_SIZE * BOARD_SIZE) {
			toast.info("平局！")
		} else {
			setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
		}
	}

	const reset = () => {
		setBoard(
			Array(BOARD_SIZE)
				.fill(null)
				.map(() => Array(BOARD_SIZE).fill(0)),
		)
		setCurrentPlayer(1)
		setWinner(null)
		setWinLine([])
		setMoveCount(0)
	}

	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card className="w-full h-full mx-auto shadow-lg flex flex-col">
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							五子棋
							<div className="relative inline-block group">
								<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
									<Info className="h-4 w-4" />
								</div>
								<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
									<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200"></div>
									<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
										黑白双方轮流下棋，先连成五子者获胜。
									</div>
								</div>
							</div>
						</CardTitle>
						<div className="flex items-center gap-4">
							<div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
								<div className="flex items-center gap-2">
									<div
										className={ `w-5 h-5 rounded-full ${currentPlayer === 1 ? "bg-black ring-2 ring-blue-500" : "bg-black"}` }
									/>
									<span className="text-sm">黑棋</span>
								</div>
								<span className="text-gray-400">vs</span>
								<div className="flex items-center gap-2">
									<div
										className={ `w-5 h-5 rounded-full border-2 ${currentPlayer === 2 ? "bg-white ring-2 ring-blue-500" : "bg-white border-gray-400"}` }
									/>
									<span className="text-sm">白棋</span>
								</div>
							</div>
							<div className="text-sm text-gray-500">
								步数:{ " " }
								<span className="font-bold text-gray-700">{ moveCount }</span>
							</div>
							{ winner && (
								<div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-lg">
									<Trophy className="h-4 w-4 text-yellow-600" />
									<span className="text-sm font-medium text-yellow-700">
										{ winner === 1 ? "黑棋" : "白棋" }获胜！
									</span>
								</div>
							) }
							<Button onClick={ reset } variant="outline" size="sm">
								<RotateCcw className="h-4 w-4 mr-1" />
								重新开始
							</Button>
							<BackButton />
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex-1 min-h-0 p-6 overflow-hidden flex items-center justify-center">
					<canvas
						ref={ canvasRef }
						width={ canvasSize }
						height={ canvasSize }
						onClick={ handleClick }
						className="cursor-pointer shadow-xl rounded-lg"
					/>
				</CardContent>
			</Card>
		</div>
	)
}
