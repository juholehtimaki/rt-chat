import { useRef } from "react";
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
	const { user } = useAuthStore();
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const {
		messages,
		hasMore,
		loadingMore,
		handleScroll,
		sendMessage,
		deleteMessage,
		editMessage,
	} = useChannelMessages({
		channelId: channel.id,
		scrollAreaRef,
	});

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
				onDelete={deleteMessage}
				onEdit={editMessage}
			/>
			<MessageInput channelName={channel.name} onSend={sendMessage} />
		</div>
	);
};
