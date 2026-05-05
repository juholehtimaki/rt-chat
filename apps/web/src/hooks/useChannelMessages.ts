import { toast } from "@workspace/ui/components/sonner";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	startAfter,
	startAt,
	type Timestamp,
	updateDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";
import type { Message } from "../types";
import { useScrollManager } from "./useScrollManager";

const MESSAGES_PER_PAGE = 30;

type UseChannelMessagesOptions = {
	channelId: string;
	scrollAreaRef: React.RefObject<HTMLDivElement | null>;
};

export const useChannelMessages = ({
	channelId,
	scrollAreaRef,
}: UseChannelMessagesOptions) => {
	const { user, profile } = useAuthStore();
	const [messages, setMessages] = useState<Message[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);
	const newestTimestampRef = useRef<Timestamp | null>(null);
	const oldestTimestampRef = useRef<Timestamp | null>(null);

	const { scrollToBottom, preserveScroll, saveScrollHeight } = useScrollManager(
		{ scrollAreaRef },
	);

	// Initial load: fetch the most recent messages
	useEffect(() => {
		setMessages([]);
		setHasMore(true);
		setInitialLoadComplete(false);
		newestTimestampRef.current = null;
		oldestTimestampRef.current = null;

		const loadInitialMessages = async () => {
			const q = query(
				collection(db, "channels", channelId, "messages"),
				orderBy("createdAt", "desc"),
				limit(MESSAGES_PER_PAGE),
			);

			try {
				const snapshot = await getDocs(q);
				const messagesData = snapshot.docs
					.map((doc) => ({
						id: doc.id,
						...doc.data(),
					}))
					.reverse() as Message[];

				setMessages(messagesData);
				setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);

				if (messagesData.length > 0) {
					oldestTimestampRef.current = messagesData[0].createdAt;
					newestTimestampRef.current =
						messagesData[messagesData.length - 1].createdAt;
				}

				setInitialLoadComplete(true);
				scrollToBottom();
			} catch (err) {
				console.error("Failed to load messages", err);
				toast.error("Failed to load messages");
			}
		};

		loadInitialMessages();
	}, [channelId, scrollToBottom]);

	// Real-time subscription for new, modified, and deleted messages
	useEffect(() => {
		if (!initialLoadComplete) return;

		const messagesRef = collection(db, "channels", channelId, "messages");
		const q = oldestTimestampRef.current
			? query(
					messagesRef,
					orderBy("createdAt", "asc"),
					startAt(oldestTimestampRef.current),
				)
			: query(messagesRef, orderBy("createdAt", "asc"));

		const handleAdded = (message: Message) => {
			setMessages((prev) => {
				if (prev.some((m) => m.id === message.id)) return prev;
				return [...prev, message];
			});

			if (message.createdAt) {
				newestTimestampRef.current = message.createdAt;
			}

			scrollToBottom();
		};

		const handleModified = (message: Message) => {
			setMessages((prev) =>
				prev.map((m) => (m.id === message.id ? message : m)),
			);
		};

		const handleRemoved = (message: Message) => {
			setMessages((prev) => prev.filter((m) => m.id !== message.id));
		};

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				for (const change of snapshot.docChanges()) {
					const message = {
						id: change.doc.id,
						...change.doc.data({ serverTimestamps: "estimate" }),
					} as Message;

					switch (change.type) {
						case "added":
							handleAdded(message);
							break;
						case "modified":
							handleModified(message);
							break;
						case "removed":
							handleRemoved(message);
							break;
					}
				}
			},
			(err) => {
				console.error("Failed to listen to messages", err);
				toast.error("Failed to receive new messages");
			},
		);

		return unsubscribe;
	}, [channelId, initialLoadComplete, scrollToBottom]);

	// Load older messages (infinite scroll upward)
	const loadMoreMessages = useCallback(async () => {
		if (loadingMore || !hasMore || !oldestTimestampRef.current) return;

		setLoadingMore(true);
		saveScrollHeight();

		const q = query(
			collection(db, "channels", channelId, "messages"),
			orderBy("createdAt", "desc"),
			startAfter(oldestTimestampRef.current),
			limit(MESSAGES_PER_PAGE),
		);

		try {
			const snapshot = await getDocs(q);
			const olderMessages = snapshot.docs
				.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}))
				.reverse() as Message[];

			if (olderMessages.length > 0) {
				oldestTimestampRef.current = olderMessages[0].createdAt;
			}

			setMessages((prev) => [...olderMessages, ...prev]);
			setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
			preserveScroll();
		} catch (err) {
			console.error("Failed to load more messages", err);
			toast.error("Failed to load more messages");
		} finally {
			setLoadingMore(false);
		}
	}, [loadingMore, hasMore, channelId, saveScrollHeight, preserveScroll]);

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.currentTarget;
			if (target.scrollTop < 100 && hasMore && !loadingMore) {
				loadMoreMessages();
			}
		},
		[hasMore, loadingMore, loadMoreMessages],
	);

	const sendMessage = useCallback(
		async (text: string) => {
			if (!user || !profile) return;

			try {
				await addDoc(collection(db, "channels", channelId, "messages"), {
					text,
					userId: user.uid,
					userNickname: profile.nickname,
					createdAt: serverTimestamp(),
					channelId,
				});
			} catch (err) {
				console.error("Failed to send message", err);
				toast.error("Failed to send message");
			}
		},
		[channelId, user, profile],
	);

	const deleteMessage = useCallback(
		async (messageId: string) => {
			try {
				await deleteDoc(doc(db, "channels", channelId, "messages", messageId));
			} catch (err) {
				console.error("Failed to delete message", err);
				toast.error("Failed to delete message");
			}
		},
		[channelId],
	);

	const editMessage = useCallback(
		async (messageId: string, newText: string) => {
			try {
				await updateDoc(doc(db, "channels", channelId, "messages", messageId), {
					text: newText,
					editedAt: serverTimestamp(),
				});
			} catch (err) {
				console.error("Failed to edit message", err);
				toast.error("Failed to edit message");
			}
		},
		[channelId],
	);

	return {
		messages,
		hasMore,
		loadingMore,
		handleScroll,
		sendMessage,
		deleteMessage,
		editMessage,
	};
};
