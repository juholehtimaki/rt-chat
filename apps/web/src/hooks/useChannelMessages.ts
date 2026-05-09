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
import { useCallback, useEffect, useState } from "react";
import { COLLECTIONS } from "../constants/firestore";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";
import type { Message } from "../types";
import { useScrollManager } from "./useScrollManager";

const MESSAGES_PER_PAGE = 30;
const SCROLL_LOAD_THRESHOLD = 100;

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
	const [oldestTimestamp, setOldestTimestamp] = useState<Timestamp | null>(
		null,
	);

	const { scrollToBottom, preserveScroll, saveScrollHeight } = useScrollManager(
		{ scrollAreaRef },
	);

	// Initial load: fetch the most recent messages
	useEffect(() => {
		setMessages([]);
		setHasMore(true);
		setInitialLoadComplete(false);
		setOldestTimestamp(null);

		const loadInitialMessages = async () => {
			const q = query(
				collection(db, COLLECTIONS.CHANNELS, channelId, COLLECTIONS.MESSAGES),
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
					setOldestTimestamp(messagesData[0].createdAt);
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

		const messagesRef = collection(
			db,
			COLLECTIONS.CHANNELS,
			channelId,
			COLLECTIONS.MESSAGES,
		);
		const q = oldestTimestamp
			? query(
					messagesRef,
					orderBy("createdAt", "asc"),
					startAt(oldestTimestamp),
				)
			: query(messagesRef, orderBy("createdAt", "asc"));

		const handleAdded = (message: Message) => {
			setMessages((prev) => {
				if (prev.some((m) => m.id === message.id)) return prev;
				return [...prev, message];
			});
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
	}, [channelId, initialLoadComplete, oldestTimestamp]);

	// Load older messages (infinite scroll upward)
	const loadMoreMessages = useCallback(async () => {
		if (loadingMore || !hasMore || !oldestTimestamp) return;

		setLoadingMore(true);
		saveScrollHeight();

		const q = query(
			collection(db, COLLECTIONS.CHANNELS, channelId, COLLECTIONS.MESSAGES),
			orderBy("createdAt", "desc"),
			startAfter(oldestTimestamp),
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
				setOldestTimestamp(olderMessages[0].createdAt);
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
	}, [
		loadingMore,
		hasMore,
		oldestTimestamp,
		channelId,
		saveScrollHeight,
		preserveScroll,
	]);

	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.currentTarget;
			if (target.scrollTop < SCROLL_LOAD_THRESHOLD && hasMore && !loadingMore) {
				loadMoreMessages();
			}
		},
		[hasMore, loadingMore, loadMoreMessages],
	);

	const sendMessage = useCallback(
		async (text: string) => {
			if (!user || !profile) return;

			try {
				await addDoc(
					collection(db, COLLECTIONS.CHANNELS, channelId, COLLECTIONS.MESSAGES),
					{
						text,
						userId: user.uid,
						userNickname: profile.nickname,
						createdAt: serverTimestamp(),
						channelId,
					},
				);
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
				await deleteDoc(
					doc(
						db,
						COLLECTIONS.CHANNELS,
						channelId,
						COLLECTIONS.MESSAGES,
						messageId,
					),
				);
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
				await updateDoc(
					doc(
						db,
						COLLECTIONS.CHANNELS,
						channelId,
						COLLECTIONS.MESSAGES,
						messageId,
					),
					{
						text: newText,
						editedAt: serverTimestamp(),
					},
				);
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
