import { useQuery } from "@tanstack/react-query";
import { me } from "../api";
import type { UserResponse } from "../types";

export function useMe() {
  return useQuery<UserResponse, Error>({
    queryKey: ["me"],
    queryFn: me,
    retry: false, // Don't retry if not logged in
    staleTime: 5 * 60 * 1000, // 5 min
  });
}
