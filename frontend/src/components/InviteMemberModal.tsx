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
import { toast } from "@/lib/toast";

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
      toast.success("Invitations sent!");
      // Optionally: clear invites/reset to single input
      setInvites([{ email: "", role: RoleViewerID }]);
      onClose();
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
      <div className="p-6 space-y-6 text-foreground">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Invite Team Members</h2>
            <p className="text-sm text-foreground/60 mt-1">
              Send invitations to add new members to your organization.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error/success */}
        {error && (
          <div className="bg-red-500/20 text-destructive px-3 py-2 rounded text-sm">
            {error}
          </div>
        )}

        {/* Invite List */}
        {invites.map((invite, index) => (
          <div key={index} className="space-y-4 border-b border-border/10 pb-4">
            {/* Email */}
            <div>
              <label className="text-sm text-foreground/80">
                Email Address
              </label>
              <div className="mt-1 flex items-center gap-2 border border-border rounded-lg px-3 h-11 bg-background focus-within:ring-2 focus-within:ring-primary">
                <Mail size={16} className="text-foreground/50" />
                <input
                  type="email"
                  value={invite.email}
                  onChange={(e) => updateInvite(index, "email", e.target.value)}
                  placeholder="colleague@example.com"
                  className="bg-transparent outline-none w-full text-sm"
                  autoComplete="off"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Roles */}
            <div>
              <label className="text-sm text-foreground/80">Role</label>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {roles.map((role) => (
                  <button
                    key={role.key}
                    onClick={() => updateInvite(index, "role", role.key)}
                    type="button"
                    disabled={isLoading}
                    className={`text-left rounded-xl border p-3 transition ${
                      invite.role === role.key
                        ? "border-primary bg-primary/10"
                        : "border-foreground/10 hover:border-foreground/30"
                    }`}
                  >
                    <p className="font-medium">{role.title}</p>
                    <p className="text-xs text-foreground/60 mt-1">
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
                className="text-xs text-destructive hover:text-destructive"
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
          className="w-full border border-dashed border-foreground/40 rounded-lg py-3 text-sm text-foreground/70 hover:border-foreground/60 hover:text-foreground flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <UserPlus size={16} />
          Add Another Member
        </button>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4">
          <p className="text-sm text-foreground/50">
            {invites.length} invitation(s) ready
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 h-10 rounded-lg border border-border hover:bg-foreground/5"
              type="button"
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              className="px-5 h-10 rounded-lg bg-primary hover:bg-primary/90 font-medium text-white flex items-center"
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
