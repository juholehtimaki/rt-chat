import { toast } from "@workspace/ui/components/sonner";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";

export const useNickname = () => {
	const { user, getProfile: refreshProfile } = useAuthStore();
	const [saving, setSaving] = useState(false);

	const saveNickname = async (nickname: string) => {
		if (!nickname.trim() || !user) return;

		setSaving(true);

		try {
			await setDoc(doc(db, "users", user.uid), {
				nickname: nickname.trim(),
				email: user.email,
				createdAt: serverTimestamp(),
			});
			await refreshProfile();
			toast.success("Nickname updated");
		} catch (err) {
			console.error("Failed to update nickname", err);
			toast.error("Failed to update nickname");
		} finally {
			setSaving(false);
		}
	};

	return { saving, saveNickname };
};
