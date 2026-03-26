import api from "@/lib/axios"
import type { Organization, CreateOrganizationRequest, updateOrganizationRequest } from "./types"

export const createOrganization = async (data: CreateOrganizationRequest): Promise<void> => {
    await api.post('/orgs', data)
}

export const getUserOrgs = async(): Promise<Organization[]> => {
    const response = await api.get('/orgs')
    return response.data
}

export const getOrgByID = async (orgId: string): Promise<Organization> => {
    const response = await api.get(`/orgs/${orgId}`)
    return response.data
}

export const updateOrganization = async(orgId: string, data: updateOrganizationRequest): Promise<void> => {
    await api.put(`/orgs/${orgId}`, data)
}