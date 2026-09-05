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

    const handleMockLogin = async () => {
        try {
            await signInWithGoogle("MOCK_GOOGLE_CREDENTIAL_DEMO");
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Google sign in failed", error);
        }
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={handleMockLogin}
                className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2.5 px-4 bg-white hover:bg-gray-50 transition-colors shadow-sm"
            >
                <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google" 
                    className="w-5 h-5"
                />
                <span className="text-sm font-medium text-gray-700">Tiếp tục với Google (Demo)</span>
            </button>
        </div>
    );
}
