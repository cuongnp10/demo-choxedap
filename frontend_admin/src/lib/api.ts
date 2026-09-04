import axios from 'axios';

export const MOCK_ADMIN_STATS = {
  totalUsers: 1500,
  totalPostings: 320,
  totalOrders: 150,
  revenue: 50000000,
  recentActivity: []
};

export const MOCK_USERS = [
  { id: 1, fullName: 'Nguyễn Văn A', email: 'a@example.com', role: 'Buyer', status: 'Active' },
  { id: 2, fullName: 'Trần Thị B', email: 'b@example.com', role: 'Seller', status: 'Active' }
];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  adapter: async (config) => {
    const path = config.url || '';
    
    console.log(`[Admin Mock API] ${config.method?.toUpperCase()} ${path}`);
    
    let responseData = {};
    if (path.includes('/admin/stats/overview')) {
      responseData = MOCK_ADMIN_STATS;
    } else if (path.includes('/admin/users')) {
      responseData = MOCK_USERS;
    } else if (path.includes('/inspector/inspections/pending')) {
      responseData = [];
    }

    return {
      data: { data: responseData, isSuccess: true, message: "Success" },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    } as any;
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
