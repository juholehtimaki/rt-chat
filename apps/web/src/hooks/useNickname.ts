import { toast } from "@workspace/ui/components/sonner";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useCallback, useState } from "react";
import { COLLECTIONS } from "../constants/firestore";
import { db } from "../firebase";
import { useAuthStore } from "../stores/authStore";

const NICKNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export const isValidNickname = (nickname: string): boolean => {
	const trimmed = nickname.trim();
	return (
		trimmed.length >= 1 && trimmed.length <= 20 && NICKNAME_REGEX.test(trimmed)
	);
};

export const useNickname = () => {
	const { user, getProfile: refreshProfile } = useAuthStore();
	const [saving, setSaving] = useState(false);

	const checkNicknameAvailable = useCallback(
		async (nickname: string): Promise<boolean> => {
			const nicknameDoc = await getDoc(
				doc(db, COLLECTIONS.NICKNAMES, nickname.toLowerCase()),
			);
			return !nicknameDoc.exists();
		},
		[],
	);

	const saveNickname = useCallback(
		async (nickname: string) => {
			const trimmedNickname = nickname.trim();
			if (!trimmedNickname || !user) return;

			setSaving(true);

			try {
				// Check if user already has a profile
				const userRef = doc(db, COLLECTIONS.USERS, user.uid);
				const userDoc = await getDoc(userRef);

				if (userDoc.exists()) {
					toast.error("Nickname cannot be changed");
					setSaving(false);
					return;
				}

				// Check if nickname is available
				const isAvailable = await checkNicknameAvailable(trimmedNickname);
				if (!isAvailable) {
					toast.error("Nickname is already taken");
					setSaving(false);
					return;
				}

				const nicknameRef = doc(
					db,
					COLLECTIONS.NICKNAMES,
					trimmedNickname.toLowerCase(),
				);

				// In proper app, we would use a transaction (batch in Firestore) here to ensure atomicity but that requires Cloud Functions which is behind payment method
				await setDoc(nicknameRef, {
					userId: user.uid,
					createdAt: serverTimestamp(),
				});

				await setDoc(userRef, {
					nickname: trimmedNickname,
					email: user.email,
					createdAt: serverTimestamp(),
				});

				await refreshProfile();
				toast.success("Nickname saved");
			} catch (err) {
				console.error("Failed to save nickname", err);
				toast.error("Failed to save nickname");
			} finally {
				setSaving(false);
			}
		},
		[user, refreshProfile, checkNicknameAvailable],
	);

	return { saving, saveNickname };
};
