import { MessageCircle } from "lucide-react";

export const EmptyState = () => {
	return (
		<div className="flex h-full items-center justify-center bg-muted/20">
			<div className="text-center">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50">
					<MessageCircle
						className="h-8 w-8 text-muted-foreground"
						aria-hidden="true"
					/>
				</div>
				<p className="text-sm font-medium text-muted-foreground">
					Select a channel to start chatting
				</p>
			</div>
		</div>
	);
};
