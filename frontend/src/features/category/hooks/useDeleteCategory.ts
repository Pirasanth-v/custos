import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "../api";

export const useDeleteCategory = (orgId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => deleteCategory(orgId, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org", orgId, "categories"] });
    },
  });
};
