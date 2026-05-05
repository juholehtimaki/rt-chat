import { toast } from "@workspace/ui/components/sonner";
import {
	addDoc,
	collection,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";
import type { Channel } from "../types";

export const useChannels = () => {
	const user = useAuthStore((state) => state.user);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [loading, setLoading] = useState(true);
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		const q = query(collection(db, "channels"), orderBy("createdAt", "desc"));
		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const channelsData = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as Channel[];
				setChannels(channelsData);
				setLoading(false);
			},
			(err) => {
				console.error("Failed to listen to channels", err);
				toast.error("Failed to load channels");
				setLoading(false);
			},
		);
		return unsubscribe;
	}, []);

	const createChannel = useCallback(
		async (name: string) => {
			if (!name || !user) return;

			setCreating(true);
			try {
				await addDoc(collection(db, "channels"), {
					name,
					createdAt: serverTimestamp(),
					createdBy: user.uid,
				});
				toast.success(`Channel #${name} created`);
			} catch (err) {
				console.error("Failed to create channel", err);
				toast.error("Failed to create channel");
			} finally {
				setCreating(false);
			}
		},
		[user],
	);

	return { channels, loading, creating, createChannel };
};
