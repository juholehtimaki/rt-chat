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
		<article
			className={cn("flex max-w-[75%] flex-col", isOwn && "ml-auto items-end")}
		>
			<header
				className={cn(
					"mb-1 flex items-center gap-2",
					isOwn && "flex-row-reverse",
				)}
			>
				<Avatar className="h-7 w-7 ring-1 ring-border/50">
					<AvatarFallback className="text-xs font-medium">
						{getInitial(message.userNickname)}
					</AvatarFallback>
				</Avatar>
				<span className="text-sm font-medium">
					{message.userNickname || "Unknown"}
				</span>
				<time
					className="text-xs text-muted-foreground"
					dateTime={message.createdAt?.toDate().toISOString()}
				>
					{message.createdAt
						? message.createdAt.toDate().toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})
						: "..."}
				</time>
			</header>
			<p
				className={cn(
					"w-fit rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
					isOwn
						? "rounded-tr-md bg-primary text-primary-foreground"
						: "rounded-tl-md bg-card text-foreground ring-1 ring-border/50",
				)}
			>
				{message.text}
			</p>
		</article>
	);
};
