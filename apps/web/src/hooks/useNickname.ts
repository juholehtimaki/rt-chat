import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";

export const useNickname = () => {
	const { user, refreshProfile } = useAuthStore();
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const saveNickname = async (nickname: string) => {
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

	return { saving, error, saveNickname };
};
