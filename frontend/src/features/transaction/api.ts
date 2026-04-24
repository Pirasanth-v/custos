import api from "@/lib/axios";
import type {
  PaginatedResponse,
  CreateTransactionRequest,
  Transaction,
  UpdateTransactionRequest,
  GetTransactionsParams,
} from "./types";

export const getTransactionsByOrgId = async (
  orgId: string,
  params: GetTransactionsParams,
): Promise<PaginatedResponse<Transaction>> => {
  const response = await api.get(`/orgs/${orgId}/transactions`, {
    params: {
      cursor: params.cursor ?? undefined,
      limit: params.limit ?? undefined,
      search: params.search ?? undefined,
      type: params.type ?? undefined,
      account_ids: params.account_ids ?? undefined,
      category_ids: params.category_ids ?? undefined,
      sort_key: params.sort_key ?? undefined,
      sort_dir: params.sort_dir ?? undefined,
    },
  });

  return response.data as PaginatedResponse<Transaction>;
};

export const updateTransaction = async (
  orgId: string,
  fromAccountId: string,
  tranId: string,
  data: UpdateTransactionRequest,
): Promise<void> => {
  await api.patch(
    `/orgs/${orgId}/accounts/${fromAccountId}/transactions/${tranId}`,
    data,
  );
};

export const deleteTransaction = async (
  orgId: string,
  fromAccountId: string,
  tranId: string,
): Promise<void> => {
  await api.delete(
    `/orgs/${orgId}/accounts/${fromAccountId}/transactions/${tranId}`,
  );
};

export const createTransaction = async (
  orgId: string,
  fromAccountId: string,
  data: CreateTransactionRequest,
): Promise<{ id: string }> => {
  const response = await api.post(
    `/orgs/${orgId}/accounts/${fromAccountId}/transactions`,
    data,
  );
  return response.data
};

