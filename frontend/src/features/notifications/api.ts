import api from "@/lib/axios";
import type { InvitationResponse } from "./types";

export const getInvitations = async(): Promise<InvitationResponse[]> => {
    const response = await api.get(`/invitations`)
    return response.data
}

export const acceptInvitation = async(orgId: string): Promise<void> => {
    await api.post(`/invitations/${orgId}/accept`);
}

export const declineInvitation = async(orgId: string): Promise<void> => {
    await api.post(`/invitations/${orgId}/decline`);
}