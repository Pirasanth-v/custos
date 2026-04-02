import { useQuery } from "@tanstack/react-query";
import { getCurrencyById } from "../api";

export function useGetCurrencyById(currencyId: string) {
    const {data, isLoading, error} = useQuery({
        queryKey: ["currency"],
        queryFn: () => getCurrencyById(currencyId)
    })

    return { data, isLoading, error }
}