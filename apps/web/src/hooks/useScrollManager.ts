import { useCallback, useLayoutEffect, useRef, useState } from "react";

type UseScrollManagerOptions = {
	scrollAreaRef: React.RefObject<HTMLDivElement | null>;
};

export const useScrollManager = ({
	scrollAreaRef,
}: UseScrollManagerOptions) => {
	const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
	const [shouldPreserveScroll, setShouldPreserveScroll] = useState(false);
	const prevScrollHeightRef = useRef<number>(0);

	useLayoutEffect(() => {
		if (shouldScrollToBottom && scrollAreaRef.current) {
			scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
			setShouldScrollToBottom(false);
		}
	}, [shouldScrollToBottom, scrollAreaRef]);

	useLayoutEffect(() => {
		if (shouldPreserveScroll && scrollAreaRef.current) {
			const newScrollHeight = scrollAreaRef.current.scrollHeight;
			scrollAreaRef.current.scrollTop =
				newScrollHeight - prevScrollHeightRef.current;
			setShouldPreserveScroll(false);
		}
	}, [shouldPreserveScroll, scrollAreaRef]);

	const scrollToBottom = useCallback(() => setShouldScrollToBottom(true), []);

	const saveScrollHeight = useCallback(() => {
		prevScrollHeightRef.current = scrollAreaRef.current?.scrollHeight ?? 0;
	}, [scrollAreaRef]);

	const preserveScroll = useCallback(() => {
		setShouldPreserveScroll(true);
	}, []);

	return { scrollToBottom, preserveScroll, saveScrollHeight };
};
