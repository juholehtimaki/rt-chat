import { Toaster } from "@workspace/ui/components/sonner";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import "./firebase";
import "./index.css";
import "./stores/authStore";

createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<App />
		<Toaster richColors />
	</StrictMode>,
);
