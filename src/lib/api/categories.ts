import { api } from "@/lib/api/axios";
import { normalizeApiError } from "@/lib/api/errors";
import type { RequestOptions } from "@/types/api";
import type { Category } from "@/types/product";

export async function getCategories(
  options: RequestOptions = {}
): Promise<Category[]> {
  try {
    const { data } = await api.get<Category[]>("/products/categories", {
      signal: options.signal,
      params: options.delay ? { delay: options.delay } : undefined,
    });
    return data;
  } catch (error) {
    throw normalizeApiError(error);
  }
}
