import { 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    type ConfirmationResult 
} from "firebase/auth";
import { auth } from "../lib/firebase";

export class PhoneAuthService {
    private static confirmationResult: ConfirmationResult | null = null;

    /**
     * Khởi tạo Recaptcha ẩn
     * @param containerId ID của element chứa recaptcha
     */
    static setupRecaptcha(containerId: string) {
        // Tắt reCAPTCHA ở local để tránh lỗi config và spam
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            console.log("[DEV] Skip Recaptcha initialization on localhost");
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`[reCAPTCHA] Container "${containerId}" not found yet.`);
            return;
        }

        // Reset instance cũ nếu đã tồn tại để tránh xung đột
        if ((window as any).recaptchaVerifier) {
            try {
                (window as any).recaptchaVerifier.clear();
            } catch (e) {
                console.warn("Error clearing old recaptcha:", e);
            }
            (window as any).recaptchaVerifier = null;
        }

        try {
            // Dọn dẹp DOM container
            container.innerHTML = ''; 

            // CÁCH SỬA CHO SDK V11: 
            // Tuyệt đối KHÔNG truyền sitekey thủ công vào đây nếu dự án đã bật Enterprise/App Check.
            // Firebase sẽ tự động lấy Site Key đúng đã cấu hình trên Console của bạn.
            const config: any = {
                'size': 'invisible',
                'callback': (response: any) => {
                    console.log("[reCAPTCHA] Verified successfully");
                },
                'expired-callback': () => {
                    console.log("[reCAPTCHA] Expired, resetting...");
                    this.setupRecaptcha(containerId);
                }
            };

            // Khởi tạo sạch, không tham số thừa
            (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, container, config);
            
            console.log("[reCAPTCHA] Initialized successfully using Firebase Default/Enterprise config.");
        } catch (error: any) {
            console.error("LỖI KHỞI TẠO RECAPTCHA:", error);
            // Fallback tối thượng: Khởi tạo tối giản
            try {
                (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, container, { 'size': 'invisible' });
                console.log("[reCAPTCHA] Fallback Success.");
            } catch (e) {
                console.error("[reCAPTCHA] Total failure:", e);
            }
        }
    }

    /**
     * Gửi mã OTP đến số điện thoại
     * @param phoneNumber Số điện thoại định dạng quốc tế (VD: +84912345678)
     */
    static async sendOtp(phoneNumber: string): Promise<boolean> {
        // Cơ chế Bypass cho Local Development
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            console.log("[DEV] Bypass Firebase OTP for:", phoneNumber);
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
        }

        if (!(window as any).recaptchaVerifier) {
            this.setupRecaptcha("recaptcha-container");
        }

        try {
            const appVerifier = (window as any).recaptchaVerifier;
            if (!appVerifier) throw new Error("Hệ thống bảo mật reCAPTCHA chưa sẵn sàng.");
            
            this.confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            return true;
        } catch (error: any) {
            console.error("Lỗi gửi OTP:", error);
            
            // Xử lý lỗi 503 hoặc chặn từ Server
            if (error.message.includes("503") || error.code === "auth/error-code:-39") {
                throw new Error("Dịch vụ SMS đang tạm thời gián đoạn hoặc chưa được kích hoạt trên GCP. Vui lòng thử lại sau hoặc liên hệ Admin.");
            }
            
            if (error.code === 'auth/invalid-app-credential' || error.code === 'auth/argument-error') {
                this.setupRecaptcha("recaptcha-container");
                throw new Error("Hệ thống bảo mật đang khởi động lại, vui lòng nhấn gửi lại.");
            }
            throw error;
        }
    }

    /**
     * Xác thực mã OTP người dùng nhập vào
     * @param otpCode Mã 6 số OTP
     */
    static async verifyOtp(otpCode: string): Promise<string | null> {
        // Cơ chế Bypass cho Local Development
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            if (otpCode === "123456") {
                console.log("[DEV] Bypass Success with code 123456");
                return "MOCK_FIREBASE_TOKEN_LOCAL_BYPASS";
            } else {
                throw new Error("Mã OTP giả định không chính xác (Dùng 123456)");
            }
        }

        if (!this.confirmationResult) {
            throw new Error("Không tìm thấy yêu cầu gửi OTP trước đó.");
        }
        
        try {
            const result = await this.confirmationResult.confirm(otpCode);
            const user = result.user;
            return await user.getIdToken();
        } catch (error) {
            console.error("Lỗi xác thực mã OTP:", error);
            throw error;
        }
    }
}
