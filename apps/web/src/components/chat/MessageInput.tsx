import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Separator } from "@workspace/ui/components/separator";
import { Send } from "lucide-react";
import { type SyntheticEvent, useState } from "react";

type MessageInputProps = {
	channelName: string;
	onSend: (text: string) => Promise<void>;
};

export const MessageInput = ({ channelName, onSend }: MessageInputProps) => {
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);

	const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!message.trim()) return;

		setSending(true);
		try {
			await onSend(message.trim());
			setMessage("");
		} finally {
			setSending(false);
		}
	};

	return (
		<>
			<Separator />
			<form onSubmit={handleSubmit} className="flex gap-2 p-4">
				<Input
					type="text"
					placeholder={`Message #${channelName}`}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="flex-1"
				/>
				<Button type="submit" size="icon" disabled={sending || !message.trim()}>
					<Send className="h-4 w-4" />
				</Button>
			</form>
		</>
	);
};
