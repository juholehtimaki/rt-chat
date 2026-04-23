import { MessageCircle } from "lucide-react";

export const EmptyState = () => {
	return (
		<div className="flex h-full items-center justify-center">
			<div className="text-center text-muted-foreground">
				<MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
				<p>Select a channel to start chatting</p>
			</div>
		</div>
	);
};
