export type RegisterRequest = {
    first_name: string
    last_name: string
    email: string
    password: string
}

export type LoginRequest = {
    email: string
    password: string
}

export type UserResponse = {
    first_name: string
    last_name: string
    email: string
    status: string
    avatar_url: string | null
    created_at: string
}