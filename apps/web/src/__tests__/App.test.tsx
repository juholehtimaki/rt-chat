import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { App } from "../App";

vi.mock("../firebase", () => ({
	auth: {},
	db: {},
}));

vi.mock("../stores/authStore", () => ({
	useAuthStore: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
	onAuthStateChanged: vi.fn(),
	signOut: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
	doc: vi.fn(),
	getDoc: vi.fn(),
	collection: vi.fn(),
	query: vi.fn(),
	orderBy: vi.fn(),
	onSnapshot: vi.fn(() => vi.fn()),
	addDoc: vi.fn(),
	serverTimestamp: vi.fn(),
}));

import { useAuthStore } from "../stores/authStore";

describe("App", () => {
	it("renders loading state initially", () => {
		vi.mocked(useAuthStore).mockReturnValue({
			user: null,
			profile: null,
			loading: true,
			setUser: vi.fn(),
			setProfile: vi.fn(),
			setLoading: vi.fn(),
			getProfile: vi.fn(),
		});

		render(<App />);
		expect(screen.getByText("Loading...")).toBeInTheDocument();
	});

	it("renders login when user is not authenticated", () => {
		vi.mocked(useAuthStore).mockReturnValue({
			user: null,
			profile: null,
			loading: false,
			setUser: vi.fn(),
			setProfile: vi.fn(),
			setLoading: vi.fn(),
			getProfile: vi.fn(),
		});

		render(<App />);
		expect(screen.getByText("Welcome Back")).toBeInTheDocument();
	});

	it("renders nickname prompt when user has no profile", () => {
		vi.mocked(useAuthStore).mockReturnValue({
			user: { uid: "123", email: "test@test.com" } as never,
			profile: null,
			loading: false,
			setUser: vi.fn(),
			setProfile: vi.fn(),
			setLoading: vi.fn(),
			getProfile: vi.fn(),
		});

		render(<App />);
		expect(screen.getByText("Choose a nickname")).toBeInTheDocument();
	});

	it("renders main chat interface when user is authenticated with profile", () => {
		vi.mocked(useAuthStore).mockReturnValue({
			user: { uid: "123", email: "test@test.com" } as never,
			profile: {
				id: "123",
				nickname: "TestUser",
				email: "test@test.com",
			} as never,
			loading: false,
			setUser: vi.fn(),
			setProfile: vi.fn(),
			setLoading: vi.fn(),
			getProfile: vi.fn(),
		});

		render(<App />);
		expect(screen.getByText("RT Chat")).toBeInTheDocument();
		expect(screen.getByText("TestUser")).toBeInTheDocument();
	});
});
