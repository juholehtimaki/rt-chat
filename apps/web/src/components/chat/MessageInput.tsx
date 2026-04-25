import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
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
		} catch (err) {
			console.error("Failed to send message", err);
			toast.error("Failed to send message");
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="border-t bg-card/50 p-4">
			<form onSubmit={handleSubmit} className="flex gap-3">
				<Input
					type="text"
					placeholder={`Message #${channelName}`}
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					className="flex-1 bg-background transition-shadow focus:shadow-sm"
				/>
				<Button
					type="submit"
					size="icon"
					disabled={sending || !message.trim()}
					aria-label="Send message"
					className="shrink-0 transition-transform hover:scale-105 active:scale-95"
				>
					<Send className="h-4 w-4" aria-hidden="true" />
				</Button>
			</form>
		</div>
	);
};
