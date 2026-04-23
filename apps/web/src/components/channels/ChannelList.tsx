import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import { Hash, Plus } from "lucide-react";
import { type SyntheticEvent, useState } from "react";
import { useChannels } from "../../hooks/useChannels";
import type { Channel } from "../../types";

type ChannelListProps = {
	selectedChannel: Channel | null;
	onSelectChannel: (channel: Channel) => void;
};

export const ChannelList = ({
	selectedChannel,
	onSelectChannel,
}: ChannelListProps) => {
	const { channels, creating, createChannel } = useChannels();
	const [newChannelName, setNewChannelName] = useState("");

	const handleCreateChannel = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		const name = newChannelName.trim();
		if (!name) return;

		await createChannel(name);
		setNewChannelName("");
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
