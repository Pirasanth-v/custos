import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory } from "../api";

export const useCreateCategory = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createCategory(orgId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "categories"] });
    },
  });
};
