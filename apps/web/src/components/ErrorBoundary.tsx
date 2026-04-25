import { Button } from "@workspace/ui/components/button";
import type { ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

const ErrorFallback = () => (
	<div className="flex h-screen flex-col items-center justify-center gap-4 p-8">
		<h1 className="text-xl font-semibold">Something went wrong</h1>
		<p className="text-sm text-muted-foreground">
			An unexpected error occurred. Please refresh to try again.
		</p>
		<Button onClick={() => window.location.reload()}>Refresh page</Button>
	</div>
);

export const ErrorBoundary = ({ children }: { children: ReactNode }) => (
	<ReactErrorBoundary FallbackComponent={ErrorFallback}>
		{children}
	</ReactErrorBoundary>
);
