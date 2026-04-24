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
		<div
			className={cn("flex max-w-[70%] flex-col", isOwn && "ml-auto items-end")}
		>
			<div
				className={cn("flex items-center gap-2", isOwn && "flex-row-reverse")}
			>
				<Avatar className="h-8 w-8">
					<AvatarFallback className="text-xs">
						{getInitial(message.userNickname)}
					</AvatarFallback>
				</Avatar>
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
			<p
				className={cn(
					"mt-1 rounded-2xl px-4 py-2 text-sm",
					isOwn
						? "bg-primary text-primary-foreground"
						: "bg-muted text-foreground",
				)}
			>
				{message.text}
			</p>
		</div>
	);
};
