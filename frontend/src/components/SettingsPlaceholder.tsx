import { Building2 } from "lucide-react";

type SettingsTab = "general" | "members" | "roles" | "categories" | "billing";

const labelMap: Record<SettingsTab, string> = {
  general: "General",
  members: "Members",
  roles: "Roles & Permissions",
  categories: "Categories",
  billing: "Billing",
};

interface SettingsPlaceholderProps {
  activeTab: SettingsTab;
}

function SettingsPlaceholder({ activeTab }: SettingsPlaceholderProps) {
  return (
    <div className="rounded-3xl border border-border bg-card/80 px-6 py-12 shadow-sm md:px-8">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Building2 size={22} />
        </div>
        <h2 className="text-xl font-semibold">{labelMap[activeTab]}</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          This section is ready for expansion. You can plug in table views,
          permissions controls, billing plans, or category management here.
        </p>
      </div>
    </div>
  );
}

export default SettingsPlaceholder;
