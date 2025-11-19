import { getApps, initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, off, remove } from "firebase/database";

export default defineNuxtPlugin(() => {
    try {
        const { public: config } = useRuntimeConfig();

        // Kiểm tra config đầy đủ
        if (!config.firebaseApiKey || !config.firebaseDatabaseURL) {
            throw new Error("Firebase config không đầy đủ");
        }

        const firebaseConfig = {
            apiKey: config.firebaseApiKey,
            authDomain: config.firebaseAuthDomain,
            databaseURL: config.firebaseDatabaseURL,
            projectId: config.firebaseProjectId,
            storageBucket: config.firebaseStorageBucket,
            messagingSenderId: config.firebaseMessagingSenderId,
            appId: config.firebaseAppId
        };

        let app = getApps()[0];
        if (!app) {
            app = initializeApp(firebaseConfig);
        }

        const db = getDatabase(app);

        return {
            provide: {
                firebase: {
                    db,
                    ref,
                    set,
                    onValue,
                    off,
                    remove,
                }
            }
        };
    } catch (error) {
        console.error("Firebase plugin error:", error);
        throw error;
    }
});