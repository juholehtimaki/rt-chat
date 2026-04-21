import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { cn } from "@workspace/ui/lib/utils";
import {
	addDoc,
	collection,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { Hash, Send } from "lucide-react";
import { type SyntheticEvent, useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";
import type { Channel, Message } from "../types";

type ChatProps = {
	channel: Channel;
};

export const Chat = ({ channel }: ChatProps) => {
	const { user, profile } = useAuthStore();
	const [messages, setMessages] = useState<Message[]>([]);
	const [newMessage, setNewMessage] = useState("");
	const [sending, setSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const q = query(
			collection(db, "channels", channel.id, "messages"),
			orderBy("createdAt", "asc"),
		);
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const messagesData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Message[];
			setMessages(messagesData);
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 0);
		});
		return unsubscribe;
	}, [channel.id]);

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

	const getInitials = (name: string | undefined) => {
		if (!name) return "?";
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.slice(0, 2);
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center gap-2 border-b px-4 py-3">
				<Hash className="h-5 w-5 text-muted-foreground" />
				<h2 className="font-semibold">{channel.name}</h2>
			</div>

			<ScrollArea className="flex-1 p-4">
				<div className="space-y-4">
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
					<div ref={messagesEndRef} />
				</div>
			</ScrollArea>

			<Separator />
			<form onSubmit={handleSend} className="flex gap-2 p-4">
				<Input
					type="text"
					placeholder={`Message #${channel.name}`}
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					disabled={sending}
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
