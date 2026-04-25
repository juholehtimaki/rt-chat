import { toast } from "@workspace/ui/components/sonner";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { auth, db } from "../firebase";
import type { UserProfile } from "../types";

type AuthState = {
	user: User | null;
	profile: UserProfile | null;
	loading: boolean;
	setUser: (user: User | null) => void;
	setProfile: (profile: UserProfile | null) => void;
	setLoading: (loading: boolean) => void;
	getProfile: () => Promise<void>;
};

const getProfile = async (uid: string) => {
	try {
		const docSnap = await getDoc(doc(db, "users", uid));
		if (docSnap.exists()) {
			useAuthStore.setState({
				profile: { id: docSnap.id, ...docSnap.data() } as UserProfile,
			});
		} else {
			useAuthStore.setState({ profile: null });
		}
	} catch (err) {
		console.error("Failed to fetch profile", err);
		toast.error("Failed to load profile");
	}
};

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	profile: null,
	loading: true,

	setUser: (user) => set({ user }),
	setProfile: (profile) => set({ profile }),
	setLoading: (loading) => set({ loading }),

	getProfile: async () => {
		const { user } = get();
		if (user) {
			await getProfile(user.uid);
		}
	},
}));

onAuthStateChanged(auth, async (user) => {
	if (user) {
		useAuthStore.setState({ user, loading: true });
		await getProfile(user.uid);
	} else {
		useAuthStore.setState({ user, profile: null });
	}
	useAuthStore.setState({ loading: false });
});
