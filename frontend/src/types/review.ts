/**
 * @file review.ts
 * @description Type definitions for Inspection Reports and User Ratings based on Documentation/02-Architecture-and-Design/logical-data-model.md
 */

export interface InspectionRecord {
    id: string;
    inspectionRequestId: string;
    inspectorId: string;
    result: string; // Score or evaluation
    comments: string;
    validUntil: string; // 3 months validity
    inspectionVideoRecordUrl?: string;
    createdAt: string;
}

/**
 * UI Specific Type: User Review (after order completion)
 */
export interface UserReview {
    id: string;
    orderId: string;
    reviewerId: string;
    targetUserId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
    
    // UI Metadata
    bikeName?: string;
    reviewerName?: string;
    reviewerAvatar?: string;
}

export interface SubmittedReview {
    orderId: string;
    bikeName: string;
    image: string;
    shopName: string;
    rating: number;
    comment: string;
    date: string;
    reviewType?: "COMMENT" | "ORDER_REVIEW";
}

