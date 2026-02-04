import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

type FirebaseEnvKey =
	| 'NEXT_PUBLIC_FIREBASE_API_KEY'
	| 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
	| 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
	| 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
	| 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
	| 'NEXT_PUBLIC_FIREBASE_APP_ID'
	| 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID';

const firebaseEnv: Record<FirebaseEnvKey, string> = {
	NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
	NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
	NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
	NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
	NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
	NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
	NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? ''
};

const requiredEnvKeys: FirebaseEnvKey[] = [
	'NEXT_PUBLIC_FIREBASE_API_KEY',
	'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
	'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
	'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
	'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
	'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const firebaseConfig = {
	apiKey: firebaseEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
	authDomain: firebaseEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
	projectId: firebaseEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: firebaseEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: firebaseEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: firebaseEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
	measurementId: firebaseEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const assertFirebaseConfig = () => {
	const missing = requiredEnvKeys.filter(key => !firebaseEnv[key]);
	if (missing.length > 0) {
		throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
	}
};

export const getFirebaseApp = (): FirebaseApp => {
	assertFirebaseConfig();
	return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

export const getFirestoreDb = (): Firestore => {
	const app = getFirebaseApp();
	return getFirestore(app);
};
