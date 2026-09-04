import createClient from "openapi-fetch";
import type { paths as GeneralPaths } from "@/api/general";
import type { paths as AdminPaths } from "@/api/admin";
import type { paths as SellerPaths } from "@/api/seller";
import type { paths as BuyerPaths } from "@/api/buyer";
import type { paths as InspectorPaths } from "@/api/inspector";
import { mockFetch } from "./mockFetch";

const baseURL = import.meta.env.VITE_API_URL || "";

/**
 * Common Middleware for Auth (JWT Token)
 */
const authMiddleware = {
  async onRequest({ request }: { request: Request }) {
    const token = localStorage.getItem("choxedap_token");
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
  async onResponse({ response }: { response: Response }) {
    if (response.status === 401) {
      localStorage.removeItem("choxedap_token");
      localStorage.removeItem("choxedap_user");
      localStorage.removeItem("favoriteBikes");
      window.dispatchEvent(new Event("auth-expired"));
    }
    return response;
  }
};

// Use mockFetch for all clients
const fetchOption = mockFetch;

// 1. General API Client (Public & Common)
export const generalClient = createClient<GeneralPaths>({ baseUrl: baseURL, fetch: fetchOption });
generalClient.use(authMiddleware);

// 2. Admin API Client
export const adminClient = createClient<AdminPaths>({ baseUrl: baseURL, fetch: fetchOption });
adminClient.use(authMiddleware);

// 3. Seller API Client
export const sellerClient = createClient<SellerPaths>({ baseUrl: baseURL, fetch: fetchOption });
sellerClient.use(authMiddleware);

// 4. Buyer API Client
export const buyerClient = createClient<BuyerPaths>({ baseUrl: baseURL, fetch: fetchOption });
buyerClient.use(authMiddleware);

// 5. Inspector API Client
export const inspectorClient = createClient<InspectorPaths>({ baseUrl: baseURL, fetch: fetchOption });
inspectorClient.use(authMiddleware);

/**
 * HOW TO USE:
 * 
 * import { generalClient } from "@/lib/api-client";
 * 
 * const { data, error } = await generalClient.GET("/bikes/{id}", {
 *   params: { path: { id: "1" } }
 * });
 */
