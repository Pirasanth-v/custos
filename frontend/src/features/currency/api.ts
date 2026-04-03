import type { Currency } from "./types";
import api from "@/lib/axios";

export const getAllCurrencies = async(): Promise<Currency[]> => {
    const response = await api.get(`/currencies`)
    return response.data
}

export const getCurrencyById = async(currencyId: string): Promise<Currency> => {
    const response = await api.get(`/currencies/${currencyId}`)
    return response.data
}