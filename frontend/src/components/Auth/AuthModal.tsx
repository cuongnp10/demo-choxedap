import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { GoogleAuth } from "./GoogleAuth";

type AuthModalProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: "login" | "register";
};

export function AuthModal({ isOpen, onOpenChange, defaultTab = "login" }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
    const [prefilledEmail, setPrefilledEmail] = useState("");

    const handleRegistrationSuccess = (email: string) => {
        setPrefilledEmail(email);
        setActiveTab("login");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            onOpenChange(open);
            if (!open) {
                // Reset when closed
                setTimeout(() => {
                    setActiveTab(defaultTab);
                    setPrefilledEmail("");
                }, 300);
            }
        }}>
            <DialogContent className="sm:max-w-[425px] rounded-2xl overflow-hidden p-0 border-none shadow-2xl">
                <div className="bg-white p-6 pt-10">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-center text-gray-900">
                            Chào mừng đến với Chợ Xe Đạp
                        </DialogTitle>
                        <DialogDescription className="text-center text-gray-500">
                            Vui lòng đăng nhập hoặc tạo tài khoản để tiếp tục
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-xl">
                            <TabsTrigger
                                value="login"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                            >
                                Đăng nhập
                            </TabsTrigger>
                            <TabsTrigger
                                value="register"
                                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all"
                            >
                                Đăng ký
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="login">
                            <LoginForm 
                                initialEmail={prefilledEmail}
                                onSuccess={() => onOpenChange(false)} 
                            />
                        </TabsContent>
                        <TabsContent value="register">
                            <RegisterForm onSuccess={handleRegistrationSuccess} />
                        </TabsContent>
                    </Tabs>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">Hoặc tiếp tục với</span>
                        </div>
                    </div>

                    <GoogleAuth onSuccess={() => onOpenChange(false)} />

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Bằng cách tiếp tục, bạn đồng ý với{" "}
                        <a href="/terms" className="text-[#2e9147] hover:underline font-medium">
                            Điều khoản & Chính sách
                        </a>{" "}
                        của chúng tôi.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
