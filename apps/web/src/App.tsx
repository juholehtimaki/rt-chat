import { signOut } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Login } from "./components/auth/Login";
import { NicknamePrompt } from "./components/auth/NicknamePrompt";
import { ChannelList } from "./components/channels/ChannelList";
import { Chat } from "./components/chat/Chat";
import { AppHeader } from "./components/layout/AppHeader";
import { AppLayout } from "./components/layout/AppLayout";
import { EmptyState } from "./components/layout/EmptyState";
import { auth } from "./firebase";
import { useAuthStore } from "./stores/authStore";
import type { Channel } from "./types";

export const App = () => {
	const { user, profile, loading } = useAuthStore();
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<div className="flex flex-col items-center gap-3">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}
	if (!user) return <Login />;
	if (!profile) return <NicknamePrompt />;

	return (
		<div className="flex h-screen flex-col bg-background">
			<AppHeader nickname={profile.nickname} onSignOut={() => signOut(auth)} />
			<AppLayout
				sidebar={
					<ChannelList
						selectedChannel={selectedChannel}
						onSelectChannel={setSelectedChannel}
					/>
				}
			>
				{selectedChannel ? <Chat channel={selectedChannel} /> : <EmptyState />}
			</AppLayout>
		</div>
	);
};
