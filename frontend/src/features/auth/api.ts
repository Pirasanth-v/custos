import api from '@/lib/axios'
import type { RegisterRequest, LoginRequest, UserResponse } from './types'

export const register = async (data: RegisterRequest): Promise<void> => {
    await api.post('/auth/register', data)
}

export const login = async (data: LoginRequest): Promise<void> => {
    await api.post('/auth/login', data)
}

export const logout = async (): Promise<void> => {
    await api.post('/auth/logout')
}

export const me = async (): Promise<UserResponse> => {
    const response = await api.get('/users/me')
    return response.data
}