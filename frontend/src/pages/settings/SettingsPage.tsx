import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  Users,
  ShieldCheck,
  Tags,
} from "lucide-react";
import { useGetOrgByID } from "@/features/organization/hooks/useGetOrgByID";
import useOrgStore from "@/store/orgStore";
import { useUpdateOrg } from "@/features/organization/hooks/useUpdateOrg";
import GeneralSettings from "./GeneralSettings";
import MembersSettings from "./MembersSettings";
import RolesPermissionsSettings from "./RolesPermissionsSettings";
import CategoriesSettings from "./CategoriesSettings";
import SettingsPlaceholder from "@/components/SettingsPlaceholder";

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

  // Track if this is initial mount to initialize form only once and not reset every tab switch
  const isInitializedRef = useRef(false);

  // Memoize default values but only for initial usage
  const initialDefaultValues = useMemo(
    () => ({
      organizationName: organizationData?.name || "",
      contactEmail: organizationData?.email || "",
      businessAddress: organizationData?.address || "",
    }),
    [organizationData?.name, organizationData?.email, organizationData?.address],
  );

  const activeTab: SettingsTab = useMemo(() => {
    const tab = searchParams.get("tab") as SettingsTab | null;
    return tabs.some((t) => t.key === tab) ? (tab as SettingsTab) : "general";
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: initialDefaultValues,
    mode: "onBlur",
  });

  // When organizationData changes, update form values, but don't reset form's dirty state unless mounting
  useEffect(() => {
    if (
      organizationData &&
      (organizationData.name || organizationData.email || organizationData.address)
    ) {
      // for initial mount, allow reset to populate; afterwards, keep dirty state (for example if user filled, switched tab, switched back)
      if (!isInitializedRef.current) {
        reset({
          organizationName: organizationData?.name || "",
          contactEmail: organizationData?.email || "",
          businessAddress: organizationData?.address || "",
        });
        isInitializedRef.current = true;
      } else {
        setValue("organizationName", organizationData.name || "", { shouldDirty: false });
        setValue("contactEmail", organizationData.email || "", { shouldDirty: false });
        setValue("businessAddress", organizationData.address || "", { shouldDirty: false });
      }
    }
  }, [organizationData?.name, organizationData?.email, organizationData?.address, reset, setValue]);

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
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 md:px-8">
        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Manage organization settings and preferences.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div
            role="tablist"
            aria-label="Settings sections"
            className="grid w-full grid-cols-2 gap-1.5 rounded-2xl border border-border bg-card/70 p-1.5 sm:flex sm:w-fit sm:flex-wrap sm:items-center sm:gap-2"
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
                  className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-2.5 py-2.5 text-xs font-medium transition-all sm:px-4 sm:text-sm ${isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span className="min-w-0 truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab content */}
        <div className="min-w-0">
          {activeTab === "general" ? (
            <GeneralSettings
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              onCancel={onCancel}
              errors={errors}
              isDirty={isDirty}
              isSaving={isSaving}
              isSubmitting={isSubmitting}
              saveSuccess={saveSuccess}
            />
          ) : activeTab === "members" ? (
            <MembersSettings />
          ) : activeTab === "roles" ? (
            <RolesPermissionsSettings />
          ) : activeTab === "categories" ? (
            <CategoriesSettings />
          ) : (
            <SettingsPlaceholder activeTab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}

