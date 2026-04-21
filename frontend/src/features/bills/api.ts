import api from "@/lib/axios";
import type { ConfirmBillInput, PresignBillResult, PresignFileInput } from "./types";

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