/**
 * @file user.ts
 * @description Type definitions for User Accounts matched with backend/choxedap.Repositories/Data/Enums.cs
 */

export type UserRole = "USER" | "ADMIN" | "INSPECTOR";

export type UserStatus = "ACTIVE" | "SUSPENDED" | "BANNED";

export type MembershipTier = "BASIC" | "STANDARD" | "PREMIUM";

export interface UserProfile {
    id: string;
    role: UserRole;
    fullName: string;
    email: string;
    phoneNumber: string;
    phoneVerified: boolean;
    emailVerified: boolean;
    avatar?: string;
    address?: string;
    
    bankAccountNumber?: string;
    bankAccountHolderName?: string;
    bankName?: string;
    
    status: UserStatus;
    kysStatus: string;
    rating: number;
    reputationScore: number;
    
    membershipTier: MembershipTier;
    membershipExpiresAt?: string;
    
    createdAt: string;
    updatedAt: string;

    stats: {
        activeListings: number;
        totalPostings: number;
        completedOrders: number;
        rating: number;
        totalViews: number;
    };
}
