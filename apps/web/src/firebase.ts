import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
	apiKey: "AIzaSyCWzSChVlI3j2a6BtMgYIaRANc50i_PfaI",
	authDomain: "rt-chat-2818d.firebaseapp.com",
	projectId: "rt-chat-2818d",
	storageBucket: "rt-chat-2818d.firebasestorage.app",
	messagingSenderId: "707244161314",
	appId: "1:707244161314:web:859efb286e88a533e04d7b",
	measurementId: "G-MK93EJZM00",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
