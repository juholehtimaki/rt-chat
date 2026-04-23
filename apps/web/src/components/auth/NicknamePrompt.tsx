import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { type SyntheticEvent, useState } from "react";
import { useNickname } from "../../hooks/useNickname";

export const NicknamePrompt = () => {
	const [nickname, setNickname] = useState("");
	const { saving, error, saveNickname } = useNickname();

	const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		await saveNickname(nickname);
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
