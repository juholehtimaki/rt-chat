import { Hash } from "lucide-react";

type ChannelHeaderProps = {
	name: string;
};

export const ChannelHeader = ({ name }: ChannelHeaderProps) => {
	return (
		<div className="flex items-center gap-2 border-b px-4 py-3">
			<Hash className="h-5 w-5 text-muted-foreground" />
			<h2 className="font-semibold">{name}</h2>
		</div>
	);
};
