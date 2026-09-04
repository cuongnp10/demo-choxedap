import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import api from './lib/api';
import RoleGuard from './components/guards/RoleGuard';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import { cn } from './lib/utils';
import PostingModerationPage from './pages/admin/PostingModerationPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import OrderSettlementPage from './pages/admin/OrderSettlementPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import MetadataPage from './pages/admin/MetadataPage';
import ReportManagementPage from './pages/admin/ReportManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import TransactionsPage from './pages/admin/TransactionsPage';
import ServiceFeesPage from './pages/admin/ServiceFeesPage';
import InspectionRequestsPage from './pages/inspector/InspectionRequestsPage';
import { ClipboardList, ArrowRight, BarChart3 } from 'lucide-react';

import ReconciliationPage from './pages/admin/ReconciliationPage';

const DashboardHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats/overview');
        if (response.data.status === "Success") {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Doanh thu tháng', value: stats?.monthlyRevenue || '0', color: 'text-primary', bg: 'bg-primary/5', path: '/admin/analytics', isCurrency: true },
    { label: 'Tin chờ duyệt', value: stats?.activeListings || '0', color: 'text-blue-600', bg: 'bg-blue-50', path: '/admin/postings' },
    { label: 'Báo cáo mới', value: stats?.pendingReports || '0', color: 'text-red-600', bg: 'bg-red-50', path: '/admin/reports' },
    { label: 'Chờ quyết toán', value: stats?.pendingSettlements || '0', color: 'text-green-600', bg: 'bg-green-50', path: '/admin/orders' }
  ];

  const formatValue = (card: any) => {
    if (card.isCurrency) {
      const val = Number(card.value);
      if (val >= 1000000000) return (val / 1000000000).toFixed(1) + ' tỷ';
      if (val >= 1000000) return (val / 1000000).toFixed(1) + ' tr';
      return new Intl.NumberFormat('vi-VN').format(val);
    }
    return card.value;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[40px] shadow-clay p-12 border-0 relative overflow-hidden group">
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-foreground leading-tight tracking-tight">
            Chào mừng, <span className="text-primary">{user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-gray-500 mt-6 text-xl font-medium max-w-2xl leading-relaxed">
            Hệ thống quản trị <span className="font-bold text-primary">Chợ Xe Đạp</span> đã sẵn sàng. 
            Bạn đang truy cập với quyền <span className="px-3 py-1 bg-primary/10 rounded-lg text-primary font-black uppercase text-sm tracking-widest">{user?.role}</span>.
          </p>
          <div className="mt-10 flex gap-4">
            <button 
              onClick={() => navigate('/admin/postings')}
              className="px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
            >
              Bắt đầu làm việc
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div 
            key={i} 
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-[32px] shadow-clay p-8 border-0 group hover:scale-105 transition-all duration-300 cursor-pointer hover:ring-2 hover:ring-primary/20 flex flex-col justify-between"
          >
            <div>
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest mb-4 truncate">{stat.label}</p>
              <div className="flex items-baseline gap-1 overflow-hidden">
                <p className={cn(
                  "font-black text-foreground leading-none truncate",
                  stat.isCurrency ? "text-3xl" : "text-5xl"
                )}>
                  {formatValue(stat)}
                </p>
                {stat.isCurrency && <span className="text-xs font-bold text-gray-400">₫</span>}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white transition-colors`}>
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<RoleGuard allowedRoles={['ADMIN', 'INSPECTOR']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={
                <RoleGuard allowedRoles={['ADMIN']} fallbackPath="/inspector/requests">
                  <DashboardHome />
                </RoleGuard>
              } />
              
              {/* Admin Only */}
              <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                <Route path="/admin/postings" element={<PostingModerationPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/orders" element={<OrderSettlementPage />} />
                <Route path="/admin/orders/:id" element={<OrderDetailPage />} />
                <Route path="/admin/metadata" element={<MetadataPage />} />
                <Route path="/admin/reports" element={<ReportManagementPage />} />
                
                <Route path="/admin/analytics" element={<AnalyticsPage />} />
                <Route path="/admin/reconciliation" element={<ReconciliationPage />} />
                <Route path="/admin/transactions" element={<TransactionsPage />} />
                <Route path="/admin/service-fees" element={<ServiceFeesPage />} />
              </Route>

              {/* Inspector Only */}
              <Route element={<RoleGuard allowedRoles={['INSPECTOR']} />}>
                <Route path="/inspector/requests" element={<InspectionRequestsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
