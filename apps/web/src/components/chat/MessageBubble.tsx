import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import type { Message } from "@/types";
import { getInitial } from "@/utils/getInitial";

type MessageBubbleProps = {
	message: Message;
	isOwn: boolean;
};

export const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
	return (
		<div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
			<Avatar className="h-8 w-8 shrink-0">
				<AvatarFallback className="text-xs">
					{getInitial(message.userNickname)}
				</AvatarFallback>
			</Avatar>
			<div className={cn("flex max-w-[70%] flex-col", isOwn && "items-end")}>
				<div className="flex items-center gap-2">
					<span className="text-sm font-medium">
						{message.userNickname || "Unknown"}
					</span>
					<span className="text-xs text-muted-foreground">
						{message.createdAt
							? message.createdAt.toDate().toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})
							: "..."}
					</span>
				</div>
				<div
					className={cn(
						"mt-1 rounded-lg px-3 py-2",
						isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
					)}
				>
					<p className="text-sm">{message.text}</p>
				</div>
			</div>
		</div>
	);
};
