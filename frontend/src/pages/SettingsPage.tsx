import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Users,
  ShieldCheck,
  Tags,
  Save,
  RotateCcw,
  CircleAlert,
  CheckCircle2,
} from "lucide-react";
import { useGetOrgByID } from "@/features/organization/hooks/useGetOrgByID";
import useOrgStore from "@/store/orgStore";
import { useUpdateOrg } from "@/features/organization/hooks/useUpdateOrg";

const settingsSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters"),
  contactEmail: z.string().trim().email("Enter a valid contact email address"),
  businessAddress: z
    .string()
    .trim()
    .min(8, "Business address must be at least 8 characters"),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

type SettingsTab = "general" | "members" | "roles" | "categories";

const tabs = [
  { key: "general", label: "General", icon: Building2 },
  { key: "members", label: "Members", icon: Users },
  { key: "roles", label: "Roles & Permissions", icon: ShieldCheck },
  { key: "categories", label: "Categories", icon: Tags },
] as const;

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { currentOrg } = useOrgStore();
  const {
    data: organizationData,
    loading,
    error,
  } = useGetOrgByID(currentOrg?.id ?? "");
  const { mutateAsync: updateOrg } = useUpdateOrg(currentOrg?.id ?? "");

  // Memoized form default values (updated on org data change)
  const defaultValues = useMemo(
    () => ({
      organizationName: organizationData?.name || "",
      contactEmail: organizationData?.email || "",
      businessAddress: organizationData?.address || "",
    }),
    [organizationData],
  );

  const activeTab = useMemo<SettingsTab>(() => {
    const tab = searchParams.get("tab") as SettingsTab | null;
    return tabs.some((t) => t.key === tab) ? (tab as SettingsTab) : "general";
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
    mode: "onBlur",
  });

  // Keep form synced to org data (reset on org change)
  useEffect(() => {
    reset({
      organizationName: organizationData?.name || "",
      contactEmail: organizationData?.email || "",
      businessAddress: organizationData?.address || "",
    });
  }, [
    organizationData?.name,
    organizationData?.email,
    organizationData?.address,
    reset,
  ]);

  const onSubmit = async (data: SettingsFormData) => {
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      await updateOrg({
        name: data.organizationName,
        email: data.contactEmail,
        address: data.businessAddress,
      });
      reset(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => {
    reset();
    setSaveSuccess(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-gray-500">Loading organization details…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-red-500">
          Error: {error.message ?? String(error)}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 md:px-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Manage organization settings and preferences.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div
            role="tablist"
            aria-label="Settings sections"
            className="inline-flex min-w-max items-center gap-2 rounded-2xl border border-border bg-card/70 p-1.5"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSearchParams({ tab: tab.key })}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "general" ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-3xl border border-border bg-card/80 shadow-sm backdrop-blur-sm">
              {/* Card header */}
              <div className="border-b border-border px-6 py-5 md:px-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Organization Details
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Update your organization profile, and business contact
                      details
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDirty ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                        <CircleAlert size={14} />
                        Unsaved changes
                      </div>
                    ) : saveSuccess ? (
                      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                        <CheckCircle2 size={14} />
                        Saved
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Card body */}
              <div className="px-6 py-6 md:px-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <SettingsInput
                    label="Organization Name"
                    placeholder="Acme Corporation"
                    error={errors.organizationName?.message}
                    {...register("organizationName")}
                  />

                  <SettingsInput
                    label="Contact Email"
                    type="email"
                    placeholder="contact@acme.com"
                    error={errors.contactEmail?.message}
                    {...register("contactEmail")}
                  />

                  <div className="lg:col-span-2">
                    <SettingsInput
                      label="Business Address"
                      placeholder="123 Business St, San Francisco, CA 94102"
                      error={errors.businessAddress?.message}
                      {...register("businessAddress")}
                    />
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="flex flex-col gap-3 border-t border-border px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
                <p className="text-sm text-muted-foreground">
                  Changes affect organization-wide settings.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={!isDirty || isSaving || isSubmitting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={16} />
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!isDirty || isSaving || isSubmitting}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={16} />
                    {isSaving || isSubmitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <SettingsPlaceholder activeTab={activeTab} />
        )}
      </div>
    </div>
  );
}

type SettingsInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

function SettingsInput({
  label,
  error,
  className = "",
  ...props
}: SettingsInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        {...props}
        className={`h-11 w-full rounded-xl border border-input dark:border-input/30 bg-input-background bg-muted-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 ${
          error ? "border-destructive/60" : ""
        } ${className}`}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function SettingsPlaceholder({ activeTab }: { activeTab: SettingsTab }) {
  const labelMap: Record<SettingsTab, string> = {
    general: "General",
    members: "Members",
    roles: "Roles & Permissions",
    categories: "Categories",
  };

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
