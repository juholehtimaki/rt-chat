import { Hash } from "lucide-react";

type ChannelHeaderProps = {
	name: string;
};

export const ChannelHeader = ({ name }: ChannelHeaderProps) => {
	return (
		<header className="flex items-center gap-3 border-b bg-card/50 px-6 py-3 shadow-sm">
			<div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
				<Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
			</div>
			<h2 className="font-semibold tracking-tight">{name}</h2>
		</header>
	);
};
