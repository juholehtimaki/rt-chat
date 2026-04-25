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
	onDelete: (messageId: string) => Promise<void>;
	onEdit: (messageId: string, newText: string) => Promise<void>;
};

export const MessageList = ({
	messages,
	currentUserId,
	hasMore,
	loadingMore,
	scrollAreaRef,
	onScroll,
	onDelete,
	onEdit,
}: MessageListProps) => {
	return (
		<ScrollArea
			className="flex-1 bg-muted/20"
			viewportRef={scrollAreaRef}
			onScroll={onScroll}
		>
			<div className="space-y-6 p-6">
				{loadingMore && (
					<div className="flex justify-center py-3">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				)}
				{!hasMore && messages.length > 0 && (
					<div className="mx-auto w-fit rounded-full bg-muted/50 px-4 py-1.5 text-center text-xs text-muted-foreground">
						Beginning of conversation
					</div>
				)}
				{messages.map((message) => (
					<MessageBubble
						key={message.id}
						message={message}
						isOwn={message.userId === currentUserId}
						onDelete={() => onDelete(message.id)}
						onEdit={(newText) => onEdit(message.id, newText)}
					/>
				))}
			</div>
		</ScrollArea>
	);
};
