import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { useRef } from "react";
import { db } from "../../firebase";
import { useChannelMessages } from "../../hooks/useChannelMessages";
import { useAuthStore } from "../../stores/authStore";
import type { Channel } from "../../types";
import { ChannelHeader } from "./ChannelHeader";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

type ChatProps = {
	channel: Channel;
};

export const Chat = ({ channel }: ChatProps) => {
	const { user, profile } = useAuthStore();
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const { messages, hasMore, loadingMore, handleScroll } = useChannelMessages({
		channelId: channel.id,
		scrollAreaRef,
	});

	const handleSend = async (text: string) => {
		if (!user || !profile) return;

		await addDoc(collection(db, "channels", channel.id, "messages"), {
			text,
			userId: user.uid,
			userNickname: profile.nickname,
			createdAt: serverTimestamp(),
			channelId: channel.id,
		});
	};

	const handleDelete = async (messageId: string) => {
		await deleteDoc(doc(db, "channels", channel.id, "messages", messageId));
	};

	const handleEdit = async (messageId: string, newText: string) => {
		await updateDoc(doc(db, "channels", channel.id, "messages", messageId), {
			text: newText,
		});
	};

	return (
		<div className="flex h-full flex-col">
			<ChannelHeader name={channel.name} />
			<MessageList
				messages={messages}
				currentUserId={user?.uid ?? ""}
				hasMore={hasMore}
				loadingMore={loadingMore}
				scrollAreaRef={scrollAreaRef}
				onScroll={handleScroll}
				onDelete={handleDelete}
				onEdit={handleEdit}
			/>
			<MessageInput channelName={channel.name} onSend={handleSend} />
		</div>
	);
};
