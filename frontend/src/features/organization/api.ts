import api from "@/lib/axios"
import type { Organization, CreateOrganizationRequest } from "./types"

export const createOrganization = async (data: CreateOrganizationRequest): Promise<void> => {
    await api.post('/orgs', data)
}

export const getUserOrgs = async(): Promise<Organization[]> => {
    const response = await api.get('/orgs')
    return response.data
}