import React from "react";
import { Check } from "lucide-react";

type Step = {
    id: number;
    name: string;
};

const steps: Step[] = [
    { id: 1, name: "Thông tin & Hình ảnh" },
    { id: 2, name: "Xem lại & AI Review" },
    { id: 3, name: "Gói dịch vụ & Đẩy tin" },
    { id: 4, name: "Thanh toán" },
];

export function SellToolbar({ currentStep = 1 }: { currentStep?: number }) {
    return (
        <div className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 flex flex-col items-center py-4 px-4 md:px-8">
            <div className="w-full max-w-[1440px] flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Title */}
                <div className="flex flex-col">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">Đăng tin bán xe</h1>
                    <p className="text-gray-500 text-sm hidden md:block">Chia sẻ niềm đam mê xe đạp của bạn</p>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 scrollbar-none w-full md:w-auto">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.id}>
                            <div className="flex items-center gap-2 shrink-0">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${currentStep > step.id
                                            ? "bg-[#2E9147] text-white"
                                            : currentStep === step.id
                                                ? "bg-[#2E9147] text-white ring-4 ring-green-100"
                                                : "bg-gray-100 text-gray-400"
                                        }`}
                                >
                                    {currentStep > step.id ? <Check size={16} /> : step.id}
                                </div>
                                <span
                                    className={`text-sm font-medium whitespace-nowrap
                    ${currentStep >= step.id ? "text-gray-900" : "text-gray-400"}
                  `}
                                >
                                    {step.name}
                                </span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="w-6 md:w-10 h-[2px] bg-gray-100 shrink-0" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
