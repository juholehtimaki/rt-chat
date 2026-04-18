import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithEmailAndPassword,
	signInWithPopup,
} from "firebase/auth";
import { type SyntheticEvent, useState } from "react";
import { auth } from "../firebase";

export const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			if (isSignUp) {
				await createUserWithEmailAndPassword(auth, email, password);
			} else {
				await signInWithEmailAndPassword(auth, email, password);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		setError(null);
		setLoading(true);

		try {
			const provider = new GoogleAuthProvider();
			await signInWithPopup(auth, provider);
		} catch (err) {
			setError(err instanceof Error ? err.message : "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-container">
			<h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>

			<form onSubmit={handleSubmit}>
				<div>
					<input
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div>
					<input
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						minLength={6}
					/>
				</div>

				{error && <p className="error">{error}</p>}

				<button type="submit" disabled={loading}>
					{loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
				</button>
			</form>

			<button
				type="button"
				onClick={handleGoogleSignIn}
				disabled={loading}
				className="google-btn"
			>
				Continue with Google
			</button>

			<p>
				{isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
				<button type="button" onClick={() => setIsSignUp(!isSignUp)}>
					{isSignUp ? "Sign In" : "Sign Up"}
				</button>
			</p>
		</div>
	);
};
