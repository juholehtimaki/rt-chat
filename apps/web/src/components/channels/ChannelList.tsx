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
		<nav aria-label="Channels" className="flex h-full flex-col">
			<div className="p-4 pb-3">
				<h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Channels
				</h2>
				<form onSubmit={handleCreateChannel} className="flex gap-2">
					<Input
						type="text"
						placeholder="New channel"
						value={newChannelName}
						onChange={(e) => setNewChannelName(e.target.value)}
						disabled={creating}
						className="h-9 bg-background/50 transition-colors focus:bg-background"
					/>
					<Button
						type="submit"
						size="icon"
						variant="secondary"
						disabled={creating || !newChannelName.trim()}
						aria-label="Create channel"
						className="h-9 w-9 shrink-0 transition-transform hover:scale-105 active:scale-95"
					>
						<Plus className="h-4 w-4" aria-hidden="true" />
					</Button>
				</form>
			</div>
			<Separator />
			<ScrollArea className="flex-1">
				<ul className="space-y-1 p-2">
					{channels.map((channel) => (
						<li key={channel.id}>
							<Button
								variant={
									selectedChannel?.id === channel.id ? "secondary" : "ghost"
								}
								className="w-full justify-start transition-all hover:translate-x-0.5"
								onClick={() => onSelectChannel(channel)}
							>
								<Hash
									className="mr-2 h-4 w-4 text-muted-foreground"
									aria-hidden="true"
								/>
								<span className="truncate">{channel.name}</span>
							</Button>
						</li>
					))}
				</ul>
			</ScrollArea>
		</nav>
	);
};
