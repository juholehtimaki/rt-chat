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
	refreshProfile: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	profile: null,
	loading: true,

	setUser: (user) => set({ user }),
	setProfile: (profile) => set({ profile }),
	setLoading: (loading) => set({ loading }),

	refreshProfile: async () => {
		const { user } = get();
		if (user) {
			const docSnap = await getDoc(doc(db, "users", user.uid));
			if (docSnap.exists()) {
				set({ profile: { id: docSnap.id, ...docSnap.data() } as UserProfile });
			} else {
				set({ profile: null });
			}
		}
	},
}));

const fetchProfile = async (uid: string) => {
	const docSnap = await getDoc(doc(db, "users", uid));
	if (docSnap.exists()) {
		useAuthStore.setState({
			profile: { id: docSnap.id, ...docSnap.data() } as UserProfile,
		});
	} else {
		useAuthStore.setState({ profile: null });
	}
};

onAuthStateChanged(auth, async (user) => {
	useAuthStore.setState({ user });
	if (user) {
		await fetchProfile(user.uid);
	} else {
		useAuthStore.setState({ profile: null });
	}
	useAuthStore.setState({ loading: false });
});
