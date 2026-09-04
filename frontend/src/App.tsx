import { useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, useSearchParams, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { BuyPage } from "./pages/Buy";
import { SellPage } from "./pages/Sell";
import { PricingServiceFees } from "./pages/PricingServiceFees";
import { SellReview } from "./pages/SellReview";
import { Home } from "./pages/Home";
import ListingDetail from "./pages/ListingDetail/[id]";
import { CheckoutPage } from "./pages/CheckoutPage";
import ListingPreview from "./pages/ListingPreview";
import { PaymentSuccess } from "./pages/PaymentSuccess";
import { PaymentError } from "./pages/PaymentError";
import { PaymentCancel } from "./pages/PaymentCancel";
import { PageProfile } from "./pages/PageProfile";
import { OrderDetail } from "./pages/OrderDetail";
import { OrderReport } from "./pages/OrderReport";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ChatContainer } from "./components/Chat/ChatContainer";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";
import { TermsOfService } from "./pages/TermsOfService";
import { NotificationPage } from "./pages/NotificationPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { KycProtectedRoute } from "./components/KycProtectedRoute";
import { Toaster } from "sonner";
import { HelmetProvider, Helmet } from 'react-helmet-async';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const navigateHome = () => navigate("/");
  const navigateBuy = (query?: string) => {
    if (query) {
      navigate(`/buy?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/buy");
    }
  };
  const navigateSell = () => navigate("/sell");
  const navigateMembership = () => navigate("/account/seller/membership");

  return (
    <HelmetProvider>
      <Helmet titleTemplate="%s | Chợ Xe Đạp" defaultTitle="Chợ Xe Đạp | Hệ thống mua bán xe đạp tin cậy">
        <meta name="description" content="Chợ Xe Đạp - Nơi mua bán xe đạp thể thao, xe đạp cũ mới uy tín hàng đầu." />
      </Helmet>
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <div className="min-h-screen bg-white font-['Inter',sans-serif]">
            <Toaster position="top-right" closeButton />
            <ScrollToTop />
            <Navbar
              onLogoClick={navigateHome}
              onBuyClick={() => navigateBuy()}
              onSellClick={navigateSell}
              onMembershipClick={navigateMembership}
              onFavoritesClick={() => navigate("/account/buyer/favorites")}
            />

            <main className="flex flex-col items-center">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/buy"
                  element={
                    <BuyPage
                      initialQuery={searchParams.get("q") || ""}
                      onSearch={navigateBuy}
                    />
                  }
                />
                <Route path="/listing/:id" element={<ListingDetail />} />
                <Route path="/listing/preview" element={<ListingPreview />} />
                <Route element={<ProtectedRoute />}>
                  <Route element={<KycProtectedRoute />}>
                      <Route path="/sell" element={<SellPage />} />
                      <Route path="/sell/pricing" element={<PricingServiceFees />} />
                      <Route path="/sell/review" element={<SellReview />} />
                  </Route>
                  <Route path="/account" element={<Navigate to="/account/profile" />} />
                  <Route path="/account/profile" element={<PageProfile />} />
                  <Route path="/account/buyer" element={<Navigate to="/account/buyer/history" replace />} />
                  <Route path="/account/buyer/order/:id" element={<OrderDetail />} />
                  <Route path="/account/buyer/report/:id" element={<OrderReport />} />
                  <Route path="/account/buyer/report/listing/:id" element={<OrderReport />} />
                  <Route path="/account/buyer/:tab" element={<PageProfile />} />
                  <Route path="/account/buyer/notifications" element={<NotificationPage />} />
                  <Route path="/account/seller" element={<Navigate to="/account/seller/overview" replace />} />
                  <Route path="/account/seller/:tab" element={<PageProfile />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/payment/error" element={<PaymentError />} />
                  <Route path="/payment/cancel" element={<PaymentCancel />} />
                </Route>
                <Route path="/user/:userId" element={<PublicProfilePage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
              </Routes>
            </main>

            <Footer />
            <ChatContainer />
          </div>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  </HelmetProvider>
);
}
