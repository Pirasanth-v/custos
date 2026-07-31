import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Loader2 } from "lucide-react";
import useOrgStore from "@/store/orgStore";
import { useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserOrgs } from "@/features/organization/hooks/useGetUserOrgs";
import type { Organization } from "@/features/organization/types";

export function OrganizationDropdown() {
  const { currentOrg, setCurrentOrg, setOrgs } = useOrgStore();
  const navigate = useNavigate();
  const { data: orgs = [], isLoading } = useGetUserOrgs();

  // Keep store in sync for legacy components if needed, 
  // but better to move away from store-based orgs list.
  useEffect(() => {
    if (orgs.length > 0) {
      setOrgs(orgs);
    }
  }, [orgs, setOrgs]);

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
    (org: Organization) => {
      setCurrentOrg(org);
    },
    [setCurrentOrg]
  );

  // Handle create org
  const handleCreateOrg = useCallback(() => {
    navigate("/createOrg");
  }, [navigate]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
        >
          {isLoading ? (
            <Loader2
              size={16}
              className="animate-spin text-muted-foreground"
            />
          ) : (
            <span className="max-w-44 truncate">
              {current?.name ?? "Choose Organization"}
            </span>
          )}

          <ChevronDown
            size={16}
            className="shrink-0 text-muted-foreground transition group-hover:text-primary"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        sideOffset={8}
        className="w-64 max-w-[calc(100vw-2rem)]"
      >
        <DropdownMenuLabel className="px-3 py-2 text-sm font-medium">
          Switch Organization
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {orgs.map((org) => {
          const active = org.id === current?.id;

          return (
            <DropdownMenuItem
              key={org.id}
              onSelect={() => handleOrgSelect(org)}
              className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 ${active ? "bg-muted-foreground/30" : ""
                }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${active
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                {getNameInitial(org.name)}
              </div>

              <span className="min-w-0 truncate font-medium text-foreground">
                {org.name}
              </span>
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={handleCreateOrg}
          className="cursor-pointer gap-3 px-3 py-2 text-primary focus:text-primary"
        >
          <Plus size={16} />
          <span>Create Organization</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}