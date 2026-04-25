import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { LogOut, MessageCircle } from "lucide-react";
import { getInitial } from "@/utils/getInitial";

type AppHeaderProps = {
	nickname: string;
	onSignOut: () => void;
};

export const AppHeader = ({ nickname, onSignOut }: AppHeaderProps) => {
	return (
		<header className="relative z-10 flex h-14 items-center justify-between border-b bg-card/80 px-6 shadow-sm backdrop-blur-sm">
			<div className="flex items-center gap-3">
				<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
					<MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
				</div>
				<h1 className="text-lg font-semibold tracking-tight">RT Chat</h1>
			</div>

			<div className="flex items-center gap-4">
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8 ring-2 ring-border">
						<AvatarFallback className="text-xs font-medium">
							{getInitial(nickname)}
						</AvatarFallback>
					</Avatar>
					<span className="text-sm font-medium">{nickname}</span>
				</div>
				<Separator orientation="vertical" className="h-6" />
				<Button
					variant="ghost"
					size="icon"
					onClick={onSignOut}
					aria-label="Sign out"
					className="transition-colors hover:bg-destructive/10 hover:text-destructive"
				>
					<LogOut className="h-4 w-4" aria-hidden="true" />
				</Button>
			</div>
		</header>
	);
};
