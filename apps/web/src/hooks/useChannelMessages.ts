import { toast } from "@workspace/ui/components/sonner";
import {
	collection,
	getDocs,
	limit,
	onSnapshot,
	orderBy,
	query,
	startAfter,
	type Timestamp,
} from "firebase/firestore";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { db } from "../firebase";
import type { Message } from "../types";

const MESSAGES_PER_PAGE = 30;

type UseChannelMessagesOptions = {
	channelId: string;
	scrollAreaRef: React.RefObject<HTMLDivElement | null>;
};

export const useChannelMessages = ({
	channelId,
	scrollAreaRef,
}: UseChannelMessagesOptions) => {
	const [messages, setMessages] = useState<Message[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [initialLoadComplete, setInitialLoadComplete] = useState(false);
	const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
	const [shouldPreserveScroll, setShouldPreserveScroll] = useState(false);
	const newestTimestampRef = useRef<Timestamp | null>(null);
	const prevScrollHeightRef = useRef<number>(0);

	// Scroll to bottom after DOM updates
	useLayoutEffect(() => {
		if (shouldScrollToBottom && scrollAreaRef.current) {
			scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
			setShouldScrollToBottom(false);
		}
	}, [shouldScrollToBottom, scrollAreaRef]);

	// Preserve scroll position after loading older messages
	useLayoutEffect(() => {
		if (shouldPreserveScroll && scrollAreaRef.current) {
			const newScrollHeight = scrollAreaRef.current.scrollHeight;
			scrollAreaRef.current.scrollTop =
				newScrollHeight - prevScrollHeightRef.current;
			setShouldPreserveScroll(false);
		}
	}, [shouldPreserveScroll, scrollAreaRef]);

	// Initial load: fetch the most recent messages
	useEffect(() => {
		setMessages([]);
		setHasMore(true);
		setInitialLoadComplete(false);
		newestTimestampRef.current = null;

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
					newestTimestampRef.current =
						messagesData[messagesData.length - 1].createdAt;
				}

				setInitialLoadComplete(true);
				setShouldScrollToBottom(true);
			} catch (err) {
				console.error("Failed to load messages", err);
				toast.error("Failed to load messages");
			}
		};

		loadInitialMessages();
	}, [channelId]);

	// Real-time subscription for new messages
	useEffect(() => {
		if (!initialLoadComplete) return;

		const q = newestTimestampRef.current
			? query(
					collection(db, "channels", channelId, "messages"),
					orderBy("createdAt", "asc"),
					startAfter(newestTimestampRef.current),
				)
			: query(
					collection(db, "channels", channelId, "messages"),
					orderBy("createdAt", "asc"),
				);

		const unsubscribe = onSnapshot(q, (snapshot) => {
			snapshot.docChanges().forEach((change) => {
				if (change.type === "added") {
					// Use "estimate" to show client-side timestamp immediately
					// instead of null while serverTimestamp() resolves
					const newMessage = {
						id: change.doc.id,
						...change.doc.data({ serverTimestamps: "estimate" }),
					} as Message;

					setMessages((prev) => {
						if (prev.some((m) => m.id === newMessage.id)) return prev;
						return [...prev, newMessage];
					});

					if (newMessage.createdAt) {
						newestTimestampRef.current = newMessage.createdAt;
					}

					setShouldScrollToBottom(true);
				}
			});
		});

		return unsubscribe;
	}, [channelId, initialLoadComplete]);

	// Load older messages
	const loadMoreMessages = useCallback(async () => {
		if (loadingMore || !hasMore || messages.length === 0) return;

		const oldestMessage = messages[0];
		if (!oldestMessage?.createdAt) return;

		setLoadingMore(true);
		prevScrollHeightRef.current = scrollAreaRef.current?.scrollHeight ?? 0;

		const q = query(
			collection(db, "channels", channelId, "messages"),
			orderBy("createdAt", "desc"),
			startAfter(oldestMessage.createdAt),
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

			setMessages((prev) => [...olderMessages, ...prev]);
			setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
			setShouldPreserveScroll(true);
		} catch (err) {
			console.error("Failed to load more messages", err);
			toast.error("Failed to load more messages");
		} finally {
			setLoadingMore(false);
		}
	}, [loadingMore, hasMore, messages, channelId, scrollAreaRef]);

	// Scroll handler for infinite scroll
	const handleScroll = useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const target = e.currentTarget;
			if (target.scrollTop < 100 && hasMore && !loadingMore) {
				loadMoreMessages();
			}
		},
		[hasMore, loadingMore, loadMoreMessages],
	);

	return {
		messages,
		hasMore,
		loadingMore,
		handleScroll,
	};
};
