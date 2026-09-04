/**
 * @file pricing.ts
 * @description Type definitions for Memberships and Ads matched with backend/choxedap.Repositories/Data/Enums.cs
 */

export type PostingPackageLevel = "THUONG" | "DE_THAY" | "NOI_BAT" | "NOI_TROI";

export interface AdsPackage {
    id: string;
    level: PostingPackageLevel;
    name: string;
    price: number;
    durationDays: number;
}

export interface MembershipPlan {
    id: string;
    tier: "BASIC" | "STANDARD" | "PREMIUM";
    price: number;
    discountPercentage: number;
}
