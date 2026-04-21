import api from "@/lib/axios";
import type { Category } from "./types";

export const getCategoriesByOrgId = async (orgId: string): Promise<Category[]> => {
  const response = await api.get(`/orgs/${orgId}/categories`);
  return response.data as Category[];
};

export const createCategory = async (orgId: string, name: string): Promise<void> => {
  await api.post(`/orgs/${orgId}/categories`, { name });
};

export const updateCategory = async (orgId: string, categoryId: string, name: string): Promise<void> => {
  await api.patch(`/orgs/${orgId}/categories/${categoryId}`, { id: categoryId, name });
};

export const deleteCategory = async (orgId: string, categoryId: string): Promise<void> => {
  await api.delete(`/orgs/${orgId}/categories/${categoryId}`);
};
