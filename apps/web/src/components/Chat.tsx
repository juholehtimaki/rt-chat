import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Hash, Loader2, Send } from "lucide-react";
import { type SyntheticEvent, useRef, useState } from "react";
import { getInitials } from "@/utils/getInitials";
import { db } from "../firebase";
import { useChannelMessages } from "../hooks/useChannelMessages";
import { useAuthStore } from "../stores/authStore";
import type { Channel } from "../types";

type ChatProps = {
	channel: Channel;
};

export const Chat = ({ channel }: ChatProps) => {
	const { user, profile } = useAuthStore();
	const [newMessage, setNewMessage] = useState("");
	const [sending, setSending] = useState(false);
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const { messages, hasMore, loadingMore, handleScroll } = useChannelMessages({
		channelId: channel.id,
		scrollAreaRef,
	});

	const handleSend = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!newMessage.trim() || !user || !profile) return;

		setSending(true);
		try {
			await addDoc(collection(db, "channels", channel.id, "messages"), {
				text: newMessage.trim(),
				userId: user.uid,
				userNickname: profile.nickname,
				createdAt: serverTimestamp(),
				channelId: channel.id,
			});
			setNewMessage("");
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center gap-2 border-b px-4 py-3">
				<Hash className="h-5 w-5 text-muted-foreground" />
				<h2 className="font-semibold">{channel.name}</h2>
			</div>

			<ScrollArea
				className="flex-1"
				viewportRef={scrollAreaRef}
				onScroll={handleScroll}
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
					{messages.map((message) => {
						const isOwn = message.userId === user?.uid;
						return (
							<div
								key={message.id}
								className={cn("flex gap-3", isOwn && "flex-row-reverse")}
							>
								<Avatar className="h-8 w-8 shrink-0">
									<AvatarFallback className="text-xs">
										{getInitials(message.userNickname)}
									</AvatarFallback>
								</Avatar>
								<div
									className={cn(
										"flex max-w-[70%] flex-col",
										isOwn && "items-end",
									)}
								>
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
					})}
				</div>
			</ScrollArea>

			<Separator />
			<form onSubmit={handleSend} className="flex gap-2 p-4">
				<Input
					type="text"
					placeholder={`Message #${channel.name}`}
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					className="flex-1"
				/>
				<Button
					type="submit"
					size="icon"
					disabled={sending || !newMessage.trim()}
				>
					<Send className="h-4 w-4" />
				</Button>
			</form>
		</div>
	);
};
