import { useMutation } from "@tanstack/react-query";
import { getPresignURL } from "../api";
import type { UseGetPresignURLInput } from "../types";

export const useGetPresignURL = (orgId: string) => {
    return useMutation({
        mutationFn: ({
            txId,
            bills,
        }: UseGetPresignURLInput) => getPresignURL(orgId, txId, bills),
   
    });
};