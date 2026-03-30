import Dropdown from "@/components/dropdown/Dropdown";
import { ChevronDown, Plus } from "lucide-react";
import useOrgStore from "@/store/orgStore";
import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

export function OrganizationDropdown() {
  const { currentOrg, orgs, setCurrentOrg } = useOrgStore();
  const navigate = useNavigate();

  // Prefer personal org by default if none is selected.
  // Memoize orgs lookup for efficiency.
  const current = useMemo(() => {
    if (currentOrg) {
      // if currentOrg set, use it
      return orgs.find((org) => org.id === currentOrg.id);
    }
    // otherwise use user's personal org (fallback)
    return orgs.find((org) => org.is_personal) || orgs[0];
  }, [orgs, currentOrg]);

  // Helper for name initial
  const getNameInitial = useCallback((name: string) => {
    return name?.trim()?.[0]?.toUpperCase() ?? "";
  }, []);

  // Handle selection: set as current
  const handleOrgSelect = useCallback(
    (org: { id: number; name: string }) => {
      setCurrentOrg(org);
    },
    [setCurrentOrg]
  );

  // Handle create org
  const handleCreateOrg = useCallback(() => {
    navigate("/createOrg");
  }, [navigate]);

  return (
    <Dropdown
      widthClass="w-72"
      trigger={
        <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition">
          <span>{current?.name ?? "Choose Organization"}</span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </button>
      }
    >
      <div className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">
        Switch Organization
      </div>

      <div className="p-2">
        {orgs.map((org) => {
          const active = org.id === current?.id;
          return (
            <button
              key={org.id}
              type="button"
              onClick={() => handleOrgSelect(org)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                active ? "bg-muted-foreground/30" : "hover:bg-foreground/5"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {getNameInitial(org.name)}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{org.name}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="border-t border-border">
        <button
          type="button"
          onClick={handleCreateOrg}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-primary hover:bg-accent/60 transition"
        >
          <Plus size={16} />
          <span>Create Organization</span>
        </button>
      </div>
    </Dropdown>
  );
}