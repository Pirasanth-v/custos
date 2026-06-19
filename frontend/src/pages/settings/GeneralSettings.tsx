import React from "react";
import { CircleAlert, CheckCircle2, RotateCcw, Save, Trash2 } from "lucide-react";
import SettingsInput from "@/components/SettingsInput";
import { useState } from "react";
import DeleteOrganizationModal from "@/components/DeleteOrgModal";
import useOrgStore from "@/store/orgStore";
import { useDeleteOrg } from "@/features/organization/hooks/useDeleteOrg";
import axios from "axios";
import { type UseFormRegister, type UseFormHandleSubmit, type FieldErrors } from "react-hook-form";
import { toast } from "@/lib/toast";

type SettingsFormData = {
  organizationName: string;
  contactEmail: string;
  businessAddress: string;
};

interface GeneralSettingsProps {
  register: UseFormRegister<SettingsFormData>;
  handleSubmit: UseFormHandleSubmit<SettingsFormData>;
  onSubmit: (data: SettingsFormData) => void;
  onCancel: () => void;
  errors: FieldErrors<SettingsFormData>;
  isDirty: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
  saveSuccess: boolean;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  register,
  handleSubmit,
  onSubmit,
  onCancel,
  errors,
  isDirty,
  isSaving,
  isSubmitting,
  saveSuccess,
}) => {
  const [deleteOrgOpen, setDeleteOrgOpen] = useState(false);
  const [deleteOrgError, setDeleteOrgError] = useState("");
  const currentOrg = useOrgStore((s) => s.currentOrg)

  const deleteOrgMutation = useDeleteOrg(currentOrg?.id ?? "")

  return (
    <div className="flex flex-col space-y-6 items center justify center">
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
              className="inline-flex h-11 items-center justify-center text-white gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={16} />
              {isSaving || isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </form>

    {/*Danger zone*/}

    <section className="rounded-2xl border border-destructive bg-destructive/5 p-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <Trash2 className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-xl font-semibold text-destructive">
            Danger Zone
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Irreversible and destructive actions
          </p>
        </div>
      </div>

      {/* Inner action card */}
      <div className="mt-6 rounded-2xl border border-destructive/30 bg-card/60 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h4 className="text-lg font-semibold text-foreground">
              Delete Organization
            </h4>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Permanently delete this organization and all of its data. This
              action cannot be undone and all members will lose access
              immediately.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDeleteOrgOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-background px-4 text-sm font-medium text-destructive transition hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </section>

    { currentOrg &&    
      <DeleteOrganizationModal
        open={deleteOrgOpen}
        onClose={() => {
          setDeleteOrgOpen(false);
          setDeleteOrgError("");
        }}
        organization={{
          id: currentOrg.id,
          name: currentOrg.name,
          email: currentOrg.email,
          memberCount: 12,
        }}
        loading={deleteOrgMutation.isPending}
        errorMessage={deleteOrgError}
        onConfirm={async () => {
          try {
            setDeleteOrgError("");
            await deleteOrgMutation.mutateAsync();
            toast.success("Organization deleted");
            setDeleteOrgOpen(false);
          } catch (error) {
            let message = "Something went wrong, try again."
            if (axios.isAxiosError(error)) {
              message = error?.response?.data?.error || message
            }
            setDeleteOrgError(message)
          }
        }}
      />
    }
    </div>
  );
};

export default GeneralSettings;