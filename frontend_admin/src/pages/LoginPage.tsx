import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Toaster, toast } from 'sonner';
import { Bike, Loader2, Mail, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Gọi API login thật
      const response = await api.post('/auth/login', { 
        email, 
        password,
        turnstileToken: 'string' // Bypass key cho local/dev
      });
      
      const { data } = response.data;
      
      if (data.role === 'ADMIN' || data.role === 'INSPECTOR') {
        login(data.token);
        toast.success(`Đăng nhập thành công với quyền ${data.role}`);
        navigate('/');
      } else {
        toast.error('Bạn không có quyền truy cập vào hệ thống này');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra kết nối backend.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-right" />
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="p-4 scale-125">
            <img 
              src="https://res.cloudinary.com/djoyj4i4f/image/upload/v1772163526/anhavatarvuong_gzeusq.png" 
              alt="Cho Xe Đạp Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>
        <h2 className="mt-8 text-center text-4xl font-black text-foreground tracking-tight">
          ChoXeDap Admin
        </h2>
        <p className="mt-3 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
          Hệ thống Quản trị & Kiểm định
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-clay rounded-[40px] border-0 mx-4 sm:mx-0">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Email đăng nhập
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-[20px] text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="admin@choxedap.app"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Mật khẩu mật mã
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-[20px] text-foreground font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 bg-primary hover:bg-primary/90 text-white text-lg font-black rounded-[20px] shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  'Truy cập hệ thống'
                )}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-tighter">Tài khoản demo</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-50">
                <p className="font-black text-blue-600 text-[10px] uppercase tracking-widest mb-1">Admin</p>
                <p className="text-xs font-bold text-blue-800">admin@choxedap.app</p>
              </div>
              <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-50">
                <p className="font-black text-amber-600 text-[10px] uppercase tracking-widest mb-1">Inspector</p>
                <p className="text-xs font-bold text-amber-800">inspector@choxedap.app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
