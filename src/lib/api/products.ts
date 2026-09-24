import { api } from "@/lib/api/axios";
import { normalizeApiError } from "@/lib/api/errors";
import type { RequestOptions } from "@/types/api";
import type { Product, ProductsResponse } from "@/types/product";

export interface ProductsQueryParams {
  limit?: number;
  skip?: number;
  sortBy?: "price" | "rating" | "title";
  order?: "asc" | "desc";
  select?: string;
  delay?: number;
}

function buildParams(
  params: ProductsQueryParams = {},
  options: RequestOptions = {}
) {
  return {
    ...params,
    ...(options.delay ? { delay: options.delay } : {}),
    ...(params.delay ? { delay: params.delay } : {}),
  };
}

export async function getProducts(
  params: ProductsQueryParams = {},
  options: RequestOptions = {}
): Promise<ProductsResponse> {
  try {
    const { data } = await api.get<ProductsResponse>("/products", {
      params: buildParams(params, options),
      signal: options.signal,
    });
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function searchProducts(
  q: string,
  params: ProductsQueryParams = {},
  options: RequestOptions = {}
): Promise<ProductsResponse> {
  try {
    const { data } = await api.get<ProductsResponse>("/products/search", {
      params: {
        q,
        ...buildParams(params, options),
      },
      signal: options.signal,
    });
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getProductsByCategory(
  category: string,
  params: ProductsQueryParams = {},
  options: RequestOptions = {}
): Promise<ProductsResponse> {
  try {
    const { data } = await api.get<ProductsResponse>(
      `/products/category/${encodeURIComponent(category)}`,
      {
        params: buildParams(params, options),
        signal: options.signal,
      }
    );
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function getProduct(
  id: number | string,
  options: RequestOptions = {}
): Promise<Product> {
  try {
    const { data } = await api.get<Product>(`/products/${id}`, {
      signal: options.signal,
      params: options.delay ? { delay: options.delay } : undefined,
    });
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export type CreateProductPayload = Partial<Product> & {
  title: string;
};

export async function addProduct(
  payload: CreateProductPayload
): Promise<Product> {
  try {
    const { data } = await api.post<Product>("/products/add", payload);
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function updateProduct(
  id: number | string,
  payload: Partial<Product>
): Promise<Product> {
  try {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}

export async function deleteProduct(
  id: number | string
): Promise<Product> {
  try {
    const { data } = await api.delete<Product>(`/products/${id}`);
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
