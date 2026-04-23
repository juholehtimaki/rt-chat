import {
	addDoc,
	collection,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";
import type { Channel } from "../types";

export const useChannels = () => {
	const user = useAuthStore((state) => state.user);
	const [channels, setChannels] = useState<Channel[]>([]);
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		const q = query(collection(db, "channels"), orderBy("createdAt", "desc"));
		const unsubscribe = onSnapshot(q, (snapshot) => {
			const channelsData = snapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as Channel[];
			setChannels(channelsData);
		});
		return unsubscribe;
	}, []);

	const createChannel = async (name: string) => {
		if (!name || !user) return;

		setCreating(true);
		try {
			await addDoc(collection(db, "channels"), {
				name,
				createdAt: serverTimestamp(),
				createdBy: user.uid,
			});
		} finally {
			setCreating(false);
		}
	};

	return { channels, creating, createChannel };
};
