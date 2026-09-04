/**
 * FILE QUẢN LÝ TYPE TOÀN CỤC (GLOBAL TYPES)
 * 
 * Các file .d.ts được tạo ra bởi lệnh 'npm run gen-api'.
 */

import type { components as GeneralSchema } from "./general";
import type { components as AdminSchema } from "./admin";
import type { components as SellerSchema } from "./seller";
import type { components as BuyerSchema } from "./buyer";
import type { components as InspectorSchema } from "./inspector";

/**
 * Xuất các Schemas chính để sử dụng trong ứng dụng
 */
export type API_Schemas = GeneralSchema["schemas"];
export type Admin_Schemas = AdminSchema["schemas"];
export type Seller_Schemas = SellerSchema["schemas"];
export type Buyer_Schemas = BuyerSchema["schemas"];
export type Inspector_Schemas = InspectorSchema["schemas"];

/**
 * Ví dụ cách dùng trong component:
 * import { API_Schemas } from "@/api/types";
 * const product: API_Schemas["ProductResponse"] = ...
 */
