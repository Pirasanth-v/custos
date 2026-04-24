export type TransactionType = "income" | "expense" | "transfer";
export type TransactionStatus = "posted" | "deleted" | "pending" | "cancelled";

export type Transaction = {
  id: string;
  org_id: string;
  from_account_id: string;
  to_account_id?: string | null;
  created_by: string;
  created_by_name: string;
  updated_by: string;
  updated_by_name: string;
  deleted_by?: string | null;
  type: TransactionType;
  amount: string;
  description?: string | null;
  category_id?: string | null;
  version: number;
  status: TransactionStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  next: string;
  has_more: boolean;
};

export type UpdateTransactionRequest = {
  from_account_id: string;
  to_account_id: string | null;
  type: TransactionType;
  amount: string;
  description: string;
  category_id: string;
  version: number;
};

export type CreateTransactionRequest = {
  type: TransactionType;
  amount: string;
  description: string | null;
  category_id: string;
  to_account_id: string | null;
};

export type TransactionFilters = {
  search?: string;
  type?: TransactionType | "all";
  account_ids?: string[];
  category_ids?: string[];
  sort_key?: string;
  sort_dir?: string;
};

export type GetTransactionsParams = {
  cursor?: string;
  limit?: number;
} & TransactionFilters;

