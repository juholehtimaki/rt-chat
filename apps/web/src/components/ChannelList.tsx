import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
	addDoc,
	collection,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { Hash, Plus } from "lucide-react";
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
		<div className="flex h-full flex-col">
			<div className="p-4">
				<h2 className="mb-2 text-lg font-semibold">Channels</h2>
				<form onSubmit={handleCreateChannel} className="flex gap-2">
					<Input
						type="text"
						placeholder="New channel"
						value={newChannelName}
						onChange={(e) => setNewChannelName(e.target.value)}
						disabled={creating}
						className="h-9"
					/>
					<Button
						type="submit"
						size="icon"
						variant="secondary"
						disabled={creating || !newChannelName.trim()}
						className="h-9 w-9 shrink-0"
					>
						<Plus className="h-4 w-4" />
					</Button>
				</form>
			</div>
			<Separator />
			<ScrollArea className="flex-1">
				<div className="p-2">
					{channels.map((channel) => (
						<Button
							key={channel.id}
							variant={
								selectedChannel?.id === channel.id ? "secondary" : "ghost"
							}
							className="mb-1 w-full justify-start"
							onClick={() => onSelectChannel(channel)}
						>
							<Hash className="mr-2 h-4 w-4" />
							{channel.name}
						</Button>
					))}
				</div>
			</ScrollArea>
		</div>
	);
};
