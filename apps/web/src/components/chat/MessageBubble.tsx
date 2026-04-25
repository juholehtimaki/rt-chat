import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { toast } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Message } from "@/types";
import { getInitial } from "@/utils/getInitial";

type MessageBubbleProps = {
	message: Message;
	isOwn: boolean;
	onDelete: () => Promise<void>;
	onEdit: (newText: string) => Promise<void>;
};

export const MessageBubble = ({
	message,
	isOwn,
	onDelete,
	onEdit,
}: MessageBubbleProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editText, setEditText] = useState(message.text);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await onDelete();
		} catch (err) {
			console.error("Failed to delete message", err);
			toast.error("Failed to delete message");
		} finally {
			setIsDeleting(false);
		}
	};

	const handleSaveEdit = async () => {
		if (!editText.trim() || editText.trim() === message.text) {
			setIsEditing(false);
			setEditText(message.text);
			return;
		}

		setIsSaving(true);
		try {
			await onEdit(editText.trim());
			setIsEditing(false);
		} catch (err) {
			console.error("Failed to edit message", err);
			toast.error("Failed to edit message");
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancelEdit = () => {
		setIsEditing(false);
		setEditText(message.text);
	};

	return (
		<article
			className={cn(
				"group flex max-w-[75%] flex-col",
				isOwn && "ml-auto items-end",
			)}
		>
			<header
				className={cn(
					"mb-1 flex items-center gap-2",
					isOwn && "flex-row-reverse",
				)}
			>
				<Avatar className="h-7 w-7 ring-1 ring-border/50">
					<AvatarFallback className="text-xs font-medium">
						{getInitial(message.userNickname)}
					</AvatarFallback>
				</Avatar>
				<span className="text-sm font-medium">
					{message.userNickname || "Unknown"}
				</span>
				<time
					className="text-xs text-muted-foreground"
					dateTime={message.createdAt?.toDate().toISOString()}
				>
					{message.createdAt
						? message.createdAt.toDate().toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})
						: "..."}
				</time>
				{isOwn && !isEditing && (
					<div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => setIsEditing(true)}
							aria-label="Edit message"
						>
							<Pencil className="h-3 w-3" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-destructive hover:text-destructive"
							onClick={handleDelete}
							disabled={isDeleting}
							aria-label="Delete message"
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				)}
			</header>
			{isEditing ? (
				<div className="flex w-full gap-2">
					<Input
						value={editText}
						onChange={(e) => setEditText(e.target.value)}
						className="flex-1"
						autoFocus
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSaveEdit();
							} else if (e.key === "Escape") {
								handleCancelEdit();
							}
						}}
					/>
					<Button
						size="icon"
						className="h-9 w-9"
						onClick={handleSaveEdit}
						disabled={isSaving}
						aria-label="Save edit"
					>
						<Check className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9"
						onClick={handleCancelEdit}
						aria-label="Cancel edit"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			) : (
				<p
					className={cn(
						"w-fit rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
						isOwn
							? "rounded-tr-md bg-primary text-primary-foreground"
							: "rounded-tl-md bg-card text-foreground ring-1 ring-border/50",
					)}
				>
					{message.text}
				</p>
			)}
		</article>
	);
};
