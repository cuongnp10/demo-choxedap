import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Body } from "./Body";
import { Hero } from "../../components/Hero";
import { SearchBar } from "./SearchBar";
import { bikeApi } from "../../lib/api";
import { Helmet } from "react-helmet-async";
import type { BikeProduct } from "../../types/bike";
import "./style.css";

export const Home = (): React.JSX.Element => {
  const navigate = useNavigate();
  
  const [prominentBikes, setProminentBikes] = useState<BikeProduct[]>([]);
  const [certifiedBikes, setCertifiedBikes] = useState<BikeProduct[]>([]);
  const [outstandingBikes, setOutstandingBikes] = useState<BikeProduct[]>([]);
  const [randomBikes, setRandomBikes] = useState<BikeProduct[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const [featured, certified, allResult] = await Promise.all([
          bikeApi.getFeaturedBikes(),
          bikeApi.getCertifiedBikes(),
          bikeApi.getProducts()
        ]);
        
        const all = allResult.items;
        
        // 4. Xe đạp Nổi trội (Prominent): Chỉ hiển thị xe có tag NỔI TRỘI.
        const prominentOnly = featured.filter(b => b.vipTier === 'NOI_TROI');
        setProminentBikes(prominentOnly.slice(0, 5));
        
        // 6. Xe đạp đã kiểm định (Certified)
        setCertifiedBikes(certified);
        
        // 8. Xe đạp Nổi bật (Outstanding): Ưu tiên xe có tag NỔI BẬT.
        const outstandingOnly = featured.filter(b => b.vipTier === 'NOI_BAT');
        if (outstandingOnly.length > 0) {
          setOutstandingBikes(outstandingOnly.slice(0, 5));
        } else {
          // Fallback: nếu không có NỔI BẬT thì lấy các xe featured còn lại (không phải NỔI TRỘI đã hiện ở trên)
          const remainingFeatured = featured.filter(b => b.vipTier !== 'NOI_TROI');
          if (remainingFeatured.length > 0) {
            setOutstandingBikes(remainingFeatured.slice(0, 5));
          } else {
            setOutstandingBikes(all.slice(0, 5));
          }
        }
        
        // 9. Sản phẩm khác (Random Products)
        const shuffled = [...all].sort(() => 0.5 - Math.random());
        setRandomBikes(shuffled.slice(0, 10));

      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const navigateBuy = (query?: string) => {
    if (query) {
      navigate(`/buy?q=${encodeURIComponent(query)}`);
    } else {
      navigate("/buy");
    }
  };

  return (
    <div className="home-container">
      <Helmet>
        <title>Trang chủ</title>
      </Helmet>
      {/* 2. Hero Section */}
      <Hero />
      
      {/* 3. Search Bar */}
      <SearchBar onSearch={navigateBuy} />
      
      <Body 
        prominentBikes={prominentBikes}
        certifiedBikes={certifiedBikes}
        outstandingBikes={outstandingBikes}
        randomBikes={randomBikes}
        isLoading={isLoading}
        onBikeClick={(bike) => navigate(`/listing/${bike.id}`)}
      />
    </div>
  );
};
