import { Info } from "lucide-react";

interface InfoTooltipProps {
	content: string;
}

export function InfoTooltip({ content }: InfoTooltipProps) {
	return (
		<div className="relative inline-block group">
			<div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 text-blue-600 cursor-pointer hover:bg-blue-200 transition-colors">
				<Info className="h-4 w-4" />
			</div>
			<div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-72 p-3 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
				<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-3 h-3 bg-white border-l border-t border-gray-200" />
				<div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-600">
					{content}
				</div>
			</div>
		</div>
	);
}
