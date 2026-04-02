import type { Account, CreateAccount, UpdateAccountRequest } from "./types";
import api from "@/lib/axios";

export const getAccountsByOrgId = async (orgId: string): Promise<Account[]> => {
    const response = await api.get(`/orgs/${orgId}/accounts`);
    return response.data as Account[];
};

export const getAccountById = async(orgId:string, accId: string): Promise<Account> => {
    const response = await api.get(`/orgs/${orgId}/accounts/${accId}`)
    return response.data
}

export const createAccount = async(orgId:string, data: CreateAccount): Promise<void> => {
    await api.post(`/orgs/${orgId}/accounts`, data)
}

export const updateAccount = async(orgId: string, accId: string, data: UpdateAccountRequest): Promise<void> => {
    await api.patch(`/orgs/${orgId}/accounts/${accId}`, data)
}

export const deleteAccount = async(orgId: string, accId: string): Promise<void> => {
    await api.delete(`/orgs/${orgId}/accounts/${accId}`)
}