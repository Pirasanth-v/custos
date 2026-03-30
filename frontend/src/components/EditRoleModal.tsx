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
      <div className="p-6 space-y-6 text-foreground">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">Edit Role</h2>
            <p className="text-sm text-foreground/60 mt-1">
              Update role for{" "}
              <span className="font-medium text-foreground">
                {member.first_name} {member.last_name}
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground"
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
        <div className="grid grid-cols-2 gap-3">
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
                className={`relative text-left rounded-xl border p-4 transition ${
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
                  <div className="absolute top-2 right-2 text-xs text-primary font-medium">
                    Current
                  </div>
                )}

                <p className="font-medium">{role.name}</p>
                <p className="text-xs text-foreground/60 mt-1">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 h-10 rounded-lg border border-foreground/10 hover:bg-foreground/5"
          >
            Cancel
          </button>

          <button
            disabled={!hasChanged}
            onClick={() => selectedRole && onSave(selectedRole)}
            className={`px-5 h-10 rounded-lg text-white font-medium transition ${
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
