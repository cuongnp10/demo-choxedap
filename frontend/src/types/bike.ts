/**
 * @file bike.ts
 * @description Type definitions for Postings and Bicycles matched with backend/choxedap.Repositories/Data/Enums.cs
 */

export type PostingStatus = 
    | "DRAFT" 
    | "PENDING" 
    | "APPROVED" 
    | "REJECTED"
    | "REQUESTED_INFO" 
    | "DELETED" 
    | "SOLD" 
    | "EXPIRED"
    | "RESERVED_FOR_ORDER"
    | "HIDDEN_BY_REPORT"
    | "LOCKED_BY_ADMIN";

export type BicycleCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR";

export interface Bicycle {
    id: string;
    categoryId: string | number;
    brandId?: string | number;
    brand?: string;
    model: string;
    frameSize: string;
    frameMaterialId?: string | number;
    frameMaterial?: string;
    colorId?: string | number;
    color?: string;
    condition: BicycleCondition | string;
    conditionPercentage?: number;
    groupsetBrand?: string;
    drivetrain?: string;
    speedCount?: number;
    brakeTypeId?: string | number;
    brakeSystem?: string;
    wheelset?: string;
    hasOriginalReceipt?: boolean;
    year: number;
    description?: string;
}

export interface Posting {
    id: string;
    accountId: string;
    bicycleId: string;
    title: string;
    price: number;
    description: string;
    status: PostingStatus;
    videoStatus?: string;
    isInspected: boolean;
    isCertified?: boolean;
    createdAt: string;
    updatedAt: string;
    inspectionStatus?: string;
    inspectionResult?: string;
    adsEndDate?: string;
    viewCount?: number;
    isVisible?: boolean;
}

export type BikeProduct = {
    id: string;
    image: string;
    name: string;
    location: string;
    postedDate: string;
    price: string;
    vipTier?: 'NOI_TROI' | 'NOI_BAT' | 'DE_THAY' | 'THUONG';
    isCertified?: boolean;
    category?: string;
    frameSize?: string;
};

export type BikeDetail = {
    id: string;
    name: string;
    price: string;
    originalPrice?: string;
    location: string;
    postedDate: string;
    description: string[];
    specs: { label: string; value: string }[];
    seller: {
        userId: string;
        name: string;
        rating: number;
        reviews: number;
        avatar?: string;
        joinDate?: string;
        reputationScore?: number;
        totalOrders?: number;
        successRate?: number;
        responseTime?: string;
    };
    images: string[];
    videos: string[];
    videoUrl?: string;
    videoStatus?: string;
    bicycle: Bicycle;
    posting: Posting;
    isCertified?: boolean;
    vipTier?: 'NOI_TROI' | 'NOI_BAT' | 'DE_THAY' | 'THUONG';
    inspectionStatus?: string;
    inspectionMessage?: string;
    adminNote?: string;
};
