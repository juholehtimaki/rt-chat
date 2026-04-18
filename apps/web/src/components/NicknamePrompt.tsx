import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { type SyntheticEvent, useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Choose a nickname</CardTitle>
					<CardDescription>
						This will be displayed to other users in chat
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="nickname">Nickname</Label>
							<Input
								id="nickname"
								type="text"
								placeholder="Enter nickname"
								value={nickname}
								onChange={(e) => setNickname(e.target.value)}
								disabled={saving}
								minLength={2}
								maxLength={20}
								required
							/>
						</div>

						{error && <p className="text-sm text-destructive">{error}</p>}

						<Button
							type="submit"
							className="w-full"
							disabled={saving || !nickname.trim()}
						>
							{saving ? "Saving..." : "Continue"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
