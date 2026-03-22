import { create } from "zustand";
import type { Organization } from "@/features/organization/types";

type OrgStore = {
  currentOrg: Organization | null;
  orgs: Organization[];
  setCurrentOrg: (org: Organization) => void;
  setOrgs: (orgs: Organization[]) => void;
};

const useOrgStore = create<OrgStore>((set) => ({
  currentOrg: null,
  orgs: [],
  setCurrentOrg: (org) => set({ currentOrg: org }),
  setOrgs: (orgs) => set({ orgs }),
}));

export default useOrgStore;
