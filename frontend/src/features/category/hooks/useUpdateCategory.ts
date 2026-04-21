import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory } from "../api";

export const useUpdateCategory = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, name }: { categoryId: string; name: string }) =>
      updateCategory(orgId, categoryId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "categories"] });
    },
  });
};
