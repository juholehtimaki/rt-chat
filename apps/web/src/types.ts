import type { Timestamp } from "firebase/firestore";

export type Channel = {
	id: string;
	name: string;
	createdAt: Timestamp;
	createdBy: string;
};

export type Message = {
	id: string;
	text: string;
	userId: string;
	userNickname: string;
	createdAt: Timestamp;
	channelId: string;
};

export type UserProfile = {
	id: string;
	nickname: string;
	email: string;
	createdAt: Timestamp;
};
