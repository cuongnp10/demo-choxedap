import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchBE } from "@/lib/api";

export type User = {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    phoneNumber?: string;
    phoneVerified: boolean;
    address?: string;
    bankAccountNumber?: string;
    bankName?: string;
    bankAccountHolderName?: string;
    kycStatus?: string;
};

type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthModalOpen: boolean;
    setIsAuthModalOpen: (isOpen: boolean) => void;
    login: (email: string, password: string, turnstileToken: string) => Promise<void>;
    requestOtp: (email: string, turnstileToken: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    signInWithGoogle: (credential: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const isAuthenticated = !!user;

    const refreshUser = async () => {
        try {
            const response = await fetchBE("/user/profile");
            if (response.statusCode === 200) {
                const u = response.data;
                const updatedUser: User = {
                    id: u.id.toString(),
                    name: u.fullName,
                    email: u.email,
                    role: u.role,
                    avatar: u.avatar || "https://github.com/shadcn.png",
                    phoneNumber: u.phoneNumber,
                    phoneVerified: u.phoneVerified,
                    address: u.address,
                    bankAccountNumber: u.bankAccountNumber,
                    bankName: u.bankName,
                    bankAccountHolderName: u.bankAccountHolderName,
                    kycStatus: u.kycStatus
                };
                setUser(updatedUser);
                localStorage.setItem("choxedap_user", JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Failed to refresh user", error);
        }
    };

    useEffect(() => {
        // Handle auth expired event
        const handleAuthExpired = () => {
            setUser(null);
            setIsLoading(false);
        };
        window.addEventListener("auth-expired", handleAuthExpired);

        // Check for existing session
        const initAuth = async () => {
            try {
                const savedUser = localStorage.getItem("choxedap_user");
                const token = localStorage.getItem("choxedap_token");
                if (savedUser && token) {
                    setUser(JSON.parse(savedUser));
                    console.log("[DEV] Auth token (existing session):", token);
                    // Optional: refresh user data from BE to ensure consistency
                    await refreshUser();
                }
            } catch (error) {
                console.error("Failed to parse saved user", error);
                localStorage.removeItem("choxedap_user");
                localStorage.removeItem("choxedap_token");
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();

        return () => {
            window.removeEventListener("auth-expired", handleAuthExpired);
        };
    }, []);

    const login = async (email: string, password: string, turnstileToken: string) => {
        setIsLoading(true);
        const finalToken = turnstileToken || (window.location.hostname === "localhost" ? (import.meta.env.VITE_TURNSTILE_BYPASS_KEY ?? "") : "");
        try {
            const response = await fetchBE("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, turnstileToken: finalToken }),
            });

            if (response.statusCode === 200) {
                const { token, userId, fullName, email: userEmail, role, avatar, phoneNumber, phoneVerified, address, bankAccountNumber, bankName, bankAccountHolderName, kycStatus } = response.data;
                const loggedInUser: User = {
                    id: userId.toString(),
                    name: fullName,
                    email: userEmail,
                    role: role,
                    avatar: avatar || "https://github.com/shadcn.png",
                    phoneNumber,
                    phoneVerified,
                    address,
                    bankAccountNumber,
                    bankName,
                    bankAccountHolderName,
                    kycStatus
                };
                setUser(loggedInUser);
                localStorage.setItem("choxedap_user", JSON.stringify(loggedInUser));
                localStorage.setItem("choxedap_token", token);
                console.log("[DEV] Auth token (email login):", token);
            } else {
                throw new Error(response.message || "Email hoặc mật khẩu không chính xác");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const requestOtp = async (email: string, turnstileToken: string) => {
        setIsLoading(true);
        const finalToken = turnstileToken || (window.location.hostname === "localhost" ? (import.meta.env.VITE_TURNSTILE_BYPASS_KEY ?? "") : "");
        try {
            // Updated endpoint per API overview or project requirements
            const response = await fetchBE("/auth/register/request-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, turnstileToken: finalToken }),
            });

            if (response.statusCode !== 200) {
                throw new Error(response.message || "Gửi OTP thất bại");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: any) => {
        setIsLoading(true);
        try {
            const response = await fetchBE("/auth/register/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: data.fullName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    password: data.password,
                    otp: data.otp
                }),
            });

            if (response.statusCode !== 200) {
                throw new Error(response.message || "Đăng ký thất bại");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async (credential: string) => {
        setIsLoading(true);
        try {
            const response = await fetchBE("/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken: credential }),
            });

            if (response.statusCode === 200) {
                const { token, userId, fullName, email: userEmail, role, avatar, phoneNumber, phoneVerified, address, bankAccountNumber, bankName, bankAccountHolderName, kycStatus } = response.data;
                const loggedInUser: User = {
                    id: userId.toString(),
                    name: fullName,
                    email: userEmail,
                    role: role,
                    avatar: avatar || "https://github.com/shadcn.png",
                    phoneNumber,
                    phoneVerified,
                    address,
                    bankAccountNumber,
                    bankName,
                    bankAccountHolderName,
                    kycStatus
                };
                setUser(loggedInUser);
                localStorage.setItem("choxedap_user", JSON.stringify(loggedInUser));
                localStorage.setItem("choxedap_token", token);
                console.log("[DEV] Auth token (Google login):", token);
            } else {
                throw new Error(response.message || "Đăng nhập Google thất bại");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("choxedap_user");
        localStorage.removeItem("choxedap_token");
        localStorage.removeItem("favoriteBikes");
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            isAuthenticated, 
            isLoading, 
            isAuthModalOpen,
            setIsAuthModalOpen,
            login, 
            requestOtp, 
            register, 
            signInWithGoogle, 
            logout, 
            refreshUser 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
