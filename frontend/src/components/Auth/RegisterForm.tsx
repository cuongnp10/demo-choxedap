import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";
import { toast } from "sonner";

// Get bypass key from env (only for dev/testing)
const BYPASS_KEY = import.meta.env.VITE_BYPASS_OTP_KEY;

const registerSchema = z.object({
    fullName: z.string().min(2, { message: "Họ tên phải có ít nhất 2 ký tự" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    phoneNumber: z.string()
        .min(10, { message: "Số điện thoại phải có ít nhất 10 số" })
        .max(15, { message: "Số điện thoại không được vượt quá 15 số" })
        .regex(/^[0-9+]+$/, { message: "Số điện thoại chỉ chứa số và dấu +" }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    confirmPassword: z.string().min(6, { message: "Mật khẩu xác nhận không khớp" }),
    otp: z.string().refine((val) => val === "" || /^[0-9]{6}$/.test(val) || (BYPASS_KEY && val === BYPASS_KEY), {
        message: "Mã OTP phải gồm 6 chữ số",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không trùng khớp",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm({ onSuccess }: { onSuccess?: (email: string) => void }) {
    const { register, requestOtp, isLoading } = useAuth();
    const [step, setStep] = useState<"request" | "verify">("request");
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState(0); 
    const [cooldown, setCooldown] = useState(0); 
    const [showPassword, setShowPassword] = useState(false);
    const turnstileRef = useRef<TurnstileInstance>(null);

    useEffect(() => {
        if (window.location.hostname === "localhost") {
            const bypassKey = import.meta.env.VITE_TURNSTILE_BYPASS_KEY;
            if (bypassKey) setTurnstileToken(bypassKey);
        }
    }, []);

    useEffect(() => {
        let interval: any;
        if (timeLeft > 0 || cooldown > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
                setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timeLeft, cooldown]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        mode: "onBlur",
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
            otp: "",
        },
    });

    const handleRequestOtp = async () => {
        if (cooldown > 0) {
            toast.error(`Vui lòng đợi ${cooldown} giây để gửi lại mã`);
            return;
        }

        const isValid = await form.trigger(["fullName", "email", "phoneNumber", "password", "confirmPassword"]);
        if (!isValid) return;

        if (!turnstileToken) {
            toast.error("Vui lòng hoàn thành xác thực CAPTCHA");
            return;
        }

        try {
            await requestOtp(form.getValues("email"), turnstileToken);
            setStep("verify");
            setTimeLeft(300);
            setCooldown(60); 
            toast.success("Mã OTP đã được gửi đến email của bạn");
        } catch (error: any) {
            toast.error(error.message || "Gửi OTP thất bại");
            turnstileRef.current?.reset();
            if (window.location.hostname !== "localhost") setTurnstileToken("");
        }
    };

    async function onSubmit(data: RegisterFormValues) {
        if (step === "request") {
            await handleRequestOtp();
            return;
        }

        if (!data.otp || (data.otp.length < 6 && data.otp !== BYPASS_KEY)) {
            form.setError("otp", { message: "Vui lòng nhập mã OTP chính xác" });
            return;
        }

        try {
            await register(data);
            toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
            onSuccess?.(data.email);
        } catch (error: any) {
            toast.error(error.message || "Đăng ký thất bại");
        }
    }

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* STEP 1: REQUEST OTP */}
                <div className={step === "request" ? "space-y-4" : "hidden"}>
                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Họ và tên</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Số điện thoại</FormLabel>
                                <FormControl><Input {...field} maxLength={15} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mật khẩu</FormLabel>
                                <div className="relative">
                                    <FormControl>
                                        <Input type={showPassword ? "text" : "password"} {...field} />
                                    </FormControl>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Xác nhận mật khẩu</FormLabel>
                                <FormControl>
                                    <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-center py-2">
                        {window.location.hostname !== "localhost" && siteKey && (
                            <Turnstile ref={turnstileRef} siteKey={siteKey} onSuccess={setTurnstileToken} />
                        )}
                    </div>

                    <Button 
                        type="button" 
                        onClick={handleRequestOtp} 
                        className="w-full bg-[#2e9147] hover:bg-[#257a3b]" 
                        disabled={isLoading || !turnstileToken || cooldown > 0}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi mã OTP"}
                    </Button>
                </div>

                {/* STEP 2: VERIFY OTP */}
                <div className={step === "verify" ? "space-y-4" : "hidden"}>
                    <div className="text-center mb-4">
                        <p className="text-sm text-muted-foreground">
                            Mã OTP đã gửi đến <strong>{form.getValues("email")}</strong>
                        </p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <Button type="button" variant="link" onClick={() => setStep("request")} className="text-xs h-auto p-0">Đổi thông tin?</Button>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs font-medium text-orange-600">Hết hạn sau: {formatTime(timeLeft)}</span>
                        </div>
                    </div>
                    <FormField
                        control={form.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Mã xác thực OTP</FormLabel>
                                <FormControl><Input {...field} maxLength={10} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {(timeLeft === 0 || cooldown === 0) && (
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleRequestOtp} 
                            className="w-full mb-2" 
                            disabled={isLoading || cooldown > 0}
                        >
                            {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã OTP"}
                        </Button>
                    )}

                    <Button type="submit" className="w-full bg-[#2e9147] hover:bg-[#257a3b]" disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Xác nhận đăng ký"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
