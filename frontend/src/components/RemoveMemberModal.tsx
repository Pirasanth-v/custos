import { useEffect, useMemo, useState } from "react";
import { UserRoundMinus, TriangleAlert, Loader2 } from "lucide-react";
import Modal from "./ui/modal";
import StatusMessage from "./StatusMessage";

type Member = {
  user_id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role_name?: string;
};

type RemoveMemberModalProps = {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  onConfirm: (member: Member) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string;
};

export default function RemoveMemberModal({
  open,
  onClose,
  member,
  onConfirm,
  loading = false,
  errorMessage,
}: RemoveMemberModalProps) {
  const [confirmationText, setConfirmationText] = useState("");

  useEffect(() => {
    if (open) {
      setTimeout(() => setConfirmationText(""), 0);
    }
  }, [open, member]);

  const fullName = useMemo(() => {
    if (!member) return "";
    return (
      `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
      "Unknown Member"
    );
  }, [member]);

  const initials = useMemo(() => {
    if (!member) return "?";
    const first = member.first_name?.[0] || "";
    const last = member.last_name?.[0] || "";
    return (
      `${first}${last}`.trim().toUpperCase() ||
      member.email?.[0]?.toUpperCase() ||
      "?"
    );
  }, [member]);

  const canRemove =
    confirmationText.trim() === "DELETE" && !!member && !loading;

  if (!open || !member) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 p-4 text-white sm:space-y-6 sm:p-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-destructive/15 text-destructive sm:h-10 sm:w-10">
              <UserRoundMinus size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                Remove Team Member
              </h2>
            </div>
          </div>

          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:mt-4">
            This action cannot be undone. This will permanently remove the
            member from your organization.
          </p>
        </div>

        {/* Member Card */}
        <div className="rounded-2xl border border-border bg-card/70 p-3 sm:p-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/20 text-sm font-semibold text-destructive sm:h-14 sm:w-14 sm:text-lg">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold text-foreground sm:text-lg">
                {fullName}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {member.email}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Role:{" "}
                <span className="text-foreground">
                  {member.role_name || "Unknown"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Warning Box */}
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="min-w-0">
              <p className="font-semibold text-destructive">
                Warning: This action is permanent
              </p>

              <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>
                    Member will immediately lose access to the organization
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>All active sessions will be terminated</span>
                </li>
                <li className="flex gap-2">
                  <span className="shrink-0">•</span>
                  <span>
                    Historical data will be preserved but attributed to “Deleted
                    User”
                  </span>
                </li>
                <li>
                  • Pending approvals and assignments will need to be reassigned
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Optional server error */}
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
            <span className="font-bold tracking-wide text-destructive">
              DELETE
            </span>{" "}
            to confirm
          </label>

          <input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="Type DELETE"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
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
            disabled={!canRemove}
            onClick={() => onConfirm(member)}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-destructive px-5 text-sm font-medium text-white transition hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove Member"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
