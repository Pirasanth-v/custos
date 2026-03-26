export type CreateOrganizationRequest = {
    name: string
    email: string
    address?: string
}

export type Organization = {
    id: string
    name: string
    email: string
    address: string
    is_personal: boolean
    created_at: string
}

export type updateOrganizationRequest = {
    name: string
    email: string
    address?: string
}