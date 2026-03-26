import { copyToClipboard } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

/**
 * 复制到剪贴板 Hook
 */
export function useCopy() {
	const copy = (value: string, name?: string) => {
		if (!value) return;
		copyToClipboard(value);
		if (name) {
			toast.success(`已复制 ${name}`);
		} else {
			toast.success("已复制");
		}
	};
	return { copy };
}

/**
 * 页面导航 Hook
 */
export function usePageNav() {
	const navigate = useNavigate();
	const goBack = () => navigate({ to: "/" });
	return { navigate, goBack };
}

/**
 * 示例数据加载 Hook
 */
export function useSample<T>(
	setData: (data: T) => void,
	sampleData: T,
	message = "示例已加载",
) {
	const loadSample = () => {
		setData(sampleData);
		toast.success(message);
	};
	return { loadSample };
}

/**
 * 清空数据 Hook
 */
export function useClear(resetFn: () => void) {
	const clear = () => resetFn();
	return { clear };
}
