import { useEffect, useRef, useCallback } from "react";

interface UseDynamicGridOptions {
  gridSize?: number;
  speed?: number;
  color?: string;
  animate?: boolean;
}

interface UseDynamicGridReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  start: () => void;
  stop: () => void;
  updateOptions: (options: UseDynamicGridOptions) => void;
}

export function useDynamicGrid(
  options: UseDynamicGridOptions = {}
): UseDynamicGridReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const stateRef = useRef({
    offset: { x: 0, y: 0 },
    gridSize: options.gridSize || 40,
    speed: options.speed || 0.5,
    isDark: false,
    color: options.color || "",
    animate: options.animate !== false,
  });

  // 更新配置
  const updateOptions = useCallback((newOptions: UseDynamicGridOptions) => {
    if (newOptions.gridSize !== undefined) {
      stateRef.current.gridSize = newOptions.gridSize;
    }
    if (newOptions.speed !== undefined) {
      stateRef.current.speed = newOptions.speed;
    }
    if (newOptions.color !== undefined) {
      stateRef.current.color = newOptions.color;
    }
    if (newOptions.animate !== undefined) {
      stateRef.current.animate = newOptions.animate;
    }
  }, []);

  // 绘制网格
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    const width = canvas.width;
    const height = canvas.height;

    // 检测主题
    state.isDark = document.documentElement.classList.contains("dark");

    // 确定颜色
    let finalColor = state.color;
    if (!finalColor) {
      finalColor = state.isDark
        ? "rgba(55, 65, 81, 0.3)"
        : "rgba(229, 231, 235, 0.3)";
    }

    // 清空画布
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = finalColor;
    ctx.lineWidth = 1;

    // 计算网格起始位置
    const gridStartX =
      Math.floor(state.offset.x / state.gridSize) * state.gridSize;
    const gridStartY =
      Math.floor(state.offset.y / state.gridSize) * state.gridSize;

    // 绘制滚动网格
    for (let x = gridStartX; x < width + state.gridSize; x += state.gridSize) {
      for (
        let y = gridStartY;
        y < height + state.gridSize;
        y += state.gridSize
      ) {
        const drawX = x - (state.offset.x % state.gridSize);
        const drawY = y - (state.offset.y % state.gridSize);

        ctx.beginPath();
        ctx.rect(drawX, drawY, state.gridSize, state.gridSize);
        ctx.stroke();
      }
    }

    // 添加渐变遮罩
    const gradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      0,
      width / 2,
      height / 2,
      Math.sqrt(width ** 2 + height ** 2) / 2
    );

    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(
      1,
      state.isDark ? "rgba(0, 0, 0, 0.3)" : "rgba(255, 255, 255, 0.7)"
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  // 动画循环
  const animate = useCallback(() => {
    const state = stateRef.current;

    if (state.animate) {
      // 更新偏移量实现滚动
      state.offset.x =
        (state.offset.x - state.speed + state.gridSize) % state.gridSize;
      state.offset.y =
        (state.offset.y - state.speed + state.gridSize) % state.gridSize;
    }

    draw();
    animationIdRef.current = requestAnimationFrame(animate);
  }, [draw]);

  // 启动动画
  const start = useCallback(() => {
    if (!animationIdRef.current) {
      stateRef.current.animate = true;
      animationIdRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  // 停止动画
  const stop = useCallback(() => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }
    stateRef.current.animate = false;
  }, []);

  // 初始化和清理
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 设置canvas尺寸
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      } else {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      draw(); // 调整大小后立即重绘
    };

    // 防抖的窗口大小处理
    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 100);
    };

    // 监听主题变化
    const themeObserver = new MutationObserver(() => {
      draw(); // 主题变化时重绘
    });

    // 初始化
    resizeCanvas();
    if (options.animate !== false) {
      start();
    }

    window.addEventListener("resize", handleResize);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      stop();
      window.removeEventListener("resize", handleResize);
      themeObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
    };
  }, [draw, start, stop, options.animate]);

  return {
    canvasRef,
    start,
    stop,
    updateOptions,
  };
}
