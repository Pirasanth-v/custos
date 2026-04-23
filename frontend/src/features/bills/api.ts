import api from "@/lib/axios";
import type { Bill, BillsStats, ConfirmBillInput, GetOrgBillsParams, PaginatedResponse, PresignBillResult, PresignFileInput } from "./types";

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
    params?: GetOrgBillsParams
  ): Promise<PaginatedResponse<Bill>> {
    const res = await api.get<PaginatedResponse<Bill>>(
      `/orgs/${orgId}/bills`,
      { params }
    );
    return res.data;
  }

export async function getBillsByTransaction(
  orgId: string,
  txId: string,
): Promise<Bill[]> {
  const res = await api.get<Bill[]>(
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

export async function getStats(orgId: string): Promise<BillsStats> {
  const res = await api.get(`/orgs/${orgId}/bills/stats`);
  return res.data;
}
   
