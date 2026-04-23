export type PresignFileInput = {
  file_name: string;       // required
  mime_type: string;       // required
  file_size_bytes: number; // required, min: 1, max: 26214400 (25MB)
};

export type PresignBillResult = {
  upload_url: string;
  object_key: string;
  file_name: string;
};

export type UseGetPresignURLInput = {
    txId: string;
    bills: PresignFileInput[];
};

export type ConfirmBillInput = {
  object_key: string;        // required
  file_name: string;         // required
  mime_type: string;         // required
  file_size_bytes: number;   // required
};

export type BillFileType = "image" | "pdf" | "other";
 
export interface Bill {
  id: string;
  transaction_id: string;
  org_id: string;
  uploaded_by: string;
  view_url: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number; // bytes
  url: string; // presigned GET url 
  created_at: string;
}
 
export type BillView = "grid" | "list";
 
export type BillSortKey = "uploaded_at" | "file_name" | "file_size";
export type BillSortDir = "asc" | "desc";
 
export interface BillFilters {
  search: string;
  type: "all" | "image" | "pdf" | "other";
  sortKey: BillSortKey;
  sortDir: BillSortDir;
}

export type GetOrgBillsParams = {
  cursor?: string;
  limit?: number;
}

export type PaginatedResponse<B> = {
  data: B[];
  next: string;
  has_more: boolean;
}

export interface BillsStats {
  total_bills: number;
  total_file_size_bytes: number;
  image_count: number;
  pdf_count: number;
}