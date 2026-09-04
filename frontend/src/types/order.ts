/**
 * @file order.ts
 * @description Type definitions for Orders matched with backend/choxedap.Repositories/Data/Enums.cs
 */

export type OrderStatus = 
    | "CREATED"
    | "PAID"
    | "DEPOSITED"
    | "AWAITING_SELLER_CONFIRMATION"
    | "SELLER_CONFIRMED"
    | "PENDING_FULFILLMENT"
    | "PICKUP_SCHEDULED"
    | "IN_TRANSIT"
    | "DELIVERED"
    | "COMPLETED"
    | "CANCELLED";

export interface Order {
    id: string;
    buyerId: string;
    postingId: string;
    status: OrderStatus;
    totalAmount: number;
    depositAmount: number;
    
    pickupAddress: string;
    deliveryAddress: string;
    
    scheduledPickupTime?: string;
    actualPickupTime?: string;
    actualDeliveryTime?: string;
    
    shipperId?: string;
    note?: string;
    
    isSettled: boolean;
    isReported: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface OrderListItem {
    id: string;
    postingId: number;
    date: string;
    status: OrderStatus;
    postingTitle: string;
    sellerName: string;
    bike: {
        name: string;
        image: string;
        price: string;
    };
    totalAmount: number;
    isReported?: boolean;
    rating?: number;
    reviewComment?: string;
}
