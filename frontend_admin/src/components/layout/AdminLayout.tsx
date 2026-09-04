import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Search, 
  LogOut, 
  User,
  Menu,
  X,
  Users,
  Banknote,
  Settings,
  ShieldAlert,
  FileCode,
  BarChart3,
  CreditCard,
  Zap,
  RefreshCcw,
  Wrench
} from 'lucide-react';
import { cn } from '../../lib/utils';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  console.log('AdminLayout: Current user is', user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rawNavItems = [
    {
      title: 'Tổng quan',
      path: '/',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'INSPECTOR']
    },
    {
      title: 'Thống kê',
      path: '/admin/analytics',
      icon: BarChart3,
      roles: ['ADMIN']
    },
    {
      title: 'Quản lý tin đăng',
      path: '/admin/postings',
      icon: ClipboardList,
      roles: ['ADMIN']
    },
    {
      title: 'Người dùng',
      path: '/admin/users',
      icon: Users,
      roles: ['ADMIN']
    },
    {
      title: 'Đối soát',
      path: '/admin/reconciliation',
      icon: RefreshCcw,
      roles: ['ADMIN']
    },
    {
      title: 'Tất toán',
      path: '/admin/orders',
      icon: Banknote,
      roles: ['ADMIN']
    },
    {
      title: 'Giao dịch',
      path: '/admin/transactions',
      icon: CreditCard,
      roles: ['ADMIN']
    },
    {
      title: 'Phí dịch vụ',
      path: '/admin/service-fees',
      icon: Zap,
      roles: ['ADMIN']
    },
    {
      title: 'Báo cáo',
      path: '/admin/reports',
      icon: ShieldAlert,
      roles: ['ADMIN']
    },
    {
      title: 'Metadata',
      path: '/admin/metadata',
      icon: Settings,
      roles: ['ADMIN']
    },
    {
      title: 'Kiểm định',
      path: '/inspector/requests',
      icon: Search,
      roles: ['INSPECTOR']
    }
  ];

  const navItems = rawNavItems.filter(item => {
    if (!user || !user.role) return false;
    // So sánh role (case-insensitive để an toàn)
    const currentRole = user.role.toUpperCase();
    return item.roles.some(r => r.toUpperCase() === currentRole);
  });

  const isInspector = user?.role?.toUpperCase() === 'INSPECTOR';

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar - Hidden for Inspectors */}
      {!isInspector && (
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r-0 shadow-clay m-4 rounded-[32px] transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-20 px-8 shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/djoyj4i4f/image/upload/v1772163526/anhavatarvuong_gzeusq.png" 
                alt="Cho Xe Đạp Logo" 
                className="h-12 w-auto object-contain"
              />
              <span className="text-xl font-black text-foreground">ChoXeDap</span>
            </Link>
            <button className="lg:hidden p-2 hover:bg-gray-50 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items - Scrollable */}
          <nav className="flex-1 px-4 py-2 space-y-1.5 mt-2 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-200 group w-full min-h-[56px]",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                  )}
                >
                  <item.icon 
                    size={22} 
                    className={cn("shrink-0 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} 
                  />
                  <span className={cn(
                    "font-bold tracking-tight truncate transition-colors",
                    isActive ? "text-white" : "text-gray-600 group-hover:text-primary"
                  )}>
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer - Logout */}
          <div className="p-4 shrink-0 border-t border-gray-50 mt-auto">
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 px-5 py-4 w-full text-left text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-95 group"
            >
              <LogOut size={22} className="shrink-0 transition-transform group-hover:-translate-x-1" />
              <span className="font-black uppercase text-[11px] tracking-widest">Đăng xuất hệ thống</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between h-20 px-8 bg-transparent shrink-0">
          {!isInspector && (
            <button className="lg:hidden p-2 bg-white rounded-xl shadow-clay" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          )}
          
          {isInspector && (
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://res.cloudinary.com/djoyj4i4f/image/upload/v1772163526/anhavatarvuong_gzeusq.png" 
                alt="Cho Xe Đạp Logo" 
                className="h-10 w-auto object-contain"
              />
              <span className="text-lg font-black text-foreground">ChoXeDap Inspector</span>
            </Link>
          )}

          <div className="ml-auto flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-foreground">{user?.email}</p>
              <p className="text-xs font-semibold text-primary uppercase tracking-wider">{user?.role}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-clay flex items-center justify-center border-2 border-white">
                <User size={24} className="text-primary" />
              </div>

              {isInspector && (
                <button 
                  onClick={handleLogout}
                  className="p-3 bg-white text-red-500 hover:bg-red-50 rounded-2xl shadow-clay transition-all active:scale-95 group"
                  title="Đăng xuất"
                >
                  <LogOut size={22} className="transition-transform group-hover:-translate-x-1" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className={cn(
          "flex-1 overflow-x-hidden overflow-y-auto p-8 pt-2",
          isInspector && "px-4 md:px-12 lg:px-24" // Center content more for inspectors since no sidebar
        )}>
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
