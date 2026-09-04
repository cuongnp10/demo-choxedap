import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Cấu hình Firebase của Chợ Xe Đạp
const firebaseConfig = {
  apiKey: "AIzaSyARURcfL_t5LuZd-4f_perhFahKCjI7GyY",
  authDomain: "cho-xe-dap-3aac2.firebaseapp.com",
  projectId: "cho-xe-dap-3aac2",
  storageBucket: "cho-xe-dap-3aac2.firebasestorage.app",
  messagingSenderId: "1034592227642",
  appId: "1:1034592227642:web:e525c2a9f15d29a8478003",
  measurementId: "G-04MKSTF5QF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Kích hoạt chế độ Debug cho App Check nếu ở localhost
/*
if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}
// Initialize App Check (Yêu cầu cho SDK v11 và reCAPTCHA Enterprise)
if (typeof window !== "undefined") {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
    console.log("[Firebase] Target reCAPTCHA Site Key:", siteKey);

    if (siteKey) {
        try {
            initializeAppCheck(app, {
                provider: new ReCaptchaEnterpriseProvider(siteKey),
                isTokenAutoRefreshEnabled: true
            });
            console.log("[Firebase] App Check initialized with provider.");
        } catch (err) {
            console.error("[Firebase] App Check initialization failed:", err);
        }
    } else {
        console.warn("[Firebase] App Check skipped: VITE_RECAPTCHA_SITE_KEY not found.");
    }
}
*/

// Initialize Auth
export const auth = getAuth(app);
auth.languageCode = 'vi';

export const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;
