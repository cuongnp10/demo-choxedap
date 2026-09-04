/**
 * @file common.ts
 * @description Common type definitions (Payments, Notifications, Chat) based on Documentation/02-Architecture-and-Design/logical-data-model.md
 */

export interface Payment {
    id: string;
    paymentCode: string;
    referenceType: "ORDER" | "MEMBERSHIP" | "VIP_PACKAGE";
    referenceId: string;
    accountId: string;
    purpose: string;
    amount: number;
    expectedAmount: number;
    status: "UNPAID" | "PAID" | "ERROR" | "RESERVED" | "EXPIRED" | "REFUND_REQUIRED";
    sepayTransactionId?: string;
    sepayReferenceCode?: string;
    transferContent: string;
    qrImageUrl: string;
    checkoutUrl: string;
    expiredAt: string;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    id: string;
    accountId: string;
    title: string;
    message: string;
    type: "INFO" | "SUCCESS" | "WARNING" | "DANGER";
    referenceId?: string;
    isRead: boolean;
    createdAt: string;
}

export interface Conversation {
    id: string;
    user1Id: string;
    user2Id: string;
    lastMessageAt: string;
    createdAt: string;
    
    // UI Metadata (Joined from Profiles)
    otherUser?: {
        id: string;
        fullName: string;
        avatar?: string;
    };
    lastMessage?: string;
    unreadCount?: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export interface Favorite {
    id: string;
    accountId: string;
    postingId: string;
    createdAt: string;
}
