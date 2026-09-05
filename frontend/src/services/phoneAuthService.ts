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
        console.log("[DEV] Skip Recaptcha initialization for demo");
        return;
    }

    static async sendOtp(phoneNumber: string): Promise<boolean> {
        console.log("[DEV] Bypass Firebase OTP for demo:", phoneNumber);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return true;
    }

    static async verifyOtp(otpCode: string): Promise<string | null> {
        if (otpCode === "123456" || otpCode.length > 0) {
            console.log("[DEV] Bypass Success with code", otpCode);
            return "MOCK_FIREBASE_TOKEN_LOCAL_BYPASS";
        } else {
            throw new Error("Vui lòng nhập mã OTP (nhập gì cũng được cho bản Demo)");
        }
    }
}
