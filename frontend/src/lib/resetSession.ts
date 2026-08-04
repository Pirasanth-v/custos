import { queryClient } from "@/lib/queryClient";
import useAuthStore from "@/store/authStore";
import useOrgStore from "@/store/orgStore";

export function resetSession() {
  useAuthStore.getState().clearUser();
  useOrgStore.getState().reset();
  queryClient.clear();
}
