import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-[#2E9147]" />
            </div>
        );
    }

    if (!user) {
        // Redirect to homepage if user is not logged in
        // A better UX would be to open the login modal, but redirecting is the most standard protected route behavior
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
