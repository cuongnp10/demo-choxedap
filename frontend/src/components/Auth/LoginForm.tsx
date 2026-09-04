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
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useRef } from "react";
import { toast } from "sonner";

const loginSchema = z.object({
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({ 
    onSuccess, 
    initialEmail = "" 
}: { 
    onSuccess?: () => void;
    initialEmail?: string;
}) {
    const { login, isLoading } = useAuth();
    const [turnstileToken, setTurnstileToken] = useState<string>("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    useEffect(() => {
        if (window.location.hostname === "localhost") {
            const bypassKey = import.meta.env.VITE_TURNSTILE_BYPASS_KEY;
            if (bypassKey) setTurnstileToken(bypassKey);
        }
    }, []);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: initialEmail,
            password: "",
        },
    });

    // Sync initialEmail if it changes (e.g. after registration)
    useEffect(() => {
        if (initialEmail) {
            form.setValue("email", initialEmail);
        }
    }, [initialEmail, form]);

    async function onSubmit(data: LoginFormValues) {
        setLoginError(null);
        if (!turnstileToken) {
            toast.error("Vui lòng hoàn thành xác thực CAPTCHA");
            return;
        }

        try {
            await login(data.email, data.password, turnstileToken);
            toast.success("Đăng nhập thành công!");
            onSuccess?.();
        } catch (error: any) {
            const errorMsg = error.message || "Email hoặc mật khẩu không chính xác";
            setLoginError(errorMsg);
            turnstileRef.current?.reset();
            if (window.location.hostname !== "localhost") setTurnstileToken("");
        }
    }

    const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }: { field: any }) => (
                        <FormItem>
                            <FormLabel>Mật khẩu</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <Input 
                                        type={showPassword ? "text" : "password"} 
                                        {...field} 
                                    />
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

                <div className="flex justify-center py-2">
                    {window.location.hostname !== "localhost" && (
                        siteKey ? (
                            <Turnstile
                                ref={turnstileRef}
                                siteKey={siteKey}
                                onSuccess={(token) => setTurnstileToken(token)}
                            />
                        ) : (
                            <div className="text-red-500 text-sm text-center">
                                Turnstile Site Key is missing. Check .env.local
                            </div>
                        )
                    )}
                </div>

                {loginError && (
                    <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={16} className="shrink-0" />
                        <p>{loginError}</p>
                    </div>
                )}

                <Button type="submit" className="w-full bg-[#2e9147] hover:bg-[#257a3b]" disabled={isLoading || !turnstileToken}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Đăng nhập"}
                </Button>
            </form>
        </Form>
    );
}
