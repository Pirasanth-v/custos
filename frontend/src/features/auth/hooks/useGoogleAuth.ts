import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { toast } from "sonner";
import { resetSession } from "@/lib/resetSession";
import { queryClient } from "@/lib/queryClient";

export function useGoogleAuth() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (credential: string) => {
      const response = await api.post("/auth/google/signin", { id_token: credential });
      return response.data;
    },
    onSuccess: async () => {
      resetSession();
      await queryClient.invalidateQueries({ queryKey: ["me"] });
      await queryClient.invalidateQueries({ queryKey: ["orgs"] });
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Google sign in failed.");
    },
  });
}