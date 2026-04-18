import {
	addDoc,
	collection,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { type SyntheticEvent, useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";
import type { Channel } from "../types";

type ChannelListProps = {
	selectedChannel: Channel | null;
	onSelectChannel: (channel: Channel) => void;
};

export const ChannelList = ({
	selectedChannel,
	onSelectChannel,
}: ChannelListProps) => {
	const user = useAuthStore((state) => state.user);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [newChannelName, setNewChannelName] = useState("");
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		const q = query(collection(db, "channels"), orderBy("createdAt", "desc"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const channelsData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Channel[];
			setChannels(channelsData);
		});
		return unsubscribe;
	}, []);

	const handleCreateChannel = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!newChannelName.trim() || !user) return;

		setCreating(true);
		try {
			await addDoc(collection(db, "channels"), {
				name: newChannelName.trim(),
				createdAt: serverTimestamp(),
				createdBy: user.uid,
			});
			setNewChannelName("");
		} finally {
			setCreating(false);
		}
	};

	return (
		<div className="channel-list">
			<h3>Channels</h3>
			<form onSubmit={handleCreateChannel} className="create-channel-form">
				<input
					type="text"
					placeholder="New channel name"
					value={newChannelName}
					onChange={(e) => setNewChannelName(e.target.value)}
					disabled={creating}
				/>
				<button type="submit" disabled={creating || !newChannelName.trim()}>
					+
				</button>
			</form>
			<ul>
				{channels.map((channel) => (
					<li key={channel.id}>
						<button
							type="button"
							className={selectedChannel?.id === channel.id ? "selected" : ""}
							onClick={() => onSelectChannel(channel)}
						>
							# {channel.name}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
};
