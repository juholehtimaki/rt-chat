import type { ReactNode } from "react";

type AppLayoutProps = {
	sidebar: ReactNode;
	children: ReactNode;
};

export const AppLayout = ({ sidebar, children }: AppLayoutProps) => {
	return (
		<div className="flex flex-1 overflow-hidden">
			<aside className="w-64 border-r">{sidebar}</aside>
			<main className="flex-1 overflow-hidden">{children}</main>
		</div>
	);
};
