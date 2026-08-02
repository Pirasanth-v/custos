import { useMemo, useState } from "react";
import { Building2, ShieldAlert, Loader2, Trash2 } from "lucide-react";
import Modal from "./ui/modal";
import StatusMessage from "./StatusMessage";

type Organization = {
  id: string;
  name: string;
  email?: string;
  memberCount?: number;
};

type DeleteOrganizationModalProps = {
  open: boolean;
  onClose: () => void;
  organization: Organization | null;
  onConfirm: (organization: Organization) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
};

export default function DeleteOrganizationModal(
  props: DeleteOrganizationModalProps,
) {
  const { open, organization } = props;

  if (!open || !organization) return null;

  return (
    <DeleteOrganizationModalContent
      key={`${organization.id}-${open}`}
      {...props}
      organization={organization}
    />
  );
}

function DeleteOrganizationModalContent({
  open,
  onClose,
  organization,
  onConfirm,
  loading = false,
  errorMessage,
}: {
  open: boolean;
  onClose: () => void;
  organization: Organization;
  onConfirm: (organization: Organization) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string | null;
}) {
  const [confirmationText, setConfirmationText] = useState("");
  const [finalAcknowledge, setFinalAcknowledge] = useState(false);

  const initials = useMemo(() => {
    return organization.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, [organization.name]);

  const canDelete =
    confirmationText.trim() === organization.name &&
    finalAcknowledge &&
    !loading;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 p-4 text-white sm:space-y-6 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive ring-1 ring-destructive/20 sm:h-11 sm:w-11 sm:rounded-2xl">
            <Trash2 size={20} />
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Delete Organization
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground sm:mt-2">
              This is a permanent action. Deleting an organization will revoke
              access for all members and remove the workspace from active use.
            </p>
          </div>
        </div>

        {/* Organization summary */}
        <div className="rounded-2xl border border-border bg-card/70 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary sm:h-14 sm:w-14 sm:rounded-2xl sm:text-base">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-foreground sm:text-lg">
                {organization.name}
              </p>

              {organization.email ? (
                <p className="truncate text-sm text-muted-foreground">
                  {organization.email}
                </p>
              ) : null}

              <div className="mt-1 flex flex-col items-start gap-1 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  Organization workspace
                </span>

                {typeof organization.memberCount === "number" ? (
                  <>
                    <span className="hidden text-muted-foreground/50 sm:inline">
                      •
                    </span>
                    <span>{organization.memberCount} members</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Danger section */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="min-w-0">
              <p className="font-semibold text-destructive">
                What will happen after deletion
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>
                    All members will immediately lose access to this
                    organization
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>
                    Pending invitations and approvals will be invalidated
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>
                    Connected settings, roles, and workflows will be removed
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>This action cannot be undone from the interface</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Server error */}
        <StatusMessage
          type="error"
          message={errorMessage}
          compact
          onClose={() => {}}
        />

        {/* Confirmation input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Type{" "}
            <span className="inline break-all rounded bg-muted px-1.5 py-0.5 font-mono text-destructive">
              {organization.name}
            </span>{" "}
            to confirm
          </label>

          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={organization.name}
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Final acknowledge */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/40 p-3 sm:p-4">
          <input
            type="checkbox"
            checked={finalAcknowledge}
            onChange={(e) => setFinalAcknowledge(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 rounded border-input bg-background text-destructive focus:ring-destructive"
          />
          <span className="text-sm leading-6 text-muted-foreground">
            I understand that deleting this organization is permanent and may
            affect all team members and associated data.
          </span>
        </label>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!canDelete}
            onClick={() => onConfirm(organization)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-sm font-medium text-white transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Organization
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
