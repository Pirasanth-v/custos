import api from "@/lib/axios";
import type { BillsResponse, ConfirmBillInput, PresignBillResult, PresignFileInput } from "./types";

export const getPresignURL = async (
  orgId: string, 
  txId: string,
  files: PresignFileInput[]
): Promise<PresignBillResult[]> => {
  const response = await api.post(`/orgs/${orgId}/transactions/${txId}/bills/presign`, { files });
  return response.data as PresignBillResult[];
};

export const confirmUploads = async (
    orgId: string, 
    txId: string,
    bills: ConfirmBillInput[]
  ): Promise<PresignBillResult[]> => {
    const response = await api.post(`/orgs/${orgId}/transactions/${txId}/bills/confirm`, { bills });
    return response.data as PresignBillResult[];
};

export async function getBillsByOrg(
    orgId: string,
  ): Promise<BillsResponse> {
    const res = await api.get<BillsResponse>(
      `/orgs/${orgId}/bills`,
    );
    return res.data;
  }

export async function getBillsByTransaction(
    orgId: string,
    txId: string,
  ): Promise<BillsResponse> {
    const res = await api.get<BillsResponse>(
      `/orgs/${orgId}/transactions/${txId}/bills/`,
    );
    return res.data;
  }
   
  export async function deleteBill(
    orgId: string,
    txId: string,
    billId: string,
  ): Promise<void> {
    await api.delete(`/orgs/${orgId}/transactions/${txId}/bills/${billId}`);
  }
   
  /** Returns a presigned download URL for a bill (reuse the stored url or call presign) */
  export async function getBillDownloadUrl(bill: { url: string }): Promise<string> {
    // The bill already carries a presigned url from the list endpoint.
    // If you need a fresh one, swap this for an API call.
    return bill.url;
  }