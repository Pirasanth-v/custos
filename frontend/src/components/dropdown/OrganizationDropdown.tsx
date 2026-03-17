import Dropdown from "@/components/dropdown/Dropdown";
import { ChevronDown, Plus } from "lucide-react";

const organizations = [
  {
    id: 1,
    initials: "AC",
    name: "Acme Corporation",
    type: "Current",
  },
  {
    id: 2,
    initials: "PA",
    name: "Personal Account",
    type: "Individual",
  },
  {
    id: 3,
    initials: "SC",
    name: "Smith & Co",
    type: "Agency",
  },
];

type OrganizationDropdownProps = {
  selectedOrgId: number;
  onSelect: (id: number) => void;
  onCreate: () => void;
};

export function OrganizationDropdown({
  selectedOrgId,
  onSelect,
  onCreate,
}: OrganizationDropdownProps) {
  const current = organizations.find((org) => org.id === selectedOrgId);

  return (
    <Dropdown
      widthClass="w-72"
      trigger={
        <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition">
          <span>{current?.name}</span>
          <ChevronDown size={16} className="text-muted-foreground" />
        </button>
      }
    >
      <div className="border-b border-border px-4 py-3 text-sm font-medium text-foreground">
        Switch Organization
      </div>

      <div className="p-2">
        {organizations.map((org) => {
          const active = org.id === selectedOrgId;

          return (
            <button
              key={org.id}
              onClick={() => onSelect(org.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                active ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {org.initials}
              </div>

              <div className="flex flex-col">
                <span className="font-medium text-foreground">{org.name}</span>
                <span className="text-sm text-muted-foreground">{org.type}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="border-t border-border">
        <button
          onClick={onCreate}
          className="flex w-full items-center gap-3 px-4 py-3 text-left text-primary hover:bg-accent/60 transition"
        >
          <Plus size={16} />
          <span>Create Organization</span>
        </button>
      </div>
    </Dropdown>
  );
}