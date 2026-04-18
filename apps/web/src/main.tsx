import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./firebase";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./contexts/AuthContext";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>,
);
