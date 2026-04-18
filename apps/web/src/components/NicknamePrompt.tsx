import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { type SyntheticEvent, useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";

export const NicknamePrompt = () => {
	const { user, refreshProfile } = useAuthStore();
	const [nickname, setNickname] = useState("");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!nickname.trim() || !user) return;

		setSaving(true);
		setError(null);

		try {
			await setDoc(doc(db, "users", user.uid), {
				nickname: nickname.trim(),
				email: user.email,
				createdAt: serverTimestamp(),
			});
			await refreshProfile();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="nickname-prompt">
			<h2>Choose a nickname</h2>
			<p>This will be displayed to other users in chat</p>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="Enter nickname"
					value={nickname}
					onChange={(e) => setNickname(e.target.value)}
					disabled={saving}
					minLength={2}
					maxLength={20}
					required
				/>
				{error && <p className="error">{error}</p>}
				<button type="submit" disabled={saving || !nickname.trim()}>
					{saving ? "Saving..." : "Continue"}
				</button>
			</form>
		</div>
	);
};
