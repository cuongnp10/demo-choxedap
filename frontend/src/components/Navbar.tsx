import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../lib/assets";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/contexts/ChatContext";
import { ChatDropdown } from "./Chat/ChatDropdown";
import { AuthModal } from "./Auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, LogOut, Settings, Bike, MessageCircle, Heart, Bell } from "lucide-react";
import { NotificationDropdown } from "./Notifications/NotificationDropdown";
import { useNotifications } from "@/contexts/NotificationContext";


type NavbarProps = {
  onBuyClick?: () => void;
  onSellClick?: () => void;
  onMembershipClick?: () => void;
  onLogoClick?: () => void;
  onFavoritesClick?: () => void;
};

export function Navbar({ onBuyClick, onSellClick, onMembershipClick, onLogoClick, onFavoritesClick }: NavbarProps) {
  const navigate = useNavigate();
  const { user, logout, isAuthModalOpen, setIsAuthModalOpen } = useAuth();
  const { toggleChatDropdown, isChatDropdownOpen, closeChatDropdown, totalUnreadCount } = useChat();
  const { unreadCount, markAllAsRead } = useNotifications();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const handleToggleNotification = () => {
    if (isChatDropdownOpen) closeChatDropdown();
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleToggleChat = () => {
    if (isNotificationOpen) setIsNotificationOpen(false);
    toggleChatDropdown();
  };

  return (
    <div className="bg-white flex items-center justify-between px-5 md:px-[40px] py-2 border-b border-gray-100 shadow-sm w-full z-[100] relative shrink-0">
      <button
        type="button"
        onClick={onLogoClick}
        className="w-[80px] h-[64px] relative shrink-0"
        aria-label="Về trang chủ"
      >
        <ImageWithFallback
          src={assets.logoHeader}
          alt="Cho Xe Đạp Logo"
          className="w-full h-full object-contain"
        />
      </button>

      <div className="hidden md:flex flex-1 justify-center items-center gap-[10px] lg:gap-[20px]">
        {["Mua xe", "Bán xe", "Gói hội viên"].map((item) => (
          <nav
            key={item}
            className="flex items-center justify-center px-4 py-2 rounded-full hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => {
              if (item === "Mua xe") onBuyClick?.();
              if (item === "Bán xe") {
                if (user) {
                  onSellClick?.();
                } else {
                  setIsAuthModalOpen(true);
                }
              }
              if (item === "Gói hội viên") {
                if (user) {
                  onMembershipClick?.();
                } else {
                  setIsAuthModalOpen(true);
                }
              }
            }}
          >
            <span className="text-foreground text-sm font-semibold leading-tight whitespace-nowrap">
              {item}
            </span>
          </nav>
        ))}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {/* Favorites Icon */}
        {user && (
          <button
            onClick={onFavoritesClick}
            className="p-2 rounded-full hover:bg-100 transition-colors text-gray-600 relative group"
            aria-label="Xe yêu thích"
          >
            <Heart className="w-5 h-5" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              Xe yêu thích
            </span>
          </button>
        )}

        {user && (
          <>
            {/* Notification Icon */}
            <div className="relative">
              <button
                onClick={handleToggleNotification}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 relative group"
                aria-label="Thông báo"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Thông báo
                </span>
              </button>
              {isNotificationOpen && (
                <NotificationDropdown 
                  onClose={() => setIsNotificationOpen(false)} 
                />
              )}
            </div>

            {/* Chat Icon */}
            <div className="relative">
              <button
                onClick={handleToggleChat}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 relative group"
                aria-label="Tin nhắn"
              >
                <MessageCircle className="w-5 h-5" />
                {totalUnreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  Tin nhắn
                </span>
              </button>
              {isChatDropdownOpen && <ChatDropdown />}
            </div>
          </>
        )}

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors">
                <Avatar className="h-9 w-9 border-2 border-primary">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-primary text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col items-start pr-2">
                  <span className="text-sm font-semibold text-gray-900 leading-none">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">Thành viên</span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 rounded-xl shadow-xl border-gray-100" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer py-2.5 rounded-lg"
                onClick={() => navigate("/account")}
              >
                <User className="mr-2 h-4 w-4" />
                <span>Tài khoản</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 cursor-pointer py-2.5 rounded-lg focus:bg-red-50 focus:text-red-600"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <button
            className="bg-primary px-6 py-2.5 rounded-full w-auto lg:w-fit text-white text-sm font-bold hover:opacity-90 transition-all whitespace-nowrap shadow-md active:scale-95"
            onClick={() => setIsAuthModalOpen(true)}
          >
            Đăng nhập
          </button>
        )}
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
      />
    </div>
  );
}
