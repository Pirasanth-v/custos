import api from "@/lib/axios";
import type { DashboardResponse } from "./types";

export async function getDashboard(orgId: string, months = 6): Promise<DashboardResponse> {
    const res = await api.get<DashboardResponse>(`/orgs/${orgId}/dashboard`, {
      params: { months },
    });
    return res.data;
  }