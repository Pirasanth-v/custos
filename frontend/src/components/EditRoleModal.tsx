import Modal from "./ui/modal";
import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import {
  RoleAdminID,
  RoleMemberID,
  RoleOwnerID,
  RoleViewerID,
} from "@/features/roles/types";
import type { Member } from "@/features/organizationMembers/types";
import StatusMessage from "./StatusMessage";

type Role = {
  id: string;
  name: string;
  description: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (roleId: string) => void;
  err: string | null;
};

const roles: Role[] = [
  {
    id: RoleOwnerID,
    name: "Admin",
    description: "Full access to all features",
  },
  {
    id: RoleAdminID,
    name: "Manager",
    description: "Can manage transactions and budgets",
  },
  {
    id: RoleMemberID,
    name: "Member",
    description: "Can manage financial records",
  },
  {
    id: RoleViewerID,
    name: "Viewer",
    description: "Read-only access",
  },
];

export default function EditRoleModal({
  open,
  onClose,
  member,
  onSave,
  err,
}: Props) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // set initial role
  useEffect(() => {
    if (member) {
      setTimeout(() => setSelectedRole(member.role_id), 0);
    }
  }, [member]);

  if (!member) return null;

  const hasChanged = selectedRole !== member.role_id;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="space-y-5 p-4 text-foreground sm:space-y-6 sm:p-6">
        {/* Header */}
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold sm:text-xl">Edit Role</h2>
            <p className="mt-1 break-words text-sm leading-6 text-foreground/60">
              Update role for{" "}
              <span className="font-medium text-foreground">
                {member.first_name} {member.last_name}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit role modal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-foreground/60 transition hover:bg-accent hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        {err && (
          <StatusMessage
            type="error"
            message={err}
            compact
            onClose={() => {}}
          />
        )}

        {/* Role Selection */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
          {roles.map((role) => {
            const isCurrent = member.role_id === role.id;
            const isSelected = selectedRole === role.id;

            return (
              <button
                key={role.id}
                type="button"
                disabled={isCurrent}
                onClick={() => {
                  if (!isCurrent) setSelectedRole(role.id);
                }}
                className={`relative min-w-0 rounded-xl border p-3 text-left transition sm:p-4 ${
                  isCurrent
                    ? "border-primary bg-primary/10 opacity-70 cursor-not-allowed"
                    : isSelected
                      ? "border-primary bg-primary/10"
                      : "border-foreground/10 hover:border-foreground/30"
                }`}
              >
                {isSelected && !isCurrent && (
                  <div className="absolute top-2 right-2 text-primary">
                    <Check size={16} />
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute right-2 top-2 whitespace-nowrap text-xs font-medium text-primary">
                    Current
                  </div>
                )}

                <p className="break-words pr-16 font-medium text-foreground">
                  {role.name}
                </p>
                <p className="mt-1 text-xs leading-5 text-foreground/60">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3 sm:pt-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full rounded-xl border border-foreground/10 px-4 text-sm font-medium transition hover:bg-foreground/5 sm:h-10 sm:w-auto"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!hasChanged}
            onClick={() => selectedRole && onSave(selectedRole)}
            className={`h-11 w-full rounded-xl px-5 text-sm font-medium text-white transition sm:h-10 sm:w-auto ${
              hasChanged
                ? "bg-primary hover:bg-primary/90"
                : "bg-primary/30 cursor-not-allowed"
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
}
