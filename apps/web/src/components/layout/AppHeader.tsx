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
		<header className="flex h-14 items-center justify-between border-b px-4">
			<div className="flex items-center gap-2">
				<MessageCircle className="h-6 w-6" />
				<h1 className="text-lg font-semibold">RT Chat</h1>
			</div>
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<Avatar className="h-8 w-8">
						<AvatarFallback className="text-xs">
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
					title="Sign out"
				>
					<LogOut className="h-4 w-4" />
				</Button>
			</div>
		</header>
	);
};
