import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
	className?: string;
}

export function BackButton({ className }: BackButtonProps) {
	const navigate = useNavigate();
	return (
		<Button
			onClick={() => navigate({ to: "/" })}
			variant="ghost"
			size="sm"
			className={className}
		>
			<ArrowLeft className="h-4 w-4 mr-1" />
			返回
		</Button>
	);
}
