import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { auth, db } from "../firebase";
import type { UserProfile } from "../types";

type AuthContextType = {
	user: User | null;
	profile: UserProfile | null;
	loading: boolean;
	refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
	user: null,
	profile: null,
	loading: true,
	refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchProfile = useCallback(async (uid: string) => {
		const docSnap = await getDoc(doc(db, "users", uid));
		if (docSnap.exists()) {
			setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
		} else {
			setProfile(null);
		}
	}, []);

	const refreshProfile = useCallback(async () => {
		if (user) {
			await fetchProfile(user.uid);
		}
	}, [user, fetchProfile]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			setUser(user);
			if (user) {
				await fetchProfile(user.uid);
			} else {
				setProfile(null);
			}
			setLoading(false);
		});
		return unsubscribe;
	}, [fetchProfile]);

	return (
		<AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
