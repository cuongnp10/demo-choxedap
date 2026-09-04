import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

export function KycProtectedRoute() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-[#2E9147]" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    const isKycComplete = user.kycStatus === "VERIFIED";

    if (!isKycComplete) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500">
                        <ShieldAlert size={48} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Xác thực hồ sơ (KYC)</h2>
                    <p className="text-gray-600 mb-8">
                        Để đảm bảo an toàn giao dịch trên sàn, bạn cần hoàn thiện hồ sơ (Xác thực SĐT, Cập nhật địa chỉ và Thông tin ngân hàng) trước khi đăng tin bán xe.
                    </p>
                    
                    <div className="space-y-4 mb-10 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${user.phoneVerified ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {user.phoneVerified ? "✓" : "1"}
                            </div>
                            <span className={user.phoneVerified ? "text-green-700 font-medium" : "text-gray-500"}>Xác thực số điện thoại</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${user.address ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {user.address ? "✓" : "2"}
                            </div>
                            <span className={user.address ? "text-green-700 font-medium" : "text-gray-500"}>Cập nhật địa chỉ lấy hàng</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${(user.bankAccountNumber && user.bankName && user.bankAccountHolderName) ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                {(user.bankAccountNumber && user.bankName && user.bankAccountHolderName) ? "✓" : "3"}
                            </div>
                            <span className={(user.bankAccountNumber && user.bankName && user.bankAccountHolderName) ? "text-green-700 font-medium" : "text-gray-500"}>Cung cấp thông tin ngân hàng (Số TK, Tên NH, Chủ TK)</span>
                        </div>
                    </div>

                    <Button asChild className="w-full h-14 rounded-2xl bg-[#2E9147] hover:bg-[#257a3b] text-lg font-bold shadow-lg shadow-green-100">
                        <Link to="/account/profile">Hoàn thiện hồ sơ ngay</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
