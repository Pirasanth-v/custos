import api from "@/lib/axios";
import type { Member, InviteMemberRequest, updateMemberRoleRequest } from "./types";

export const getMembers = async(orgId: string): Promise<Member[]> => {
    const response = await api.get(`/orgs/${orgId}/members`)
    return response.data
}

export const inviteMember = async(orgId: string, data: InviteMemberRequest): Promise<void> => {
    await api.post(`orgs/${orgId}/members/invite`, data)
}

export const updateMemberRole = async(orgId: string, memberId: string, data: updateMemberRoleRequest): Promise<void> => {
    await api.put(`orgs/${orgId}/members/${memberId}`, data)
}

export const removeMember = async(orgId: string, userId: string): Promise<void> => {
    await api.delete(`orgs/${orgId}/members/${userId}`)
}