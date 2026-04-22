import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { signOut } from "firebase/auth";
import { LogOut, MessageCircle } from "lucide-react";
import { useState } from "react";
import { ChannelList } from "./components/ChannelList";
import { Chat } from "./components/Chat";
import { Login } from "./components/Login";
import { NicknamePrompt } from "./components/NicknamePrompt";
import { auth } from "./firebase";
import { useAuthStore } from "./stores/authStore";
import type { Channel } from "./types";
import { getInitials } from "./utils/getInitials";

export const App = () => {
	const { user, profile, loading } = useAuthStore();
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="text-muted-foreground">Loading...</div>
			</div>
		);
	}

	if (!user) {
		return <Login />;
	}

	if (!profile) {
		return <NicknamePrompt />;
	}

	return (
		<div className="flex h-screen flex-col bg-background">
			<header className="flex h-14 items-center justify-between border-b px-4">
				<div className="flex items-center gap-2">
					<MessageCircle className="h-6 w-6" />
					<h1 className="text-lg font-semibold">RT Chat</h1>
				</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<Avatar className="h-8 w-8">
							<AvatarFallback className="text-xs">
								{getInitials(profile.nickname)}
							</AvatarFallback>
						</Avatar>
						<span className="text-sm font-medium">{profile.nickname}</span>
					</div>
					<Separator orientation="vertical" className="h-6" />
					<Button
						variant="ghost"
						size="icon"
						onClick={() => signOut(auth)}
						title="Sign out"
					>
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</header>
			<div className="flex flex-1 overflow-hidden">
				<aside className="w-64 border-r">
					<ChannelList
						selectedChannel={selectedChannel}
						onSelectChannel={setSelectedChannel}
					/>
				</aside>
				<main className="flex-1 overflow-hidden">
					{selectedChannel ? (
						<Chat channel={selectedChannel} />
					) : (
						<div className="flex h-full items-center justify-center">
							<div className="text-center text-muted-foreground">
								<MessageCircle className="mx-auto mb-2 h-12 w-12 opacity-50" />
								<p>Select a channel to start chatting</p>
							</div>
						</div>
					)}
				</main>
			</div>
		</div>
	);
};

export default App;
