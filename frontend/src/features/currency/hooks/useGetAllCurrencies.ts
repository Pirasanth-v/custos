import { useQuery } from "@tanstack/react-query";
import { getAllCurrencies } from "../api";

export function useGetAllCurrencies() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["currency"],
        queryFn: getAllCurrencies, 
    });

    return { data, isLoading, error };
}