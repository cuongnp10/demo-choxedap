import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MapPin, Calendar, Heart, ShieldCheck, Crown, Star, Award } from "lucide-react";
import { favoritesApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface BikeCardProps {
// ... existing props

  name: string;
  location: string;
  postedDate: string;
  price: string;
  id: string; // Make id required for favoriting
  isCertified?: boolean;
  vipTier?: 'NOI_TROI' | 'NOI_BAT' | 'DE_THAY' | 'THUONG';
  frameSize?: string;
  initialIsFavorite?: boolean;
  onFavoriteToggle?: (id: string, isFavorite: boolean) => void;
  onClick?: () => void;
}

export function BikeCard({
  image,
  name,
  location,
  postedDate,
  price,
  id,
  isCertified = false,
  vipTier,
  frameSize,
  initialIsFavorite,
  onFavoriteToggle,
  onClick,
}: BikeCardProps) {
  const { user, setIsAuthModalOpen } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite ?? false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // If not provided as prop, fall back to localStorage for guest compatibility or legacy support
    // But prefer explicit prop from backend
    if (initialIsFavorite === undefined) {
      const favorites = JSON.parse(localStorage.getItem('favoriteBikes') || '[]');
      setIsFavorite(favorites.includes(id));
    } else {
      setIsFavorite(initialIsFavorite);
    }
  }, [id, initialIsFavorite, user]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card onClick from firing

    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (isSyncing) return;

    // Update local storage so it persists across page reloads even without login
    const favorites = JSON.parse(localStorage.getItem('favoriteBikes') || '[]');
    const newFavoriteState = !isFavorite;

    if (newFavoriteState) {
      if (!favorites.includes(id)) {
        favorites.push(id);
        localStorage.setItem('favoriteBikes', JSON.stringify(favorites));
      }
    } else {
      const newFavorites = favorites.filter((favId: string) => favId !== id);
      localStorage.setItem('favoriteBikes', JSON.stringify(newFavorites));
    }

    // Optimistic update
    setIsFavorite(newFavoriteState);
    if (onFavoriteToggle) {
      onFavoriteToggle(id, newFavoriteState);
    }

    setIsSyncing(true);

    try {
      await favoritesApi.toggleFavorite(id);
    } catch (error) {
      console.error("Failed to sync favorite state", error);
      // We don't revert optimistic update so user still sees it as favorited
    } finally {
      setIsSyncing(false);
    }
  };

  const renderBadges = () => {
    const badgeClass = "h-[22px] rounded-full px-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1 border border-white/20 backdrop-blur-sm";
    
    return (
      <div className="absolute left-2 top-2 z-30 flex flex-col gap-1.5 items-start">
        {/* VIP Badges */}
        {vipTier === 'NOI_TROI' && (
          <Badge className={`${badgeClass} bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600`}>
            <Crown className="w-3 h-3 fill-white" />
            Nổi trội
          </Badge>
        )}
        {vipTier === 'NOI_BAT' && (
          <Badge className={`${badgeClass} bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500`}>
            <Star className="w-3 h-3 fill-white" />
            Nổi bật
          </Badge>
        )}
        {(vipTier === 'DE_THAY' || vipTier === 'THUONG') && (
          <Badge className={`${badgeClass} bg-slate-500`}>
            Dễ thấy
          </Badge>
        )}

        {/* Certified Badge */}
        {isCertified && (
          <Badge className={`${badgeClass} bg-[#2E9147]`}>
            <ShieldCheck className="w-3 h-3 fill-white" />
            Đã kiểm định
          </Badge>
        )}
      </div>
    );
  };

  const getFrameSizeText = (size?: string) => {
    if (!size) return null;
    switch (size.toUpperCase()) {
      case 'XS': return 'Dưới 155cm';
      case 'S': return '155 - 165cm';
      case 'M': return '165 - 175cm';
      case 'L': return '175 - 183cm';
      case 'XL': return 'Trên 183cm';
      default: return size;
    }
  };

  return (
    <Card
      className={`group relative w-full max-w-[300px] overflow-hidden rounded-[12px] transition-all duration-300 hover:shadow-md shadow-sm border-0 ${isCertified ? 'ring-2 ring-[#2E9147]' : ''} cursor-pointer`}
      onClick={onClick}
    >

      {/* Image Section */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        <ImageWithFallback
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Product Badges */}
        {renderBadges()}

        {/* Favorite Button */}
        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-[#E9E9E9]/80 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
          onClick={handleFavoriteClick}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
        </Button>
      </div>

      {/* Content Section */}
      <CardContent className="p-0">
        <div className="flex flex-col gap-1 px-3 py-3">
          <h3 className="line-clamp-1 text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary md:text-lg">
            {name}
          </h3>

          <div className="flex items-center justify-between text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs font-medium">{location}</span>
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs font-medium">Đăng {postedDate}</span>
            </div>
          </div>
        </div>

        <div className="px-3 pb-3 pt-0 flex items-center justify-between">
          <span className="text-lg font-extrabold leading-none text-primary md:text-xl">
            {price}
          </span>
          {frameSize && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-zinc-200 text-zinc-500 font-medium">
              {getFrameSizeText(frameSize)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
