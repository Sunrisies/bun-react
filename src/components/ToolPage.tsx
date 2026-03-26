import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { BackButton } from "./BackButton";
import { InfoTooltip } from "./InfoTooltip";

interface ToolPageProps {
	title: string;
	description?: string;
	actions?: ReactNode;
	children: ReactNode;
	maxWidth?: string;
}

export function ToolPage({
	title,
	description,
	actions,
	children,
	maxWidth,
}: ToolPageProps) {
	return (
		<div className="h-[calc(100vh-4.2rem)] p-4">
			<Card
				className={`w-full h-full mx-auto shadow-lg flex flex-col ${maxWidth || ""}`}
			>
				<CardHeader className="flex-shrink-0 pb-2 border-b">
					<div className="flex justify-between items-center">
						<CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
							{title}
							{description && <InfoTooltip content={description} />}
						</CardTitle>
						<div className="flex gap-2">
							{actions}
							<BackButton />
						</div>
					</div>
				</CardHeader>
				<CardContent className="flex-1 min-h-0 p-4 overflow-hidden">
					{children}
				</CardContent>
			</Card>
		</div>
	);
}
