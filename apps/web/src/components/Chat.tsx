import {
	addDoc,
	collection,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { type SyntheticEvent, useEffect, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import type { Channel, Message } from "../types";

type ChatProps = {
	channel: Channel;
};

export const Chat = ({ channel }: ChatProps) => {
	const { user, profile } = useAuth();
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
		});
		return unsubscribe;
	}, [channel.id]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

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
		<div className="chat">
			<div className="chat-header">
				<h2># {channel.name}</h2>
			</div>
			<div className="messages">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`message ${message.userId === user?.uid ? "own" : ""}`}
					>
						<span className="message-author">{message.userNickname}</span>
						<span className="message-text">{message.text}</span>
						<span className="message-time">
							{message.createdAt?.toDate().toLocaleTimeString()}
						</span>
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>
			<form onSubmit={handleSend} className="message-form">
				<input
					type="text"
					placeholder={`Message #${channel.name}`}
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					disabled={sending}
				/>
				<button type="submit" disabled={sending || !newMessage.trim()}>
					Send
				</button>
			</form>
		</div>
	);
};
