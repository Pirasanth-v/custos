import { useQuery } from "@tanstack/react-query";
import { getAllCurrencies } from "../api";

export function useGetAllCurrencies() {
  return useQuery({
    queryKey: ["currencies"],
    queryFn: getAllCurrencies,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}