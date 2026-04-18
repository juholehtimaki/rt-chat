import { signOut } from "firebase/auth";
import { useState } from "react";
import "./App.css";
import { ChannelList } from "./components/ChannelList";
import { Chat } from "./components/Chat";
import { Login } from "./components/Login";
import { NicknamePrompt } from "./components/NicknamePrompt";
import { useAuth } from "./contexts/AuthContext";
import { auth } from "./firebase";
import type { Channel } from "./types";

function App() {
	const { user, profile, loading } = useAuth();
	const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

	if (loading) {
		return <div className="loading">Loading...</div>;
	}

	if (!user) {
		return <Login />;
	}

	if (!profile) {
		return <NicknamePrompt />;
	}

	return (
		<div className="app-container">
			<header className="app-header">
				<h1>RT Chat</h1>
				<div className="user-info">
					<span>{profile.nickname}</span>
					<button type="button" onClick={() => signOut(auth)}>
						Sign Out
					</button>
				</div>
			</header>
			<div className="app-body">
				<aside className="sidebar">
					<ChannelList
						selectedChannel={selectedChannel}
						onSelectChannel={setSelectedChannel}
					/>
				</aside>
				<main className="main-content">
					{selectedChannel ? (
						<Chat channel={selectedChannel} />
					) : (
						<div className="no-channel-selected">
							<p>Select a channel to start chatting</p>
						</div>
					)}
				</main>
			</div>
		</div>
	);
}

export default App;
