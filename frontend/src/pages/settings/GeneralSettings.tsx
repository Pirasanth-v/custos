import React from "react";
import { CircleAlert, CheckCircle2, RotateCcw, Save } from "lucide-react";
import SettingsInput from "@/components/SettingsInput";

interface GeneralSettingsProps {
  register: ReturnType<typeof import("react-hook-form")["useForm"]>["register"];
  handleSubmit: (onValid: (data: Record<string, unknown>) => void) => (e?: React.BaseSyntheticEvent) => void;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  errors: Record<string, { message?: string }>;
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
  return (
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
  );
};

export default GeneralSettings;