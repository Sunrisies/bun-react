import { useEffect, useRef, useCallback, useState } from "react";

type Direction = "right" | "left" | "up" | "down" | "diagonal";

interface UseDynamicGridOptions {
  gridSize?: number;
  speed?: number;
  animate?: boolean;
  borderColor?: string;
  directionChangeInterval?: number;
}

interface UseDynamicGridReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  start: () => void;
  stop: () => void;
  updateOptions: (options: UseDynamicGridOptions) => void;
  getCurrentDirection: () => Direction;
}

export function useDynamicGrid(
  options: UseDynamicGridOptions = {}
): UseDynamicGridReturn {
  const {
    gridSize = 30,
    speed = 2,
    borderColor = "#e2e8f0",
    directionChangeInterval = 3000,
  } = options;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const directionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentDirection, setCurrentDirection] = useState<Direction>("right");

  // 使用ref来存储状态，避免闭包问题
  const stateRef = useRef({
    isRunning: false,
    offset: { x: 0, y: 0 },
    gridSize: { cols: 0, rows: 0 },
    containerWidth: 0,
    containerHeight: 0,
    config: {
      size: gridSize,
      speed: speed,
      direction: "right" as Direction,
      directions: ["right", "left", "up", "down", "diagonal"] as Direction[],
      borderColor: borderColor,
      directionChangeInterval: directionChangeInterval,
    },
  });

  // 调整画布大小
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const state = stateRef.current;
    state.containerWidth = canvas.width;
    state.containerHeight = canvas.height;
    state.gridSize.cols = Math.ceil(canvas.width / state.config.size) + 1;
    state.gridSize.rows = Math.ceil(canvas.height / state.config.size) + 1;
  }, []);

  // 更新偏移量
  const updateOffset = useCallback(() => {
    const state = stateRef.current;
    const speed = Math.max(state.config.speed, 0.1);

    switch (state.config.direction) {
      case "right":
        state.offset.x =
          (state.offset.x - speed + state.config.size) % state.config.size;
        break;
      case "left":
        state.offset.x =
          (state.offset.x + speed + state.config.size) % state.config.size;
        break;
      case "up":
        state.offset.y =
          (state.offset.y + speed + state.config.size) % state.config.size;
        break;
      case "down":
        state.offset.y =
          (state.offset.y - speed + state.config.size) % state.config.size;
        break;
      case "diagonal":
        state.offset.x =
          (state.offset.x - speed + state.config.size) % state.config.size;
        state.offset.y =
          (state.offset.y - speed + state.config.size) % state.config.size;
        break;
    }
  }, []);

  // 绘制函数
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 计算网格起始位置
    const gridStartX =
      Math.floor(state.offset.x / state.config.size) * state.config.size;
    const gridStartY =
      Math.floor(state.offset.y / state.config.size) * state.config.size;

    // 绘制网格
    for (
      let x = gridStartX;
      x < canvas.width + state.config.size;
      x += state.config.size
    ) {
      for (
        let y = gridStartY;
        y < canvas.height + state.config.size;
        y += state.config.size
      ) {
        const drawX = x - (state.offset.x % state.config.size);
        const drawY = y - (state.offset.y % state.config.size);

        // 绘制边框
        ctx.strokeStyle = state.config.borderColor;
        ctx.strokeRect(drawX, drawY, state.config.size, state.config.size);
      }
    }

    // 添加渐变遮罩
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      Math.sqrt(canvas.width ** 2 + canvas.height ** 2) / 2
    );
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      // 暗色模式使用黑色渐变
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)");
    } else {
      // 亮色模式使用白色渐变
      gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0.5)");
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // 动画循环
  const animationLoop = useCallback(() => {
    const state = stateRef.current;
    if (!state.isRunning) return;

    updateOffset();
    draw();
    animationRef.current = requestAnimationFrame(animationLoop);
  }, [updateOffset, draw]);

  // 随机改变方向
  const startDirectionRandomizer = useCallback(() => {
    const state = stateRef.current;
    if (directionTimerRef.current) {
      clearInterval(directionTimerRef.current);
    }

    if (state.config.directionChangeInterval > 0) {
      directionTimerRef.current = setInterval(() => {
        const directions = state.config.directions || [
          "right",
          "left",
          "up",
          "down",
          "diagonal",
        ];
        const newDirection =
          directions[Math.floor(Math.random() * directions.length)];
        state.config.direction = newDirection;
        setCurrentDirection(newDirection);
      }, state.config.directionChangeInterval);
    }
  }, []);

  // 启动动画
  const start = useCallback(() => {
    const state = stateRef.current;
    if (state.isRunning) return;
    state.isRunning = true;
    animationRef.current = requestAnimationFrame(animationLoop);
    startDirectionRandomizer();
  }, [animationLoop, startDirectionRandomizer]);

  // 停止动画
  const stop = useCallback(() => {
    const state = stateRef.current;
    state.isRunning = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (directionTimerRef.current) {
      clearInterval(directionTimerRef.current);
      directionTimerRef.current = null;
    }
  }, []);

  // 更新配置
  const updateOptions = useCallback(
    (newOptions: UseDynamicGridOptions) => {
      const state = stateRef.current;
      if (newOptions.gridSize !== undefined) {
        state.config.size = newOptions.gridSize;
        resizeCanvas();
      }
      if (newOptions.speed !== undefined) {
        state.config.speed = newOptions.speed;
      }
      if (newOptions.borderColor !== undefined) {
        state.config.borderColor = newOptions.borderColor;
      }

      if (newOptions.directionChangeInterval !== undefined) {
        state.config.directionChangeInterval =
          newOptions.directionChangeInterval;
        if (state.isRunning) {
          startDirectionRandomizer();
        }
      }
      if (newOptions.animate !== undefined) {
        if (newOptions.animate) {
          start();
        } else {
          stop();
        }
      }
    },
    [resizeCanvas, startDirectionRandomizer, start, stop]
  );

  // 获取当前方向
  const getCurrentDirection = useCallback(() => {
    return currentDirection;
  }, [currentDirection]);

  // 绑定事件监听器
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      resizeCanvas();
      draw();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [resizeCanvas, draw]);

  // 初始化和主题监听
  useEffect(() => {
    if (!canvasRef.current) return;

    // 设置初始主题颜色
    const updateThemeColors = () => {
      const state = stateRef.current;
      const isDark = document.documentElement.classList.contains("dark");
      if (isDark) {
        state.config.borderColor = "#374151"; // dark-gray-700
      } else {
        state.config.borderColor = "#e2e8f0"; // gray-200
      }
    };

    // 使用MutationObserver监听主题变化
    const observer = new MutationObserver(updateThemeColors);
    const targetNode = document.documentElement;
    observer.observe(targetNode, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 初始化
    resizeCanvas();
    updateThemeColors();

    if (options.animate !== false) {
      start();
    }

    return () => {
      stop();
      observer.disconnect();
    };
  }, [resizeCanvas, start, stop, options.animate]);

  return {
    canvasRef,
    start,
    stop,
    updateOptions,
    getCurrentDirection,
  };
}
