import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

declare global {
    interface Window {
        google: any;
    }
}

export function GoogleAuth({ onSuccess }: { onSuccess?: () => void }) {
    const { signInWithGoogle } = useAuth();
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
            console.error("Google Client ID is missing in .env.local");
            return;
        }

        const initializeGoogleSignIn = () => {
            if (window.google && divRef.current) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response: any) => {
                        try {
                            await signInWithGoogle(response.credential);
                            onSuccess?.();
                        } catch (error) {
                            console.error("Google sign in failed", error);
                        }
                    },
                });

                window.google.accounts.id.renderButton(divRef.current, {
                    theme: "outline",
                    size: "large",
                    width: divRef.current.offsetWidth,
                    text: "signin_with",
                    shape: "rectangular",
                });
            }
        };

        // Check if script is already loaded
        if (window.google) {
            initializeGoogleSignIn();
        } else {
            // Wait for script to load if it hasn't yet
            const interval = setInterval(() => {
                if (window.google) {
                    initializeGoogleSignIn();
                    clearInterval(interval);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [signInWithGoogle, onSuccess]);

    return <div ref={divRef} className="w-full min-h-[40px] flex justify-center mt-4" />;
}
