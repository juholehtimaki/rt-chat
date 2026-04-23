import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Loader2 } from "lucide-react";
import type { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";

type MessageListProps = {
	messages: Message[];
	currentUserId: string;
	hasMore: boolean;
	loadingMore: boolean;
	scrollAreaRef: React.RefObject<HTMLDivElement | null>;
	onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
};

export const MessageList = ({
	messages,
	currentUserId,
	hasMore,
	loadingMore,
	scrollAreaRef,
	onScroll,
}: MessageListProps) => {
	return (
		<ScrollArea
			className="flex-1"
			viewportRef={scrollAreaRef}
			onScroll={onScroll}
		>
			<div className="space-y-4 p-4">
				{loadingMore && (
					<div className="flex justify-center py-2">
						<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
					</div>
				)}
				{!hasMore && messages.length > 0 && (
					<div className="text-center text-sm text-muted-foreground py-2">
						Beginning of conversation
					</div>
				)}
				{messages.map((message) => (
					<MessageBubble
						key={message.id}
						message={message}
						isOwn={message.userId === currentUserId}
					/>
				))}
			</div>
		</ScrollArea>
	);
};
