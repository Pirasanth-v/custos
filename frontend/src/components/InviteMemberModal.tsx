import { useState } from "react";
import Modal from "./ui/modal";
import { X, Mail, UserPlus } from "lucide-react";
import { useInviteMember } from "@/features/organizationMembers/hooks/useInviteMembers";
import useOrgStore from "@/store/orgStore";
import {
  RoleOwnerID,
  RoleAdminID,
  RoleMemberID,
  RoleViewerID,
} from "@/features/roles/types";
import axios from "axios";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Invite = {
  email: string;
  role: string;
};

const roles = [
  {
    key: RoleOwnerID,
    title: "Owner",
    desc: "Full access to all features",
  },
  {
    key: RoleMemberID,
    title: "Member",
    desc: "Can manage transactions and budgets",
  },
  {
    key: RoleAdminID,
    title: "Admin",
    desc: "Can view and manage financial records",
  },
  {
    key: RoleViewerID,
    title: "Viewer",
    desc: "Can only view data",
  },
];

export default function InviteMembersModal({ open, onClose }: Props) {
  const [invites, setInvites] = useState<Invite[]>([
    { email: "", role: RoleViewerID },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Get current org ID from orgStore
  const currentOrg = useOrgStore((s) => s.currentOrg);
  const orgId = currentOrg?.id || "";

  const { mutateAsync } = useInviteMember(orgId);
  const isLoading = false; // Since isLoading does not exist on useInviteMember's return, set to false or add state if needed

  const updateInvite = (index: number, field: keyof Invite, value: string) => {
    const updated = [...invites];
    updated[index][field] = value;
    setInvites(updated);
  };

  const addInvite = () => {
    setInvites([...invites, { email: "", role: RoleViewerID }]);
  };

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const handleSendInvitations = async () => {
    setError(null);
    setSuccess(false);

    // Validate all fields filled and emails valid
    const emailsInvalid = invites.some(
      (invite) =>
        !invite.email.trim() ||
        !invite.email
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/,
          ),
    );
    if (emailsInvalid) {
      setError("Please enter a valid email address for each invite.");
      return;
    }
    // Remove duplicate emails
    const emailSet = new Set();
    for (const invite of invites) {
      const emailLower = invite.email.trim().toLowerCase();
      if (emailSet.has(emailLower)) {
        setError("Duplicate email addresses are not allowed.");
        return;
      }
      emailSet.add(emailLower);
    }
    try {
      // Could also batch, but assuming inviteMember designed for one at a time
      await Promise.all(
        invites.map((invite) =>
          mutateAsync({
            email: invite.email.trim(),
            role_id: invite.role,
          }),
        ),
      );
      setSuccess(true);
      // Optionally: clear invites/reset to single input
      setInvites([{ email: "", role: RoleViewerID }]);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } catch (error) {
      let message = "Something went wrong. Try again later";

      if (axios.isAxiosError(error)) {
        message = error?.response?.data?.error || message;
      }

      setError(message);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 p-4 text-foreground sm:space-y-6 sm:p-6">
        {/* Header */}
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold sm:text-xl">
              Invite Team Members
            </h2>
            <p className="mt-1 text-sm leading-6 text-foreground/60">
              Send invitations to add new members to your organization.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close invite members modal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/60 transition hover:bg-accent hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error/success */}
        {error && (
          <div className="break-words rounded-lg bg-red-500/20 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}
        {success && (
          <div className="break-words rounded-lg bg-green-600/20 px-3 py-2.5 text-sm text-success">
            Invitations sent!
          </div>
        )}

        {/* Invite List */}
        {invites.map((invite, index) => (
          <div
            key={index}
            className="min-w-0 space-y-4 border-b border-border/10 pb-4"
          >
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-foreground/80">
                Email Address
              </label>
              <div className="mt-1 flex h-11 min-w-0 items-center gap-2 rounded-xl border border-border bg-background px-3 focus-within:ring-2 focus-within:ring-primary/40">
                <Mail size={16} className="text-foreground/50" />
                <input
                  type="email"
                  value={invite.email}
                  onChange={(e) => updateInvite(index, "email", e.target.value)}
                  placeholder="colleague@example.com"
                  className="min-w-0 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoComplete="off"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Roles */}
            <div>
              <label className="text-sm text-foreground/80">Role</label>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                {roles.map((role) => (
                  <button
                    key={role.key}
                    onClick={() => updateInvite(index, "role", role.key)}
                    type="button"
                    disabled={isLoading}
                    className={`min-w-0 rounded-xl border p-3 text-left transition sm:p-4 ${
                      invite.role === role.key
                        ? "border-primary bg-primary/10"
                        : "border-foreground/10 hover:border-foreground/30"
                    }`}
                  >
                    <p className="font-medium text-foreground">{role.title}</p>
                    <p className="mt-1 text-xs leading-5 text-foreground/60">
                      {role.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Remove */}
            {invites.length > 1 && (
              <button
                type="button"
                onClick={() => removeInvite(index)}
                className="inline-flex min-h-9 items-center rounded-lg px-2 text-xs font-medium text-destructive transition hover:bg-destructive/10"
                disabled={isLoading}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        {/* Add another */}
        <button
          type="button"
          onClick={addInvite}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-foreground/40 px-3 py-2.5 text-sm text-foreground/70 transition hover:border-foreground/60 hover:bg-accent/40 hover:text-foreground"
          disabled={isLoading}
        >
          <UserPlus size={16} />
          Add Another Member
        </button>

        {/* Footer */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
          <p className="text-sm text-foreground/50">
            {invites.length} invitation(s) ready
          </p>

          <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:gap-3">
            <button
              onClick={onClose}
              className="h-11 w-full rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-foreground/5 sm:h-10 sm:w-auto"
              type="button"
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              className="flex h-11 w-full items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white transition hover:bg-primary/90 sm:h-10 sm:w-auto"
              type="button"
              onClick={handleSendInvitations}
              disabled={isLoading || invites.length === 0}
            >
              {isLoading ? (
                <svg
                  className="animate-spin mr-2 h-4 w-4 text-white/80"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
              ) : null}
              Send Invitations
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
